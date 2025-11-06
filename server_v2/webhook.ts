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
    const body = req.body ?? {};
    // Accept either simple { message } or a richer MacroDroid-style payload
    const bodyMessage: unknown = typeof body === 'string' ? body : body?.message;
    const isSimple = typeof bodyMessage === 'string' && Object.keys(body ?? {}).length <= 2; // message + maybe source
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

    // AI extraction
    const provider = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });
    const { object: parsed } = await generateObject({
      model: provider('anthropic/claude-3.5-sonnet'),
      // Cast to reduce TS generic depth issues
      schema: incidentSchema as any,
      prompt: `Extract normalized incident fields from the notification below and return valid JSON.
Notification:
${composedMessage}`,
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

    // Upsert by explicit document id preference
    let ref;
    let updated = false;
    const bodySource: string | undefined = (typeof body === 'object' && body?.source) ? String(body.source) : undefined;
    const receivedAtMs: number | undefined =
      typeof body === 'object' && body?.receivedAtEpoch && !Number.isNaN(Number(body.receivedAtEpoch))
        ? Number(body.receivedAtEpoch)
        : undefined;
    const activityTimestamp = receivedAtMs ? Timestamp.fromMillis(receivedAtMs) : Timestamp.now();

    // Prefer explicit incidentId, fallback to receivedAtEpoch string, else auto id
    const preferredId =
      (data.incidentId && String(data.incidentId)) ||
      (receivedAtMs ? String(receivedAtMs) : undefined);

    if (preferredId) {
      ref = db.collection('incidents').doc(preferredId);
      const snap = await ref.get();
      if (snap.exists) {
        const existing = snap.data() as any;
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
              description: 'Updated via v2 webhook',
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
            description: 'Created via v2 webhook',
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
  } catch (e: any) {
    if (e?.errors) return res.status(400).json({ error: 'Validation failed', details: e.errors });
    return res.status(500).json({ error: 'Internal error', message: e?.message || 'unknown' });
  }
});

export default app;


