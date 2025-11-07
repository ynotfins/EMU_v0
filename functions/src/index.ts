/**
 * EMU Alerts - Firebase Cloud Functions (2nd Gen)
 * 
 * Functions:
 * 1. Auto-geocode new incidents
 * 2. Create/update CRM contacts for homeowners
 * 3. Send notifications for new incidents
 * 4. Ingress webhook for AI-powered incident parsing with weather
 */

import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Client } from '@googlemaps/google-maps-services-js';

// Import ingress function
export { ingress } from './ingress';

admin.initializeApp();
const db = admin.firestore();
const mapsClient = new Client({});

/**
 * Allocate the next sequential incident id from a counter doc.
 * If the counter does not exist yet, start from INCIDENT_ID_START (default 7000000).
 */
async function allocateNextIncidentId(): Promise<string> {
  const counterRef = db.collection('_counters').doc('incidents');
  let newId: number = 0;
  await db.runTransaction(async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const startFromEnv = Number(process.env.INCIDENT_ID_START || '7000000');
    if (counterSnap.exists && typeof (counterSnap.data() as any).next === 'number') {
      const currentNext = Number((counterSnap.data() as any).next);
      newId = currentNext + 1;
    } else {
      // First allocation uses the start value directly
      newId = startFromEnv;
    }
    tx.set(counterRef, { next: newId, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  });
  return String(newId);
}

/**
 * Map an external alert id to an internal sequential incident id (document id).
 * If a mapping exists in `_idmap/{externalId}`, return it. Otherwise allocate
 * a new internal id and persist the mapping.
 */
async function getOrCreateIncidentIdForExternal(externalId: string): Promise<string> {
  const mapRef = db.collection('_idmap').doc(String(externalId));
  const mapSnap = await mapRef.get();
  if (mapSnap.exists) {
    const data = mapSnap.data() as any;
    if (data?.incidentId) return String(data.incidentId);
  }
  const internalId = await allocateNextIncidentId();
  await mapRef.set({ incidentId: internalId, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  return internalId;
}

/**
 * Auto-Geocode New Incidents
 * 
 * Triggers when a new incident is created in Firestore.
 * Geocodes the address and updates the incident with lat/lng.
 * 
 * PREVENTS DUPLICATE GEOCODING:
 * - Only runs onCreate (not onUpdate)
 * - Skips if lat/lng already exist
 * - Skips if no address provided
 */
export const autoGeocodeIncident = onDocumentCreated('incidents/{incidentId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('[Geocode] No data in snapshot');
    return;
  }

  const data = snapshot.data();
  const incidentId = event.params.incidentId;
  
  console.log('[Geocode] New incident created:', incidentId);
  
  // Skip if already geocoded
  if (data.lat && data.lng) {
    console.log('[Geocode] Already has coordinates, skipping');
    return;
  }
  
  // Check for address at root level or in location object
  const address = data.address || data.location?.address;
  const city = data.city || data.location?.city;
  const state = data.state || data.location?.state;
  
  // Skip if no address
  if (!address) {
    console.warn('[Geocode] No address provided for incident:', incidentId);
    return;
  }
  
  try {
    // Build full address from root fields or location object
    const fullAddress = `${address}, ${city || ''}, ${state || ''}`.trim();
    console.log('[Geocode] Geocoding address:', fullAddress);
    
    // Geocode using Google Maps API
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
    
    // Update incident with coordinates at root and in location object
    const updateData: any = {
      lat: location.lat,
      lng: location.lng,
      geocodedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    // Also update location object if it exists
    if (data.location) {
      updateData['location.lat'] = location.lat;
      updateData['location.lng'] = location.lng;
    } else {
      // Create location object if it doesn't exist
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
    
    // Create/update CRM contact
    await createOrUpdateContact(fullAddress, location.lat, location.lng, incidentId, data);
  } catch (error) {
    console.error('[Geocode] Error geocoding incident:', error);
  }
});

/**
 * Create or Update CRM Contact
 * 
 * Creates a contact record for each unique address.
 * Links incidents to contacts for homeowner tracking.
 */
async function createOrUpdateContact(
  address: string,
  lat: number,
  lng: number,
  incidentId: string,
  incidentData: any
): Promise<void> {
  try {
    // Create address hash for deduplication
    const addressHash = address.toLowerCase().replace(/[^a-z0-9]/g, '');
    const contactRef = db.collection('contacts').doc(addressHash);
    
    const contactSnap = await contactRef.get();
    
    if (contactSnap.exists) {
      // Update existing contact
      console.log('[CRM] Updating existing contact:', address);
      await contactRef.update({
        lastIncidentId: incidentId,
        lastIncidentDate: admin.firestore.FieldValue.serverTimestamp(),
        incidentCount: admin.firestore.FieldValue.increment(1),
        relatedIncidents: admin.firestore.FieldValue.arrayUnion(incidentId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Create new contact
      console.log('[CRM] Creating new contact:', address);
      await contactRef.set({
        address,
        lat,
        lng,
        city: incidentData.city || '',
        state: incidentData.state || '',
        county: incidentData.county || '',
        
        // Homeowner info (to be filled in later)
        homeownerName: null,
        homeownerPhone: null,
        homeownerEmail: null,
        notes: [],
        
        // Incident tracking
        firstIncidentId: incidentId,
        firstIncidentDate: admin.firestore.FieldValue.serverTimestamp(),
        lastIncidentId: incidentId,
        lastIncidentDate: admin.firestore.FieldValue.serverTimestamp(),
        incidentCount: 1,
        relatedIncidents: [incidentId],
        
        // Metadata
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    console.log('[CRM] Contact created/updated successfully');
  } catch (error) {
    console.error('[CRM] Error managing contact:', error);
    // Don't throw - geocoding should still succeed even if CRM update fails
  }
}

/**
 * Geocode Missing Incidents (Scheduled)
 * 
 * Runs every 15 minutes to catch any incidents that weren't geocoded on creation.
 * This is a fallback in case the onCreate trigger fails or is disabled.
 */
export const scheduleGeocodeMissing = onSchedule('every 15 minutes', async (event) => {
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
        
        // Create/update CRM contact
        await createOrUpdateContact(fullAddress, location.lat, location.lng, doc.id, data);
      }
      
      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('[Scheduled Geocode] Error:', error);
    }
  }
});

/**
 * HTTP Ingest Endpoint (X-Ingest)
 *
 * Accepts POSTed alert payloads and creates a new incident document.
 * Intended for MacroDroid or other connectors to POST BNN alerts.
 *
 * Security: Optional shared secret via header `x-ingest-key` or query `key`.
 */
export const xIngest = onRequest({ cors: true, region: 'us-central1', invoker: 'public' }, async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const sharedSecret = process.env.INGEST_SHARED_SECRET;
    const provided = (req.get('x-ingest-key') || (req.query.key as string) || '').trim();
    if (sharedSecret && provided !== sharedSecret) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    // Parse body (JSON expected). Fallback: attempt to parse text.
    let payload: any = req.body;
    if (!payload || Object.keys(payload).length === 0) {
      const raw = (req as any).rawBody ? (req as any).rawBody.toString('utf8') : '';
      try { payload = JSON.parse(raw); } catch { /* ignore */ }
    }

    const externalId = (payload?.id || payload?.externalId || '').toString().trim();
    const title = (payload?.title || '').toString();
    const address = (payload?.address || '').toString();
    const city = (payload?.city || '').toString();
    const state = (payload?.state || '').toString();
    const message = (payload?.message || '').toString();
    const type = (payload?.type || title || 'alert').toString();
    const createdAt = admin.firestore.FieldValue.serverTimestamp();

    if (!message) {
      res.status(400).json({ ok: false, error: 'Missing message' });
      return;
    }

    // If an external id is provided, map it to our internal sequential id
    if (externalId) {
      const internalId = await getOrCreateIncidentIdForExternal(externalId)
      const ref = db.collection('incidents').doc(internalId)
      const snap = await ref.get()
      if (snap.exists) {
        const data = snap.data() || {}
        const prevText = (data.updatesText as string) || ''
        const nextText = prevText ? `${prevText}\n${message}` : message
        await ref.update({
          externalId,
          // preserve existing address unless explicitly sent
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
          lat: null as number | null,
          lng: null as number | null,
          createdAt,
          updatedAt: createdAt,
          source: 'x-ingest',
          stage: 'update',
        })
        res.status(200).json({ ok: true, id: internalId })
        return
      }
    }

    // No id provided: create a new incident doc with allocated sequential id
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
      lat: null as number | null,
      lng: null as number | null,
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
