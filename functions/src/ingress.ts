import { getFirestore, Timestamp, DocumentData } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { incidentSchema } from './ingress-schemas/incident';
import { firestoreIncidentSchema } from './ingress-schemas/firestore-incident';
import { mapIncidentToFirestore } from './ingress-utils/mappers';
import { fetchWeatherForLocation } from './ingress-utils/weather';
import { Client } from '@googlemaps/google-maps-services-js';
import express from 'express';
import type { CounterData, RequestWithRawBody, ExistingIncidentData, ParsedIncident, GenerateObjectResult, ErrorWithStatus } from './ingress-types';
import { isExistingIncidentData, isGenerateObjectResult, isErrorWithStatus } from './ingress-types';
import { trackDepartmentCodes } from './utils/track-department-codes';

let db: ReturnType<typeof getFirestore> | null = null;
const getDb = () => {
  if (!db) db = getFirestore();
  return db;
};
const mapsClient = new Client({});
const secretManagerClient = new SecretManagerServiceClient();

function isCounterData(data: DocumentData | undefined): data is CounterData {
  return data !== undefined && typeof data.next === 'number';
}

async function allocateNextDisplayNumber(): Promise<number> {
  const counterRef = getDb().collection('_counters').doc('incident-display-numbers');
  let newNumber = 0;
  await getDb().runTransaction(async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const startFrom = 7000000;
    if (counterSnap.exists) {
      const data = counterSnap.data();
      if (isCounterData(data)) {
        newNumber = data.next + 1;
      } else {
        newNumber = startFrom;
      }
    } else {
      newNumber = startFrom;
    }
    tx.set(counterRef, { next: newNumber, updatedAt: Timestamp.now() }, { merge: true });
  });
  return newNumber;
}

let cachedWebhookSecret: string | null = null;
let secretCacheExpiry = 0;
const SECRET_CACHE_TTL = 60 * 60 * 1000;

async function getWebhookSecret(): Promise<string> {
  if (cachedWebhookSecret && Date.now() < secretCacheExpiry) {
    return cachedWebhookSecret;
  }

  try {
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
    
    if (!projectId) {
      throw new Error('Project ID not configured. Set GCLOUD_PROJECT or GCP_PROJECT');
    }

    const secretName = '4axe-com_webhook';
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

    console.log(`[Ingress] Retrieving secret: ${name}`);

    const [version] = await secretManagerClient.accessSecretVersion({ name });
    const secretValue = version.payload?.data?.toString() || '';

    if (!secretValue) {
      throw new Error(`Secret ${secretName} is empty`);
    }

    cachedWebhookSecret = secretValue.trim();
    secretCacheExpiry = Date.now() + SECRET_CACHE_TTL;

    console.log(`[Ingress] Secret retrieved and cached successfully`);
    return cachedWebhookSecret;
  } catch (error) {
    console.error('[Ingress] Failed to retrieve secret from Secret Manager:', error);
    throw error;
  }
}

async function authenticateRequest(authHeader?: string, webhookToken?: string, bodyAuthToken?: string): Promise<boolean> {
  try {
    const expectedSecret = await getWebhookSecret();

    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token === expectedSecret) {
        return true;
      }
    }

    if (webhookToken && webhookToken.trim() === expectedSecret) {
      return true;
    }

    if (bodyAuthToken && bodyAuthToken.trim() === expectedSecret) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Ingress] Authentication error:', error);
    return false;
  }
}

const notificationSchema = z.object({
  appName: z.string().optional(),
  receivedAt: z.string().optional(),
  receivedAtEpoch: z.string().optional(),
  title: z.string().optional(),
  message: z.string(),
  source: z.string().optional(),
  authToken: z.string().optional(),
}).passthrough();

