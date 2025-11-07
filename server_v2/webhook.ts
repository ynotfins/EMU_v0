import express from 'express';
import cors from 'cors';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const incidentSchema = z.object({
  incidentId: z.string().optional(),
  source: z.string().optional(),
  state: z.string().optional(),
  county: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional().default('USA'),
  type: z.enum(['fire', 'flood', 'storm', 'accident', 'hazard', 'medical', 'other']).optional(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  fireDepartmentInfo: z.string().optional(),
  departmentCodes: z.array(z.string()).optional(),
});

type Incident = z.infer<typeof incidentSchema>;

const firestoreIncidentSchema = z.object({
  incidentId: z.string().optional(),
  location: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional().default('USA'),
  }).optional(),
  state: z.string().optional(),
  county: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional().default('USA'),
  type: z.string().optional(),
  description: z.string(),
  severity: z.string().optional(),
  originalText: z.string().optional(),
  fireDepartmentInfo: z.string().optional(),
  departmentCodes: z.array(z.string()).optional(),
  createdAt: z.union([z.instanceof(Timestamp), z.string(), z.number()]).optional(),
  updatedAt: z.union([z.instanceof(Timestamp), z.string(), z.number()]).optional(),
  activity: z.array(z.object({
    id: z.string(),
    type: z.enum(['create','update']),
    description: z.string(),
    timestamp: z.union([z.instanceof(Timestamp), z.string(), z.number()]),
    source: z.string().optional(),
  })).optional(),
});

type FirestoreIncident = z.infer<typeof firestoreIncidentSchema>;

