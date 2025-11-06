import express from 'express';
import cors from 'cors';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// === Domain schemas ===
// If these exist in the repo already, import from there and delete these placeholders.
// Otherwise, keep these minimal schemas and adjust mapping below.
const incidentSchema = z.object({
  incidentId: z.string().optional(),
  source: z.string().optional(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  location: z.string().optional(),
});

type Incident = z.infer<typeof incidentSchema>;

const firestoreIncidentSchema = z.object({
  incidentId: z.string().optional(),
  title: z.string(),
  description: z.string(),
  severity: z.string().optional(),
  location: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
  activity: z.array(z.object({
    id: z.string(),
    type: z.enum(['create','update']),
    description: z.string(),
    timestamp: z.any(),
    source: z.string().optional(),
  })).optional(),
});

type FirestoreIncident = z.infer<typeof firestoreIncidentSchema>;

// === Firebase Admin init ===
if (getApps().length === 0) {
  initializeApp({ credential: applicationDefault() });
}
const db = getFirestore();

// === App setup ===
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// === AI-enhanced webhook ===
app.post('/webhook', async (req, res) => {
  try {
    const { message } = req.body ?? {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing message string' });
    }

    // AI extraction
    const provider = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });
    const { object: parsed } = await generateObject({
      model: provider('anthropic/claude-3.5-sonnet'),
      schema: incidentSchema,
      prompt: `Extract normalized incident fields from the notification below and return valid JSON.
Notification:
${message}`,
      temperature: 0,
    });

    // Map to Firestore shape
    const mapped: FirestoreIncident = {
      incidentId: parsed.incidentId,
      title: parsed.title,
      description: parsed.description,
      severity: parsed.severity,
      location: parsed.location,
    };
    const data = firestoreIncidentSchema.parse(mapped);

    // Upsert by incidentId when available
    let ref;
    let updated = false;

    if (data.incidentId) {
      const snap = await db.collection('incidents')
        .where('incidentId', '==', data.incidentId)
        .limit(1)
        .get();

      if (!snap.empty) {
        ref = snap.docs[0].ref;
        const existing = snap.docs[0].data();
        await ref.set({
          ...data,
          createdAt: existing.createdAt ?? Timestamp.now(),
          updatedAt: Timestamp.now(),
          activity: [
            ...(existing.activity ?? []),
            {
              id: `${Date.now()}`,
              type: 'update',
              description: 'Updated via v2 webhook',
              timestamp: Timestamp.now(),
              source: parsed.source ?? 'webhook-v2',
            },
          ],
        }, { merge: true });
        updated = true;
      }
    }

    if (!ref) {
      ref = db.collection('incidents').doc();
      await ref.set({
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        activity: [{
          id: `${Date.now()}`,
          type: 'create',
          description: 'Created via v2 webhook',
          timestamp: Timestamp.now(),
          source: parsed.source ?? 'webhook-v2',
        }],
      });
    }

    return res.status(200).json({ id: ref.id, updated });
  } catch (e: any) {
    if (e?.errors) return res.status(400).json({ error: 'Validation failed', details: e.errors });
    return res.status(500).json({ error: 'Internal error', message: e?.message || 'unknown' });
  }
});

export default app;


