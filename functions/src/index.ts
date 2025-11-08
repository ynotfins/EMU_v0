import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Client } from '@googlemaps/google-maps-services-js';
import type { DocumentData } from 'firebase-admin/firestore';

export { ingress } from './ingress';

admin.initializeApp();
const db = admin.firestore();
const mapsClient = new Client({});

function isCounterData(data: DocumentData | undefined): data is { next: number } {
  return data !== undefined && typeof data.next === 'number';
}

async function allocateNextIncidentId(): Promise<string> {
  const counterRef = db.collection('_counters').doc('incidents');
  let newId = 0;
  await db.runTransaction(async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const startFromEnv = Number(process.env.INCIDENT_ID_START || '7000000');
    if (counterSnap.exists) {
      const data = counterSnap.data();
      if (isCounterData(data)) {
        newId = data.next + 1;
      } else {
        newId = startFromEnv;
      }
    } else {
      newId = startFromEnv;
    }
    tx.set(counterRef, { next: newId, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  });
  return String(newId);
}

function isIdMapData(data: DocumentData | undefined): data is { incidentId: string | number } {
  return data !== undefined && 'incidentId' in data;
}

async function getOrCreateIncidentIdForExternal(externalId: string): Promise<string> {
  const mapRef = db.collection('_idmap').doc(String(externalId));
  const mapSnap = await mapRef.get();
  if (mapSnap.exists) {
    const data = mapSnap.data();
    if (isIdMapData(data) && data.incidentId) {
      return String(data.incidentId);
    }
  }
  const internalId = await allocateNextIncidentId();
  await mapRef.set({ incidentId: internalId, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  return internalId;
}

export const autoGeocodeIncident = onDocumentCreated(
  {
    document: 'incidents/{incidentId}',
    secrets: ['GOOGLE_MAPS_API_KEY'],
  },
  async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('[Geocode] No data in snapshot');
    return;
  }

  const data = snapshot.data();
  const incidentId = event.params.incidentId;
  
  console.log('[Geocode] New incident created:', incidentId);
  
  if (data.lat && data.lng) {
    console.log('[Geocode] Already has coordinates, skipping');
    return;
  }
  
  const address = data.address || data.location?.address;
  const city = data.city || data.location?.city;
  const state = data.state || data.location?.state;
  
  if (!address) {
    console.warn('[Geocode] No address provided for incident:', incidentId);
    return;
  }
  
  try {
    const fullAddress = `${address}, ${city || ''}, ${state || ''}`.trim();
    console.log('[Geocode] Geocoding address:', fullAddress);
    
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('[Geocode] No API key configured');
      return;
    }
    
    const response = await mapsClient.geocode({
      params: {
        address: fullAddress,
        key: apiKey,
      },
    });
    
    if (response.data.results.length === 0) {
      console.error('[Geocode] No results found for:', fullAddress);
      return;
    }
    
    const location = response.data.results[0].geometry.location;
    console.log('[Geocode] Success:', { lat: location.lat, lng: location.lng });
    
    const updateData: Record<string, unknown> = {
      lat: location.lat,
      lng: location.lng,
      geocodedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    if (data.location) {
      updateData['location.lat'] = location.lat;
      updateData['location.lng'] = location.lng;
    } else {
      updateData.location = {
        lat: location.lat,
        lng: location.lng,
        address: address,
        city: city,
        state: state,
        country: data.country || 'USA',
      };
    }
    
    await snapshot.ref.update(updateData);
    
    console.log('[Geocode] Updated incident with coordinates');
    
    await createOrUpdateContact(fullAddress, location.lat, location.lng, incidentId, data);
  } catch (error) {
    console.error('[Geocode] Error geocoding incident:', error);
  }
});

async function createOrUpdateContact(
  address: string,
  lat: number,
  lng: number,
  incidentId: string,
  incidentData: DocumentData
): Promise<void> {
  try {
    const addressHash = address.toLowerCase().replace(/[^a-z0-9]/g, '');
    const contactRef = db.collection('contacts').doc(addressHash);
    
    const contactSnap = await contactRef.get();
    
    if (contactSnap.exists) {
      console.log('[CRM] Updating existing contact:', address);
      await contactRef.update({
        lastIncidentId: incidentId,
        lastIncidentDate: admin.firestore.FieldValue.serverTimestamp(),
        incidentCount: admin.firestore.FieldValue.increment(1),
        relatedIncidents: admin.firestore.FieldValue.arrayUnion(incidentId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      console.log('[CRM] Creating new contact:', address);
      await contactRef.set({
        address,
        lat,
        lng,
        city: incidentData.city || '',
        state: incidentData.state || '',
        county: incidentData.county || '',
        
        homeownerName: null,
        homeownerPhone: null,
        homeownerEmail: null,
        notes: [],
        
        firstIncidentId: incidentId,
        firstIncidentDate: admin.firestore.FieldValue.serverTimestamp(),
        lastIncidentId: incidentId,
        lastIncidentDate: admin.firestore.FieldValue.serverTimestamp(),
        incidentCount: 1,
        relatedIncidents: [incidentId],
        
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    console.log('[CRM] Contact created/updated successfully');
  } catch (error) {
    console.error('[CRM] Error managing contact:', error);
  }
}

export const scheduleGeocodeMissing = onSchedule(
  {
    secrets: ['GOOGLE_MAPS_API_KEY'],
    schedule: 'every 15 minutes',
    region: 'us-central1',
  },
  async (event) => {
  console.log('[Scheduled Geocode] Running...');
  
  const snapshot = await db.collection('incidents')
    .where('lat', '==', null)
    .where('address', '!=', null)
    .limit(20)
    .get();
  
  if (snapshot.empty) {
    console.log('[Scheduled Geocode] No incidents need geocoding');
    return;
  }
  
  console.log(`[Scheduled Geocode] Found ${snapshot.size} incidents to geocode`);
  
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('[Scheduled Geocode] No API key configured');
    return;
  }
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const fullAddress = `${data.address}, ${data.city || ''}, ${data.state || ''}`.trim();
    
    try {
      const response = await mapsClient.geocode({
        params: {
          address: fullAddress,
          key: apiKey,
        },
      });
      
      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        
        await doc.ref.update({
          lat: location.lat,
          lng: location.lng,
          geocodedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log('[Scheduled Geocode] Geocoded:', doc.id);
        
        await createOrUpdateContact(fullAddress, location.lat, location.lng, doc.id, data);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('[Scheduled Geocode] Error:', error);
    }
  }
});

export const xIngest = onRequest({ cors: true, region: 'us-central1', invoker: 'public' }, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const sharedSecret = process.env.INGEST_SHARED_SECRET;
    const provided = (req.get('x-ingest-key') || String(req.query.key || '')).trim();
    if (sharedSecret && provided !== sharedSecret) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    let payload: Record<string, unknown> = req.body;
    if (!payload || Object.keys(payload).length === 0) {
      const raw = (req as { rawBody?: Buffer }).rawBody?.toString('utf8') || '';
      try { payload = JSON.parse(raw); } catch {}
    }

    const externalId = String(payload?.id || payload?.externalId || '').trim();
    const title = String(payload?.title || '');
    const address = String(payload?.address || '');
    const city = String(payload?.city || '');
    const state = String(payload?.state || '');
    const message = String(payload?.message || '');
    const type = String(payload?.type || title || 'alert');
    const createdAt = admin.firestore.FieldValue.serverTimestamp();

    if (!message) {
      res.status(400).json({ ok: false, error: 'Missing message' });
      return;
    }

    if (externalId) {
      const internalId = await getOrCreateIncidentIdForExternal(externalId)
      const ref = db.collection('incidents').doc(internalId)
      const snap = await ref.get()
      if (snap.exists) {
        const data = snap.data() || {}
        function hasUpdatesText(data: unknown): data is { updatesText?: string } {
          return typeof data === 'object' && data !== null;
        }
        const prevText = hasUpdatesText(data) ? String(data.updatesText || '') : ''
        const nextText = prevText ? `${prevText}\n${message}` : message
        await ref.update({
          externalId,
          ...(address && { address }),
          ...(city && { city }),
          ...(state && { state }),
          lastTitle: title,
          lastType: type,
          lastMessage: message,
          lastTS: createdAt,
          updatesText: nextText,
          updateCount: admin.firestore.FieldValue.increment(1),
          updatedAt: createdAt,
          source: 'x-ingest',
          stage: 'update',
        })
        res.status(200).json({ ok: true, id: internalId })
        return
      } else {
        await ref.set({
          id: internalId,
          externalId,
          address,
          city,
          state,
          lastTitle: title,
          lastType: type,
          lastMessage: message,
          lastTS: createdAt,
          updatesText: message,
          updateCount: 1,
          lat: null,
          lng: null,
          createdAt,
          updatedAt: createdAt,
          source: 'x-ingest',
          stage: 'update',
        })
        res.status(200).json({ ok: true, id: internalId })
        return
      }
    }

    const newId = await allocateNextIncidentId()
    const ref = db.collection('incidents').doc(newId)
    await ref.set({
      id: newId,
      address,
      city,
      state,
      lastTitle: title,
      lastType: type,
      lastMessage: message,
      lastTS: createdAt,
      updatesText: message,
      updateCount: 1,
      lat: null,
      lng: null,
      createdAt,
      updatedAt: createdAt,
      source: 'x-ingest',
      stage: 'update',
    })
    res.status(200).json({ ok: true, id: newId })
  } catch (err) {
    console.error('[X-Ingest] Error:', err);
    res.status(500).json({ ok: false, error: 'Internal error' });
  }
});
