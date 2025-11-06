import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { incidentSchema } from './schemas/incident';
import { firestoreIncidentSchema, type Activity } from './schemas/firestore-incident';
import { mapIncidentToFirestore } from './utils/mappers';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

const notificationSchema = z.object({
  appName: z.string().optional(),
  receivedAt: z.string().optional(),
  receivedAtEpoch: z.string().optional(),
  title: z.string().optional(),
  message: z.string(),
  source: z.string().optional(),
});

export const ingress = onRequest(
  {
    cors: true,
    memory: '512MiB',
    timeoutSeconds: 60,
    secrets: ['OPENROUTER_API_KEY'],
    region: 'us-central1',
  },
  async (request, response) => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
      }

      const notification = notificationSchema.parse(request.body);

      if (!notification.message || notification.message.trim().length === 0) {
        response.status(400).json({ error: 'Message field is required and cannot be empty' });
        return;
      }

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
        specificationVersion: 'v2',
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
      const firestoreIncident = mapIncidentToFirestore(parsedIncident, notification.receivedAt);

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
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