function tryFixJson(jsonString: string): object | null {
  try {
    return JSON.parse(jsonString);
  } catch {
    try {
      let fixed = jsonString.replace(/"([^"]+)"\s*:\s*([A-Za-z_][A-Za-z0-9_]*)(\s*)([,}])/g, '"$1": "$2"$3$4');
      return JSON.parse(fixed);
    } catch {
      try {
        let fixed = jsonString.replace(/:(\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*)([,}])/g, ':$1"$2"$3$4');
        return JSON.parse(fixed);
      } catch {
        try {
          const messageMatch = jsonString.match(/"message"\s*:\s*"([^"]*)"/) || 
                              jsonString.match(/"message"\s*:\s*([^,}]+)/);
          const sourceMatch = jsonString.match(/"source"\s*:\s*"([^"]*)"/) || 
                             jsonString.match(/"source"\s*:\s*([A-Za-z_][A-Za-z0-9_]*)/);
          const titleMatch = jsonString.match(/"title"\s*:\s*"([^"]*)"/) || 
                            jsonString.match(/"title"\s*:\s*([^,}]+)/);
          
          if (messageMatch) {
            const message = messageMatch[1]?.replace(/^"|"$/g, '').trim() || 
                           messageMatch[2]?.trim() || '';
            const source = sourceMatch?.[1]?.replace(/^"|"$/g, '').trim() || 
                          sourceMatch?.[2]?.trim() || 
                          'Emergency_Alerts';
            const title = titleMatch?.[1]?.replace(/^"|"$/g, '').trim() || 
                         titleMatch?.[2]?.trim() || undefined;
            
            return {
              message,
              source,
              ...(title && { title }),
              receivedAt: new Date().toISOString(),
            };
          }
        } catch {}
      }
    }
  }
  return null;
}

