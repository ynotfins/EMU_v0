import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { randomUUID } from 'crypto';
import { incidentSchema } from './ingress-schemas/incident';
import { firestoreIncidentSchema, type Activity } from './ingress-schemas/firestore-incident';
import { mapIncidentToFirestore } from './ingress-utils/mappers';
import { fetchWeatherForLocation } from './ingress-utils/weather';
import { Client } from '@googlemaps/google-maps-services-js';

// Firebase Admin is initialized in index.ts, reuse the existing instance
const db = getFirestore();
const mapsClient = new Client({});
const secretManagerClient = new SecretManagerServiceClient();

// Cache for webhook secret
let cachedWebhookSecret: string | null = null;
let secretCacheExpiry: number = 0;
const SECRET_CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

/**
 * Retrieve webhook secret from Google Cloud Secret Manager
 */
async function getWebhookSecret(): Promise<string> {
  // Check cache first
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

    // Cache the secret
    cachedWebhookSecret = secretValue.trim();
    secretCacheExpiry = Date.now() + SECRET_CACHE_TTL;

    console.log(`[Ingress] Secret retrieved and cached successfully`);
    return cachedWebhookSecret;
  } catch (error) {
    console.error('[Ingress] Failed to retrieve secret from Secret Manager:', error);
    throw error;
  }
}

/**
 * Authenticate incoming webhook request
 */
async function authenticateRequest(authHeader?: string, webhookToken?: string, bodyAuthToken?: string): Promise<boolean> {
  try {
    const expectedSecret = await getWebhookSecret();

    // Check Authorization header (Bearer token)
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token === expectedSecret) {
        return true;
      }
    }

    // Check X-Webhook-Token header
    if (webhookToken && webhookToken.trim() === expectedSecret) {
      return true;
    }

    // Check request body authToken if provided
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
  authToken: z.string().optional(), // Optional: can be in header or body
});

export const ingress = onRequest(
  {
    cors: true,
    memory: '512MiB',
    timeoutSeconds: 60,
    secrets: ['OPENROUTER_API_KEY', 'GOOGLE_MAPS_API_KEY', 'OPENWEATHER_API_KEY'],
    region: 'us-central1',
  },
  async (request, response) => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
      }

      // Parse and validate notification
      const notification = notificationSchema.parse(request.body);

      // Authenticate request
      const authHeader = request.headers.authorization;
      const webhookToken = request.headers['x-webhook-token'] as string | undefined;
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

      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        response.status(500).json({
          error: 'OPENROUTER_API_KEY secret is not configured',
        });
        return;
      }

      const openrouter = createOpenRouter({
        apiKey,
      });

      const model = openrouter('meta-llama/llama-3.2-3b-instruct');

      // @ts-ignore - Type instantiation is excessively deep (TS2589) - known issue with OpenRouter provider types
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
      
      // Geocode address if lat/lng not provided
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
      
      // Fetch weather conditions if we have coordinates
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

      if (validatedIncident.incidentId) {
        const existingQuery = await db
          .collection('incidents')
          .where('incidentId', '==', validatedIncident.incidentId)
          .limit(1)
          .get();

        if (!existingQuery.empty) {
          incidentDocId = existingQuery.docs[0].id;
          isUpdate = true;

          const existingData = existingQuery.docs[0].data();
          validatedIncident.createdAt = existingData.createdAt;

          const existingActivity = (existingData.activity as Activity[]) || [];
          const newActivity: Activity = {
            id: randomUUID(),
            type: 'update',
            description: `Incident updated from notification: ${notification.title || 'Notification update'}`,
            timestamp: Timestamp.now(),
            source: notification.source || 'webhook',
          };

          validatedIncident.activity = [...existingActivity, newActivity];

          await db.collection('incidents').doc(incidentDocId).update(validatedIncident);
        } else {
          validatedIncident.createdAt = firestoreIncident.updatedAt;
          const initialActivity: Activity = {
            id: randomUUID(),
            type: 'created',
            description: `Incident created from notification: ${notification.title || 'New incident'}`,
            timestamp: Timestamp.now(),
            source: notification.source || 'webhook',
          };
          validatedIncident.activity = [initialActivity];

          const docRef = await db.collection('incidents').add(validatedIncident);
          incidentDocId = docRef.id;
        }
      } else {
        validatedIncident.createdAt = firestoreIncident.updatedAt;
        const initialActivity: Activity = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'created',
          description: `Incident created from notification: ${notification.title || 'New incident'}`,
          timestamp: Timestamp.now(),
          source: notification.source || 'webhook',
        };
        validatedIncident.activity = [initialActivity];

        const docRef = await db.collection('incidents').add(validatedIncident);
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
);
