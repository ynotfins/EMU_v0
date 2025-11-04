# 🌍 Geocoding Analysis & Fix Plan

## Current State

### How Geocoding Works Now
1. **MacroDroid** sends alerts directly to Firestore (no API, no Cloud Function)
2. Firestore document created WITHOUT lat/lng initially
3. **Client-side** geocoding happens when user views incident for distance calc
4. Geocode result cached in Firestore (lat, lng, geocodedAt)
5. Future views use cached lat/lng

### Problems with Current Approach
1. ❌ Geocoding happens client-side (wastes user's bandwidth/battery)
2. ❌ First user to view incident pays the "geocoding tax"
3. ❌ Different users might geocode same incident if viewing simultaneously
4. ❌ No geocoding if no one views the incident
5. ❌ Maps won't show incidents that haven't been viewed yet

## Proper Solution: Server-Side Geocoding

### Architecture
```
MacroDroid → Firestore → Cloud Function Trigger → Geocode → Update Firestore
                              ↓
                         (Automatic, instant)
```

### Implementation

#### Option 1: Firestore Trigger (Recommended)
```typescript
// functions/src/index.ts
export const onNewIncident = functions.firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    
    // Skip if already geocoded
    if (data.lat && data.lng) {
      return null;
    }
    
    // Skip if no address
    if (!data.address) {
      console.warn('Incident has no address:', context.params.incidentId);
      return null;
    }
    
    // Geocode the address
    const fullAddress = `${data.address}, ${data.city}, ${data.state}`;
    const location = await geocodeAddress(fullAddress);
    
    if (!location) {
      console.error('Failed to geocode:', fullAddress);
      return null;
    }
    
    // Update incident with lat/lng
    await snapshot.ref.update({
      lat: location.lat,
      lng: location.lng,
      geocodedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('Geocoded incident:', context.params.incidentId, location);
    return null;
  });
```

#### Option 2: Scheduled Function (Fallback)
```typescript
// Run every 5 minutes to catch any missed incidents
export const geocodeMissing = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const snapshot = await admin.firestore()
      .collection('incidents')
      .where('lat', '==', null)
      .where('address', '!=', null)
      .limit(10)
      .get();
    
    for (const doc of snapshot.docs) {
      // Geocode and update
    }
  });
```

## Update Handling (CORRECT CURRENT LOGIC)

### Current Logic for Updates ✅
```typescript
// hooks/use-incident.ts - line 100+
snapshot.docs.forEach((doc) => {
  const data = doc.data();
  const incidentId = data.incidentId || doc.id;
  const existing = groupedMap.get(incidentId);

  // Keep only most recent version
  if (!existing || (data.lastSeenAt?.seconds || 0) > (existing.lastSeenAt?.seconds || 0)) {
    groupedMap.set(incidentId, { ...data, firestoreDocId: doc.id });
  }
});
```

**This is CORRECT!** Updates are grouped by incidentId and keep the SAME lat/lng from the original alert.

## CRM Integration

### Homeowner Data Flow
```
New Incident → Geocode Address → Create/Update Contact in CRM
                                         ↓
                              {
                                address,
                                lat,
                                lng,
                                homeownerInfo: {
                                  name: null,  // Fill in later
                                  phone: null,
                                  email: null,
                                  notes: []
                                }
                              }
```

### Database Structure
```
/incidents/{incidentId}
  - address: "123 Main St"
  - lat: 40.123
  - lng: -74.456
  - geocodedAt: "2025-11-04T..."
  
/contacts/{addressHash}  ← CRM Contact (deduplicated by address)
  - address: "123 Main St, Brooklyn, NY"
  - lat: 40.123
  - lng: -74.456
  - homeownerName: "John Doe"
  - homeownerPhone: "(555) 123-4567"
  - homeownerEmail: "john@example.com"
  - notes: []
  - relatedIncidents: ["inc-001", "inc-002"]
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Immediate Fixes Needed

### 1. Re-enable ignoreBuildErrors ✅
Deployment failing due to 429 TypeScript errors

### 2. Verify Geocoding Logic
Check that:
- ✅ Geocoding checks for existing lat/lng first
- ✅ Geocoding caches result in Firestore
- ✅ Updates reuse address from main incident
- ❌ Geocoding happens client-side (should be server-side)

### 3. Create CRM Structure
- Create /contacts collection
- Link incidents to contacts by address
- Store homeowner info in contacts
- Display contact history in CRM

## Action Items

1. **Immediate**: Re-enable ignoreBuildErrors for deployment
2. **Short-term**: Create Cloud Function for auto-geocoding
3. **Medium-term**: Build CRM contact management
4. **Long-term**: Migrate to server-side geocoding entirely
