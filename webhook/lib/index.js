"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingress = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const ai_1 = require("ai");
const ai_sdk_provider_1 = require("@openrouter/ai-sdk-provider");
const zod_1 = require("zod");
const incident_1 = require("./schemas/incident");
const firestore_incident_1 = require("./schemas/firestore-incident");
const mappers_1 = require("./utils/mappers");
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
const notificationSchema = zod_1.z.object({
    appName: zod_1.z.string().optional(),
    receivedAt: zod_1.z.string().optional(),
    receivedAtEpoch: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    message: zod_1.z.string(),
    source: zod_1.z.string().optional(),
});
exports.ingress = (0, https_1.onRequest)({
    cors: true,
    memory: '512MiB',
    timeoutSeconds: 60,
    secrets: ['OPENROUTER_API_KEY'],
    region: 'us-central1',
}, async (request, response) => {
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
        const openrouter = (0, ai_sdk_provider_1.createOpenRouter)({
            apiKey,
        });
        const model = openrouter('google/gemini-2.5-flash');
        // @ts-ignore - Type instantiation is excessively deep (TS2589) - known issue with OpenRouter provider types
        const result = await (0, ai_1.generateObject)({
            model,
            specificationVersion: 'v2',
            schema: incident_1.incidentSchema,
            prompt: `Parse the following emergency notification message and extract structured incident data. 
The message contains incident information that may include:
- Incident type (Proximity Alert, New Incident, etc.)
- Location details (state, county, city, address)
- Distance (for proximity alerts)
- Description of the incident
- Emergency services status
- Incident ID
- Source/reference information
- Timestamp

Message to parse:
${notification.message}

Extract all available information and structure it according to the schema. If a field is not present in the message, omit it (use optional fields).`,
            temperature: 0.1,
        });
        const parsedIncident = result.object;
        const firestoreIncident = (0, mappers_1.mapIncidentToFirestore)(parsedIncident, notification.receivedAt);
        const validatedIncident = firestore_incident_1.firestoreIncidentSchema.parse(firestoreIncident);
        let incidentDocId;
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
                const existingActivity = existingData.activity || [];
                const newActivity = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'update',
                    description: `Incident updated from notification: ${notification.title || 'Notification update'}`,
                    timestamp: firestore_1.Timestamp.now(),
                    source: notification.source || 'webhook',
                };
                validatedIncident.activity = [...existingActivity, newActivity];
                await db.collection('incidents').doc(incidentDocId).update(validatedIncident);
            }
            else {
                validatedIncident.createdAt = firestoreIncident.updatedAt;
                const initialActivity = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'created',
                    description: `Incident created from notification: ${notification.title || 'New incident'}`,
                    timestamp: firestore_1.Timestamp.now(),
                    source: notification.source || 'webhook',
                };
                validatedIncident.activity = [initialActivity];
                const docRef = await db.collection('incidents').add(validatedIncident);
                incidentDocId = docRef.id;
            }
        }
        else {
            validatedIncident.createdAt = firestoreIncident.updatedAt;
            const initialActivity = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'created',
                description: `Incident created from notification: ${notification.title || 'New incident'}`,
                timestamp: firestore_1.Timestamp.now(),
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
    }
    catch (error) {
        console.error('Error parsing incident:', error);
        if (error instanceof zod_1.z.ZodError) {
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
});
//# sourceMappingURL=index.js.map