async function ingressHandler(request: RequestWithRawBody, response: express.Response) {
  try {
    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed. Use POST.' });
      return;
    }

    let body = request.body;
    
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      const rawBodyStr = request.rawBody?.toString('utf8') || '';
      
      if (rawBodyStr) {
        const fixed = tryFixJson(rawBodyStr);
        if (fixed) {
          body = fixed;
        } else {
          body = {
            message: rawBodyStr,
            source: request.headers['x-source'] || 'Emergency_Alerts',
            receivedAt: new Date().toISOString(),
          };
        }
      }
    }
    
    if (typeof body === 'string') {
      const fixed = tryFixJson(body);
      if (fixed) {
        body = fixed;
      } else {
        console.warn('[Ingress] Invalid JSON received, treating as raw message:', body.substring(0, 100));
        body = {
          message: body,
          source: request.headers['x-source'] || 'Emergency_Alerts',
          receivedAt: new Date().toISOString(),
        };
      }
    }
    
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      console.warn('[Ingress] Invalid body format, creating default structure');
      body = {
        message: typeof body === 'string' ? body : JSON.stringify(body) || 'No message provided',
        source: request.headers['x-source'] || 'Emergency_Alerts',
        receivedAt: new Date().toISOString(),
      };
    }

      const notification = notificationSchema.parse(body);

      const authHeaderValue = request.headers.authorization;
      const authHeader = Array.isArray(authHeaderValue) ? authHeaderValue[0] : authHeaderValue;
      const webhookTokenValue = request.headers['x-webhook-token'];
      const webhookToken = Array.isArray(webhookTokenValue) ? webhookTokenValue[0] : webhookTokenValue;
      const isAuthenticated = await authenticateRequest(authHeader, webhookToken, notification.authToken);
      
      if (!isAuthenticated) {
        console.warn('[Ingress] Unauthorized request attempt');
        response.status(401).json({ error: 'Unauthorized. Invalid or missing authentication token.' });
        return;
      }

      if (!notification.message || notification.message.trim().length === 0) {
        response.status(400).json({ error: 'Message field is required and cannot be empty' });
        return;
      }

      console.log('[Ingress] Authenticated request received from:', notification.source || 'unknown');

      const apiKey = process.env.OPENROUTER_API_KEY_EMU;
      if (!apiKey) {
        response.status(500).json({
          error: 'OPENROUTER_API_KEY_EMU secret is not configured',
        });
        return;
      }

      const openrouter = createOpenRouter({
        apiKey,
      });

      const model = openrouter('meta-llama/llama-3.2-3b-instruct');

      const result = await generateObject({
        model,
        schema: incidentSchema,
        prompt: `You are an expert at parsing emergency notification messages and formatting them beautifully for display.

Your task is to parse the following emergency notification message and extract structured incident data with beautiful formatting.

EMERGENCY NOTIFICATION MESSAGE:
${notification.message}

EXTRACTION REQUIREMENTS:
Extract all available information from the message. The message may contain:
• Incident type (e.g., Fall Victim, Proximity Alert, Apparatus Accident, Fire, Medical Emergency)
• Location details: state (abbreviation), county, city, and street address
• Distance (for proximity alerts, in miles)
• Detailed description of what happened
• Emergency services status (often abbreviated)
• Incident ID (may include # symbol)
• Source/reference information
• Timestamp or time information

FORMATTING REQUIREMENTS (CRITICAL - ALL FIELDS MUST BE BEAUTIFULLY FORMATTED):

1. **Type Field**:
   - Use proper title case and clear, descriptive wording
   - Example: "Fall Victim" → "Fall Victim Incident"
   - Example: "Proximity Alert" → "Proximity Alert"
   - Example: "Apparatus Accident" → "Apparatus Accident"

2. **Location Fields**:
   - State: Keep as abbreviation (e.g., "NJ", "NY", "CA")
   - County: Proper title case (e.g., "Monmouth County", "Hudson County")
   - City: Proper title case (e.g., "Fair Haven", "Union City")
   - Address: Clean formatting (e.g., "19 Highland Ave", "132 41st St")

3. **Description Field**:
   - Expand all abbreviations to full, readable text
   - Use proper grammar, punctuation, and capitalization
   - Make it flow naturally as a complete sentence
   - Common abbreviations to expand:
     • "PD O/S" → "Police Department on scene"
     • "FD O/S" → "Fire Department on scene"
     • "EMS O/S" → "Emergency Medical Services on scene"
     • "O/S" → "on scene"
     • "PD off" → "Police Department cleared"
     • "25-30 feet" → "25 to 30 feet"
   - Example: "PD O/S with a subject fell 25-30 feet out of a tree, conscious and alert" 
     → "Police Department on scene with a subject who fell 25 to 30 feet out of a tree, conscious and alert"

4. **Emergency Services Status**:
   - Convert abbreviations to full, professional, readable text
   - Examples:
     • "PD O/S" → "Police Department On Scene"
     • "PD off" → "Police Department Cleared"
     • "FD O/S" → "Fire Department On Scene"
     • "EMS O/S" → "Emergency Medical Services On Scene"
     • "safety 1" → "Safety 1"

5. **Incident ID**:
   - Remove or keep the # symbol consistently
   - Format as: "1835340" or "#1835340"

6. **Source**:
   - Keep as-is, but ensure clean formatting

OUTPUT REQUIREMENTS:
- All fields must be beautifully formatted and ready for display
- Use proper grammar, punctuation, and capitalization throughout
- Expand abbreviations naturally into full, readable text
- If a field is not present in the message, omit it (use optional fields)
- Maintain accuracy - don't add information that isn't in the message
- Format all text to be professional and easy to read

Now parse and format the message according to these requirements.`,
        temperature: 0.1,
      });

      const parsedIncident = result.object;
      
      let lat = parsedIncident.latitude;
      let lng = parsedIncident.longitude;
      
      if (!lat || !lng) {
        try {
          const fullAddress = `${parsedIncident.address}, ${parsedIncident.city}, ${parsedIncident.state}`;
          const apiKey = process.env.GOOGLE_MAPS_API_KEY;
          
          if (apiKey) {
            const geocodeResponse = await mapsClient.geocode({
              params: {
                address: fullAddress,
                key: apiKey,
              },
            });
            
            if (geocodeResponse.data.results.length > 0) {
              const location = geocodeResponse.data.results[0].geometry.location;
              lat = location.lat;
              lng = location.lng;
              console.log(`[Ingress] Geocoded address: ${fullAddress} -> ${lat}, ${lng}`);
            }
          }
        } catch (error) {
          console.warn('[Ingress] Geocoding failed, continuing without coordinates:', error);
        }
      }
      
      let weatherInfo = null;
      if (lat && lng) {
        try {
          weatherInfo = await fetchWeatherForLocation(
            lat,
            lng,
            `${parsedIncident.address}, ${parsedIncident.city}, ${parsedIncident.state}`
          );
        } catch (error) {
          console.warn('[Ingress] Weather fetch failed, continuing without weather:', error);
        }
      }
      
      const firestoreIncident = mapIncidentToFirestore(
        parsedIncident,
        notification.receivedAt,
        weatherInfo
      );

      const validatedIncident = firestoreIncidentSchema.parse(firestoreIncident);

      let incidentDocId: string;
      let isUpdate = false;
      let displayNumber: number;

      let macroDroidId: string | undefined = validatedIncident.incidentId;
      if (macroDroidId) {
        macroDroidId = macroDroidId.replace('#', '').trim();
      }

      if (!macroDroidId && notification.message) {
        const idMatch = notification.message.match(/#?(\d{6,})/);
        if (idMatch) {
          macroDroidId = idMatch[1];
        }
      }

      if (macroDroidId) {
        incidentDocId = macroDroidId;

        const incidentRef = getDb().collection('incidents').doc(incidentDocId);
        const existingDoc = await incidentRef.get();

        if (existingDoc.exists) {
          isUpdate = true;
          const existingData = existingDoc.data();
          
          displayNumber = isExistingIncidentData(existingData) && typeof existingData.incidentNumber === 'number'
            ? existingData.incidentNumber
            : await allocateNextDisplayNumber();
          
          const updatesSnapshot = await incidentRef.collection('updates').get();
          const existingMessages: string[] = [];
          
          updatesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.lastMessage) {
              existingMessages.push(data.lastMessage);
            }
          });

          const currentMessage = notification.message || validatedIncident.description || '';
          existingMessages.push(currentMessage);

          const updateDocData: Record<string, unknown> = {
            lastMessage: currentMessage,
            lastTitle: notification.title || validatedIncident.type || '',
            lastType: validatedIncident.type || null,
            lastTS: Timestamp.now(),
            lat: validatedIncident.latitude || null,
            lng: validatedIncident.longitude || null,
            stage: 'update',
            source: notification.source || validatedIncident.source || 'ingress',
            state: validatedIncident.state || null,
            city: validatedIncident.city || null,
            address: validatedIncident.address || null,
            updateCount: updatesSnapshot.docs.length + 1,
            firstSeenAt: existingData?.createdAt || Timestamp.now(),
            lastSeenAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            updatesText: existingMessages.join('. '),
          };

          if (validatedIncident.latitude && validatedIncident.longitude) {
            updateDocData.geocodedAt = new Date().toISOString();
          }

          await incidentRef.collection('updates').add(updateDocData);

          await incidentRef.update({
            updatedAt: Timestamp.now(),
            lastMessage: currentMessage,
            lastTitle: notification.title || validatedIncident.type || '',
            lastType: validatedIncident.type || null,
            lastTS: Timestamp.now(),
            lat: validatedIncident.latitude || null,
            lng: validatedIncident.longitude || null,
            stage: 'update',
          });
        } else {
          isUpdate = false;
          displayNumber = await allocateNextDisplayNumber();
          
          const now = Timestamp.now();
          const incidentData: Record<string, unknown> = {
            ...validatedIncident,
            id: macroDroidId,
            incidentId: macroDroidId,
            incidentNumber: displayNumber,
            createdAt: now,
            updatedAt: now,
            lastMessage: notification.message || validatedIncident.description || '',
            lastTitle: notification.title || validatedIncident.type || '',
            lastType: validatedIncident.type || null,
            lastTS: now,
            lat: validatedIncident.latitude || null,
            lng: validatedIncident.longitude || null,
            stage: 'create',
            source: notification.source || validatedIncident.source || 'ingress',
            updateCount: 0,
          };

          await incidentRef.set(incidentData);

          const firstUpdateData: Record<string, unknown> = {
            lastMessage: notification.message || validatedIncident.description || '',
            lastTitle: notification.title || validatedIncident.type || '',
            lastType: validatedIncident.type || null,
            lastTS: now,
            lat: validatedIncident.latitude || null,
            lng: validatedIncident.longitude || null,
            stage: 'create',
            source: notification.source || validatedIncident.source || 'ingress',
            state: validatedIncident.state || null,
            city: validatedIncident.city || null,
            address: validatedIncident.address || null,
            updateCount: 1,
            firstSeenAt: now,
            lastSeenAt: now,
            updatedAt: now,
            updatesText: notification.message || validatedIncident.description || '',
          };

          if (validatedIncident.latitude && validatedIncident.longitude) {
            firstUpdateData.geocodedAt = new Date().toISOString();
          }

          await incidentRef.collection('updates').add(firstUpdateData);
        }
      } else {
        displayNumber = await allocateNextDisplayNumber();
        const now = Timestamp.now();
        
        const incidentData: Record<string, unknown> = {
          ...validatedIncident,
          incidentNumber: displayNumber,
          createdAt: now,
          updatedAt: now,
        };

        const docRef = await getDb().collection('incidents').add(incidentData);
        incidentDocId = docRef.id;
      }

      response.status(200).json({
        success: true,
        data: parsedIncident,
        firestore: {
          id: incidentDocId,
          action: isUpdate ? 'updated' : 'created',
        },
        notification: {
          appName: notification.appName,
          receivedAt: notification.receivedAt,
          title: notification.title,
          source: notification.source,
        },
      });
    } catch (error) {
      console.error('Error parsing incident:', error);

      if (error instanceof z.ZodError) {
        response.status(400).json({
          error: 'Invalid request body',
          details: error.errors,
        });
        return;
      }

      response.status(500).json({
        error: 'Failed to parse incident data',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
}

const ingressApp = express();

ingressApp.use(express.json({
  strict: false,
  verify: (req: RequestWithRawBody, res, buf) => {
    req.rawBody = buf;
  },
}));

ingressApp.use((error: unknown, req: RequestWithRawBody, res: express.Response, next: express.NextFunction) => {
  if (isErrorWithStatus(error) && error.status === 400) {
    console.warn('[Ingress] JSON parsing error from body-parser, attempting recovery:', error.message);
    
    const rawBody = req.rawBody?.toString('utf8') || '';
    
    if (rawBody) {
      const fixed = tryFixJson(rawBody);
      if (fixed) {
        req.body = fixed;
        return next();
      } else {
        req.body = {
          message: rawBody,
          source: req.headers['x-source'] || 'Emergency_Alerts',
          receivedAt: new Date().toISOString(),
        };
        return next();
      }
    }
    
    res.status(400).json({
      error: 'Invalid JSON format',
      message: 'The request body could not be parsed as JSON. Please ensure MacroDroid variables are properly replaced and all string values are quoted.',
      hint: 'Check that values like "source": Emergency_Alerts are quoted as "source": "Emergency_Alerts"',
      details: error.message,
    });
    return;
  }
  
  next(error);
});

ingressApp.post('/webhook', async (req: express.Request, res: express.Response) => {
  try {
    const body = req.body ?? {};
    const bodyMessage: unknown = typeof body === 'string' ? body : body?.message;
    const isSimple = typeof bodyMessage === 'string' && Object.keys(body ?? {}).length <= 2;
    const composedMessage =
      typeof bodyMessage === 'string'
        ? isSimple
          ? bodyMessage
          : [
              `App: ${body?.appName ?? ''}`.trim(),
              `Title: ${body?.title ?? ''}`.trim(),
              `Message: ${bodyMessage}`,
              body?.ticker ? `Ticker: ${body.ticker}` : '',
              body?.subText ? `SubText: ${body.subText}` : '',
              body?.infoText ? `InfoText: ${body.infoText}` : '',
              body?.receivedAtEpoch ? `ReceivedAt(ms): ${body.receivedAtEpoch}` : '',
            ]
              .filter(Boolean)
              .join('\n')
        : undefined;

    if (!composedMessage) {
      return res.status(400).json({ error: 'Missing message string' });
    }

    console.log('[Webhook V2] Composed message:', composedMessage);
    console.log('[Webhook V2] Message length:', composedMessage.length);

    const v2IncidentSchema = z.object({
      incidentId: z.string().optional(),
      source: z.string().optional(),
      state: z.string().describe('State abbreviation extracted from message (e.g., "PA", "NJ", "NY")').optional(),
      county: z.string().describe('County name with "County" suffix (e.g., "Chester County", "Hudson County")').optional(),
      city: z.string().describe('City or township name (e.g., "East Fallowfield Township", "Kearny")').optional(),
      address: z.string().describe('Street address or intersection (e.g., "921 Buck Run Rd", "County Rd 508")').optional(),
      zipCode: z.string().optional(),
      country: z.string().optional().default('USA'),
      type: z.enum(['fire', 'flood', 'storm', 'accident', 'hazard', 'medical', 'other']).optional(),
      description: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      fireDepartmentInfo: z.string().optional(),
      departmentCodes: z.array(z.string()).optional(),
    });

    const apiKey = process.env.OPENROUTER_API_KEY_EMU;
    if (!apiKey) {
      console.error('[Webhook V2] OPENROUTER_API_KEY_EMU not found in process.env');
      return res.status(500).json({ error: 'OPENROUTER_API_KEY_EMU not configured' });
    }

    const provider = createOpenRouter({ apiKey });
    let parsed: ParsedIncident | undefined;
    try {
      console.log('[Webhook V2] === INPUT VALIDATION ===');
      console.log('[Webhook V2] Composed message:', composedMessage);
      console.log('[Webhook V2] Message length:', composedMessage.length);
      console.log('[Webhook V2] Has "at" keyword:', composedMessage.includes(' at '));
      console.log('[Webhook V2] Has "on" keyword:', composedMessage.includes(' on '));
      console.log('[Webhook V2] Ends with department code pattern:', /[a-z]{2}\d+\/[a-z]+\d+/.test(composedMessage) || /[a-z]{2}\d+\s+[a-z]+\d+/.test(composedMessage));
      
      const result = await generateObject({
        model: provider('anthropic/claude-3.5-sonnet'),
        schema: v2IncidentSchema,
        prompt: `Extract incident data from: ${composedMessage}

LOCATION (REQUIRED - Parse start of message):
Format: "STATE, COUNTY, CITY - [incident] at ADDRESS"
Examples:
- "PA, Chester, East Fallowfield Township - Working Fire Dispatch at 921 Buck Run Rd"
  → state="PA", county="Chester County", city="East Fallowfield Township", address="921 Buck Run Rd"
- "NJ, Hudson, Kearny - Water Main Break on County Rd 508"
  → state="NJ", county="Hudson County", city="Kearny", address="County Rd 508"

FIELDS:
1. incidentId: Extract number, remove # (e.g., "#1836125" → "1836125")
2. state: State abbreviation from start (PA, NJ, NY, etc.)
3. county: County name + "County" suffix (e.g., "Chester" → "Chester County")
4. city: City/township name (proper case)
5. address: Street address after "at" or "on" keywords
6. type: Map to: fire, flood, storm, accident, hazard, medical, other
7. description: Expand abbreviations, full readable text
8. severity: low/medium/high/critical (default: medium)
9. fireDepartmentInfo: Extract FD status/apparatus/command info (e.g., "Command is adding stations 24 and 25" → "Additional stations 24 and 25 requested by Command")
10. departmentCodes: Array of codes at end (e.g., "nj179/pas4795" → ["nj179/pas4795", "nj179", "pas4795"])

OUTPUT: Return ONLY a valid JSON object matching this exact structure:
{
  "incidentId": "1836125",
  "state": "PA",
  "county": "Chester County",
  "city": "East Fallowfield Township",
  "address": "921 Buck Run Rd",
  "type": "fire",
  "description": "Working fire dispatch reported...",
  "severity": "medium",
  "fireDepartmentInfo": "Additional stations requested",
  "departmentCodes": ["nj179/pas4795", "nj179", "pas4795"]
}

CRITICAL: Return ONLY valid JSON, no explanations or text.`,
        temperature: 0.1,
        maxRetries: 2,
      });
      console.log('[Webhook V2] === RAW AI RESPONSE ===');
      console.log('[Webhook V2] Full result object:', JSON.stringify(result, null, 2));
      
      parsed = result.object;
      
      if (!parsed && isGenerateObjectResult(result) && 'text' in result && typeof result.text === 'string') {
        console.log('[Webhook V2] Attempting to extract JSON from text response');
        const jsonMatch = result.text.match(/\{[\s\S]*?\}(?=\n|$)/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0].trim());
            console.log('[Webhook V2] Successfully extracted JSON from text');
          } catch (e) {
            console.error('[Webhook V2] Failed to parse extracted JSON:', e);
            throw new Error('Could not parse JSON from AI response');
          }
        }
      }
      
      if (!parsed) {
        throw new Error('No parsed object available from AI response');
      }
      
      console.log('[Webhook V2] === PARSED OUTPUT VALIDATION ===');
      console.log('[Webhook V2] Parsed object:', JSON.stringify(parsed, null, 2));
      console.log('[Webhook V2] Location extraction:');
      console.log('  - state:', parsed.state || 'NULL');
      console.log('  - county:', parsed.county || 'NULL');
      console.log('  - city:', parsed.city || 'NULL');
      console.log('  - address:', parsed.address || 'NULL');
      console.log('[Webhook V2] Department codes:', parsed.departmentCodes || 'NULL');
      console.log('[Webhook V2] Fire department info:', parsed.fireDepartmentInfo || 'NULL');
      console.log('[Webhook V2] Incident ID:', parsed.incidentId || 'NULL');
    } catch (aiError: unknown) {
      const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
      console.error('[Webhook V2] AI extraction failed:', errorMessage);
      console.error('[Webhook V2] Full error:', JSON.stringify(aiError, null, 2));
      
      function hasTextProperty(error: unknown): error is { text?: string; cause?: { text?: string } } {
        return typeof error === 'object' && error !== null;
      }
      
      if (hasTextProperty(aiError) && (aiError.text || aiError.cause?.text)) {
        const errorText = aiError.text || aiError.cause?.text || '';
        console.log('[Webhook V2] Attempting to extract JSON from error text');
        const jsonMatch = errorText.match(/\{[\s\S]*?\}(?=\n|$)/);
        if (jsonMatch) {
          try {
            const extracted = JSON.parse(jsonMatch[0].trim());
            console.log('[Webhook V2] Successfully extracted JSON from error text:', JSON.stringify(extracted, null, 2));
            parsed = extracted;
          } catch (e) {
            console.error('[Webhook V2] Failed to parse extracted JSON:', e);
            return res.status(500).json({ 
              error: 'AI extraction failed', 
              message: 'Could not parse JSON from AI response' 
            });
          }
        } else {
          return res.status(500).json({ 
            error: 'AI extraction failed', 
            message: errorMessage || 'Could not parse incident data from notification' 
          });
        }
      } else {
        return res.status(500).json({ 
          error: 'AI extraction failed', 
          message: errorMessage || 'Could not parse incident data from notification' 
        });
      }
    }
    
    if (!parsed) {
      console.error('[Webhook V2] parsed is undefined after all extraction attempts');
      return res.status(500).json({ 
        error: 'AI extraction failed', 
        message: 'Could not extract incident data from AI response' 
      });
    }

    const locationObj = (parsed.address || parsed.city || parsed.state) ? {
      address: parsed.address || null,
      city: parsed.city || null,
      state: parsed.state || null,
      zipCode: parsed.zipCode || null,
      country: parsed.country || 'USA',
      lat: 0,
      lng: 0,
    } : {
      address: null,
      city: null,
      state: null,
      zipCode: null,
      country: 'USA',
      lat: 0,
      lng: 0,
    };

    const bodySource: string | undefined = (typeof body === 'object' && body?.source) ? String(body.source) : undefined;
    const receivedAtMs: number | undefined =
      typeof body === 'object' && body?.receivedAtEpoch && !Number.isNaN(Number(body.receivedAtEpoch))
        ? Number(body.receivedAtEpoch)
        : undefined;
    const activityTimestamp = receivedAtMs ? Timestamp.fromMillis(receivedAtMs) : Timestamp.now();

    const preferredId = parsed.incidentId ? String(parsed.incidentId) : (receivedAtMs ? String(receivedAtMs) : undefined);

    let ref;
    let updated = false;

    if (preferredId) {
      ref = getDb().collection('incidents').doc(preferredId);
      const snap = await ref.get();
      if (snap.exists) {
        const existing = snap.data();
        
        if (!existing || !isExistingIncidentData(existing)) {
          return res.status(500).json({ error: 'Invalid existing data' });
        }
        
        const existingDescription = existing.description || '';
        const newDescription = parsed.description || '';
        const appendedDescription = existingDescription 
          ? `${existingDescription} • ${newDescription}`
          : newDescription;
        
        const existingOriginalText = existing.originalText || '';
        const appendedOriginalText = existingOriginalText
          ? `${existingOriginalText}\n\n---\n\n${composedMessage}`
          : composedMessage;
        
        const alertDate = activityTimestamp.toDate().toLocaleDateString();
        const alertTime = activityTimestamp.toDate().toLocaleTimeString();
        
        const updateData: Record<string, unknown> = {
          incidentId: parsed.incidentId ?? preferredId,
          state: parsed.state || existing.state || null,
          county: parsed.county || existing.county || null,
          city: parsed.city || existing.city || null,
          address: parsed.address || existing.address || null,
          zipCode: parsed.zipCode || existing.zipCode || null,
          country: parsed.country || existing.country || 'USA',
          type: parsed.type || existing.type || null,
          description: appendedDescription,
          alertType: parsed.type || existing.alertType || null,
          alertDate: alertDate,
          alertTime: alertTime,
          severity: parsed.severity || existing.severity || null,
          originalText: appendedOriginalText,
          fireDepartmentInfo: parsed.fireDepartmentInfo || existing.fireDepartmentInfo || null,
          departmentCodes: parsed.departmentCodes || existing.departmentCodes || null,
          createdAt: existing.createdAt ?? Timestamp.now(),
          updatedAt: Timestamp.now(),
          activity: [
            ...(existing.activity ?? []),
            {
              id: `${Date.now()}`,
              type: 'update',
              description: parsed.description || 'Updated via v2 webhook',
              timestamp: activityTimestamp,
              source: parsed.source ?? bodySource ?? 'webhook-v2',
            },
          ],
        };
        if (locationObj) {
          updateData.location = {
            ...locationObj,
            lat: existing.location?.lat ?? 0,
            lng: existing.location?.lng ?? 0,
          };
        } else if (existing.location) {
          updateData.location = {
            ...existing.location,
            lat: existing.location.lat ?? 0,
            lng: existing.location.lng ?? 0,
          };
        } else {
          updateData.location = {
            address: parsed.address || existing.address || null,
            city: parsed.city || existing.city || null,
            state: parsed.state || existing.state || null,
            zipCode: parsed.zipCode || existing.zipCode || null,
            country: parsed.country || existing.country || 'USA',
            lat: 0,
            lng: 0,
          };
        }
        await ref.set(updateData, { merge: true });
        updated = true;
        
        if (parsed.departmentCodes && parsed.departmentCodes.length > 0 && parsed.address && parsed.city && parsed.state) {
          await trackDepartmentCodes(
            parsed.incidentId || preferredId,
            parsed.departmentCodes,
            parsed.address,
            parsed.city,
            parsed.state,
            parsed.county,
            parsed.type || parsed.alertType
          );
        }
      } else {
        const alertDate = activityTimestamp.toDate().toLocaleDateString();
        const alertTime = activityTimestamp.toDate().toLocaleTimeString();
        
        const createData: Record<string, unknown> = {
          incidentId: parsed.incidentId ?? preferredId,
          state: parsed.state || null,
          county: parsed.county || null,
          city: parsed.city || null,
          address: parsed.address || null,
          zipCode: parsed.zipCode || null,
          country: parsed.country || 'USA',
          type: parsed.type || null,
          description: parsed.description,
          alertType: parsed.type || null,
          alertDate: alertDate,
          alertTime: alertTime,
          severity: parsed.severity || null,
          originalText: composedMessage,
          fireDepartmentInfo: parsed.fireDepartmentInfo || null,
          departmentCodes: parsed.departmentCodes || null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          activity: [{
            id: `${Date.now()}`,
            type: 'create',
            description: parsed.description || 'Created via v2 webhook',
            timestamp: activityTimestamp,
            source: parsed.source ?? bodySource ?? 'webhook-v2',
          }],
        };
        if (locationObj) {
          createData.location = locationObj;
        } else {
          createData.location = {
            address: parsed.address || null,
            city: parsed.city || null,
            state: parsed.state || null,
            zipCode: parsed.zipCode || null,
            country: parsed.country || 'USA',
            lat: 0,
            lng: 0,
          };
        }
        await ref.set(createData);
        
        if (parsed.departmentCodes && parsed.departmentCodes.length > 0 && parsed.address && parsed.city && parsed.state) {
          await trackDepartmentCodes(
            parsed.incidentId || preferredId,
            parsed.departmentCodes,
            parsed.address,
            parsed.city,
            parsed.state,
            parsed.county,
            parsed.type || parsed.alertType
          );
        }
      }
    } else {
      ref = getDb().collection('incidents').doc();
      const fallbackData: Record<string, unknown> = {
        state: parsed.state || null,
        county: parsed.county || null,
        city: parsed.city || null,
        address: parsed.address || null,
        zipCode: parsed.zipCode || null,
        country: parsed.country || 'USA',
        type: parsed.type || null,
        description: parsed.description,
        severity: parsed.severity || null,
        originalText: composedMessage,
        fireDepartmentInfo: parsed.fireDepartmentInfo || null,
        departmentCodes: parsed.departmentCodes || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        activity: [{
          id: `${Date.now()}`,
          type: 'create',
          description: parsed.description || 'Created via v2 webhook',
          timestamp: activityTimestamp,
          source: parsed.source ?? bodySource ?? 'webhook-v2',
        }],
      };
      if (locationObj) {
        fallbackData.location = locationObj;
      } else {
        fallbackData.location = {
          address: parsed.address || null,
          city: parsed.city || null,
          state: parsed.state || null,
          zipCode: parsed.zipCode || null,
          country: parsed.country || 'USA',
          lat: 0,
          lng: 0,
        };
      }
      await ref.set(fallbackData);
      
      if (parsed.departmentCodes && parsed.departmentCodes.length > 0 && parsed.address && parsed.city && parsed.state) {
        await trackDepartmentCodes(
          parsed.incidentId || ref.id,
          parsed.departmentCodes,
          parsed.address,
          parsed.city,
          parsed.state,
          parsed.county,
          parsed.type || parsed.alertType
        );
      }
    }

    return res.status(200).json({ id: ref.id, updated });
  } catch (e: unknown) {
    console.error('[Webhook V2] Error:', e);
    function hasErrors(error: unknown): error is { errors: unknown } {
      return typeof error === 'object' && error !== null && 'errors' in error;
    }
    if (hasErrors(e)) return res.status(400).json({ error: 'Validation failed', details: e.errors });
    const errorMessage = e instanceof Error ? e.message : 'unknown';
    return res.status(500).json({ error: 'Internal error', message: errorMessage });
  }
});

ingressApp.post('*', async (req: RequestWithRawBody, res: express.Response) => {
  return ingressHandler(req, res);
});

export const ingress = onRequest(
  {
    cors: true,
    memory: '512MiB',
    timeoutSeconds: 60,
    secrets: ['OPENROUTER_API_KEY_EMU'],
    region: 'us-central1',
  },
  ingressApp
);
