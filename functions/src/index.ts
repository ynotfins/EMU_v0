/**
 * EMU Alerts - Firebase Cloud Functions
 * 
 * Functions:
 * 1. Auto-geocode new incidents
 * 2. Create/update CRM contacts for homeowners
 * 3. Send notifications for new incidents
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Client } from '@googlemaps/google-maps-services-js';

admin.initializeApp();
const db = admin.firestore();
const mapsClient = new Client({});

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
export const geocodeNewIncident = functions.firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    const incidentId = context.params.incidentId;
    
    console.log('[Geocode] New incident created:', incidentId);
    
    // Skip if already geocoded
    if (data.lat && data.lng) {
      console.log('[Geocode] Already has coordinates, skipping');
      return null;
    }
    
    // Skip if no address
    if (!data.address) {
      console.warn('[Geocode] No address provided for incident:', incidentId);
      return null;
    }
    
    try {
      // Build full address
      const fullAddress = `${data.address}, ${data.city || ''}, ${data.state || ''}`.trim();
      console.log('[Geocode] Geocoding address:', fullAddress);
      
      // Geocode using Google Maps API
      const response = await mapsClient.geocode({
        params: {
          address: fullAddress,
          key: functions.config().google?.maps_api_key || process.env.GOOGLE_MAPS_API_KEY || '',
        },
      });
      
      if (response.data.results.length === 0) {
        console.error('[Geocode] No results found for:', fullAddress);
        return null;
      }
      
      const location = response.data.results[0].geometry.location;
      console.log('[Geocode] Success:', { lat: location.lat, lng: location.lng });
      
      // Update incident with coordinates
      await snapshot.ref.update({
        lat: location.lat,
        lng: location.lng,
        geocodedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log('[Geocode] Updated incident with coordinates');
      
      // Create/update CRM contact
      await createOrUpdateContact(fullAddress, location.lat, location.lng, incidentId, data);
      
      return null;
    } catch (error) {
      console.error('[Geocode] Error geocoding incident:', error);
      return null;
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
    
    if (contactSnap.exists()) {
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
export const geocodeMissingIncidents = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    console.log('[Scheduled Geocode] Running...');
    
    const snapshot = await db.collection('incidents')
      .where('lat', '==', null)
      .where('address', '!=', null)
      .limit(20)
      .get();
    
    if (snapshot.empty) {
      console.log('[Scheduled Geocode] No incidents need geocoding');
      return null;
    }
    
    console.log(`[Scheduled Geocode] Found ${snapshot.size} incidents to geocode`);
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const fullAddress = `${data.address}, ${data.city || ''}, ${data.state || ''}`.trim();
      
      try {
        const response = await mapsClient.geocode({
          params: {
            address: fullAddress,
            key: functions.config().google?.maps_api_key || process.env.GOOGLE_MAPS_API_KEY || '',
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
    
    return null;
  });
