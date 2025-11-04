# EMU Cloud Functions

## Overview

These Firebase Cloud Functions provide server-side processing for EMU Alerts:

1. **Auto-Geocoding**: Geocodes new incidents when created
2. **CRM Contact Management**: Creates/updates homeowner contact records  
3. **Scheduled Cleanup**: Catches any incidents that weren't geocoded

## Setup

### 1. Install Dependencies
```bash
cd functions
pnpm install
```

### 2. Configure API Key
```bash
firebase functions:config:set google.maps_api_key="YOUR_GOOGLE_MAPS_API_KEY"
```

Or use environment variables (newer method):
```bash
# Add to functions/.env
GOOGLE_MAPS_API_KEY=your-api-key-here
```

### 3. Build Functions
```bash
pnpm build
```

### 4. Deploy to Firebase
```bash
firebase deploy --only functions
```

Or deploy specific functions:
```bash
firebase deploy --only functions:autoGeocodeIncident
firebase deploy --only functions:scheduleGeocodeMissing
```

## Functions

### `autoGeocodeIncident`
- **Trigger**: onCreate in /incidents collection
- **Purpose**: Auto-geocode new incidents
- **Prevents**: Duplicate geocoding (checks for existing lat/lng)
- **Creates**: CRM contact record automatically

### `scheduleGeocodeMissing`
- **Trigger**: Scheduled (every 15 minutes)
- **Purpose**: Fallback geocoding for incidents that were missed
- **Rate Limit**: 20 incidents per run, 1 request/second

## Data Flow

```
New Incident Created
      ↓
onCreate Trigger
      ↓
Check if already geocoded (lat/lng exist)
      ↓
If NOT geocoded:
  - Geocode address via Google Maps API
  - Update incident with lat/lng
  - Create/update CRM contact
      ↓
Client sees incident with coordinates immediately
```

## CRM Contact Structure

```typescript
/contacts/{addressHash}
{
  address: "123 Main St, Brooklyn, NY",
  lat: 40.123,
  lng: -74.456,
  city: "Brooklyn",
  state: "NY",
  county: "Kings",
  
  // Homeowner info (filled in via Homeowner tab)
  homeownerName: null,
  homeownerPhone: null,
  homeownerEmail: null,
  notes: [],
  
  // Incident tracking
  firstIncidentId: "inc-001",
  firstIncidentDate: timestamp,
  lastIncidentId: "inc-003",
  lastIncidentDate: timestamp,
  incidentCount: 3,
  relatedIncidents: ["inc-001", "inc-002", "inc-003"],
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Testing Locally

### Start Emulators
```bash
firebase emulators:start
```

### Test onCreate Trigger
1. Add a new document to /incidents in Firestore
2. Watch function logs for geocoding
3. Verify lat/lng added to incident
4. Check /contacts collection for new contact

### View Logs
```bash
firebase functions:log
```

## Production Deployment

1. Ensure Google Maps API key is configured
2. Build functions: `pnpm build`
3. Deploy: `firebase deploy --only functions`
4. Monitor logs: `firebase functions:log`

## Cost Optimization

- Geocoding only happens ONCE per incident (onCreate trigger)
- Updates reuse address from original incident (no re-geocoding)
- Scheduled function limited to 20 incidents per run
- Rate limit of 1 request/second to avoid quota exhaustion

**Free Tier**: 28,000 geocode requests/month (Google Maps API)