if (getApps().length === 0) {
  initializeApp({ credential: applicationDefault() });
}
const db = getFirestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.post('/webhook', async (req, res) => {
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

    const provider = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('[Webhook] OPENROUTER_API_KEY not set, AI extraction will fail');
    }
    const { object: parsed } = await generateObject({
      model: provider('anthropic/claude-3.5-sonnet'),
      schema: incidentSchema,
      prompt: `Extract normalized incident fields from the notification below and return valid JSON.

Notification:
${composedMessage}

EXTRACTION REQUIREMENTS:
Extract all available information from the message. The message may contain:
• Incident type (e.g., Fall Victim, Proximity Alert, Apparatus Accident, Fire, Medical Emergency, Flood, Storm, Hazard)
• Location details: state (abbreviation like "NJ", "NY", "CA"), county (full name like "Monmouth County"), city (proper case), and street address
• ZIP code if mentioned
• Detailed description of what happened
• Emergency services status (often abbreviated)
• Incident ID (may include # symbol - extract just the number)
• Source/reference information
• Timestamp or time information

FORMATTING REQUIREMENTS (CRITICAL - ALL FIELDS MUST BE BEAUTIFULLY FORMATTED):

1. **Type Field**:
   - Map to one of: fire, flood, storm, accident, hazard, medical, other
   - Use proper title case and clear, descriptive wording
   - Example: "Fall Victim" → "medical"
   - Example: "Proximity Alert" → "hazard"
   - Example: "Apparatus Accident" → "accident"
   - Example: "Fire" → "fire"

2. **Location Fields**:
   - State: Keep as abbreviation (e.g., "NJ", "NY", "CA")
   - County: Proper title case with "County" suffix (e.g., "Monmouth County", "Hudson County")
   - City: Proper title case (e.g., "Fair Haven", "Union City")
   - Address: Clean formatting (e.g., "19 Highland Ave", "132 41st St")
   - ZIP: Extract if present, otherwise omit

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

4. **Severity**:
   - Infer from keywords: "critical", "urgent", "emergency" = "critical" or "high"
   - "routine", "minor" = "low"
   - Default to "medium" if unclear

5. **Incident ID**:
   - Extract numeric ID, remove # symbol if present
   - Format as plain string: "1835340" (not "#1835340")

6. **Fire Department Info**:
   - Extract any fire department status, response details, or apparatus information
   - Examples: "FD O/S" → "Fire Department on scene", "Engine 5 responding" → "Engine 5 responding"
   - Include any fire department units, apparatus, or response status mentioned
   - This field is for Supe app display only
   - If no fire department info is present, omit this field

7. **Department Codes** (CRITICAL):
   - Extract ALL department codes found at the end of alerts
   - Department codes typically appear at the very end of the message
   - Format: Usually lowercase state abbreviation + numbers, often separated by "/" or spaces
   - Examples: "nj179/pas4795", "nj179/njn3979", "nj179 pas4795", "nj179 njn3979"
   - Patterns to look for:
     • State abbreviation (nj, ny, pa, etc.) followed by numbers
     • Codes separated by "/" (e.g., "nj179/pas4795")
     • Codes separated by spaces (e.g., "nj179 pas4795")
     • May include additional codes after "/" (e.g., "pas4795", "njn3979")
   - Return as array of strings: ["nj179/pas4795", "nj179/njn3979"] or ["nj179", "pas4795", "njn3979"]
   - If codes are separated by "/", include both the full string AND individual parts
   - Example: "nj179/pas4795" → ["nj179/pas4795", "nj179", "pas4795"]
   - If no department codes found, return empty array or omit field

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

    const locationObj = (parsed.address || parsed.city || parsed.state) ? {
      address: parsed.address,
      city: parsed.city,
      state: parsed.state,
      zipCode: parsed.zipCode,
      country: parsed.country || 'USA',
    } : undefined;

    const mapped: FirestoreIncident = {
      incidentId: parsed.incidentId,
      location: locationObj,
      state: parsed.state,
      county: parsed.county,
      city: parsed.city,
      address: parsed.address,
      zipCode: parsed.zipCode,
      country: parsed.country || 'USA',
      type: parsed.type,
      description: parsed.description,
      severity: parsed.severity,
      originalText: composedMessage,
      fireDepartmentInfo: parsed.fireDepartmentInfo,
      departmentCodes: parsed.departmentCodes,
    };
    const data = firestoreIncidentSchema.parse(mapped);

    let ref;
    let updated = false;
    const bodySource: string | undefined = (typeof body === 'object' && body?.source) ? String(body.source) : undefined;
    const receivedAtMs: number | undefined =
      typeof body === 'object' && body?.receivedAtEpoch && !Number.isNaN(Number(body.receivedAtEpoch))
        ? Number(body.receivedAtEpoch)
        : undefined;
    const activityTimestamp = receivedAtMs ? Timestamp.fromMillis(receivedAtMs) : Timestamp.now();

    const preferredId =
      (data.incidentId && String(data.incidentId)) ||
      (receivedAtMs ? String(receivedAtMs) : undefined);

    if (preferredId) {
      ref = db.collection('incidents').doc(preferredId);
      const snap = await ref.get();
      if (snap.exists) {
        const existing = snap.data();
        
        function isExistingData(data: unknown): data is { createdAt?: unknown; activity?: unknown[] } {
          return typeof data === 'object' && data !== null;
        }
        
        if (!isExistingData(existing)) {
          return res.status(500).json({ error: 'Invalid existing data' });
        }
        
        await ref.set({
          ...data,
          incidentId: data.incidentId ?? preferredId,
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
        }, { merge: true });
        updated = true;
      } else {
        await ref.set({
          ...data,
          incidentId: data.incidentId ?? preferredId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          activity: [{
            id: `${Date.now()}`,
            type: 'create',
            description: parsed.description || 'Created via v2 webhook',
            timestamp: activityTimestamp,
            source: parsed.source ?? bodySource ?? 'webhook-v2',
          }],
        });
      }
    } else {
      ref = db.collection('incidents').doc();
      await ref.set({
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        activity: [{
          id: `${Date.now()}`,
          type: 'create',
          description: 'Created via v2 webhook',
          timestamp: activityTimestamp,
          source: parsed.source ?? bodySource ?? 'webhook-v2',
        }],
      });
    }

    return res.status(200).json({ id: ref.id, updated });
  } catch (e: unknown) {
    function hasErrors(error: unknown): error is { errors: unknown } {
      return typeof error === 'object' && error !== null && 'errors' in error;
    }
    if (hasErrors(e)) return res.status(400).json({ error: 'Validation failed', details: e.errors });
    const errorMessage = e instanceof Error ? e.message : 'unknown';
    return res.status(500).json({ error: 'Internal error', message: errorMessage });
  }
});

export default app;


