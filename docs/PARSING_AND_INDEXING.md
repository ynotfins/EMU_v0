# EMU Alerts - Parsing & Indexing System

## Overview

The EMU Alerts system receives raw incident data from MacroDroid on an Android phone, parses it into structured format, and indexes it in Firebase Firestore for real-time access across all apps (Chaser, Supe, Admin).

---

## Data Flow Architecture

```
┌─────────────────┐
│  MacroDroid     │ (Android Phone - Office)
│  (BNN Alerts)   │
└────────┬────────┘
         │ HTTP POST
         ▼
┌─────────────────┐
│  Firebase       │
│  Cloud Function │ (Optional - currently direct to Firestore)
└────────┬────────┘
         │ Write
         ▼
┌─────────────────┐
│  Firestore      │
│  /incidents     │
│  Collection     │
└────────┬────────┘
         │ onSnapshot (Real-time)
         ▼
┌─────────────────┐
│  Next.js App    │
│  (3 Roles)      │
│  - Chaser       │
│  - Supe         │
│  - Admin        │
└─────────────────┘
```

---

## 1. Data Source: MacroDroid

### What MacroDroid Sends

MacroDroid captures BNN (Breaking News Network) alerts and sends them to Firebase Firestore.

**Example Raw Data**:
```json
{
  "incidentId": "bnn-2025-10-29-12345",
  "address": "123 Main St",
  "city": "Brooklyn",
  "state": "NY",
  "county": "Kings",
  "type": "FIRE",
  "message": "Structure fire reported, multiple units responding",
  "lastSeenAt": { "seconds": 1730218800 },
  "lastTs": "2025-10-29T14:30:00Z",
  "lastType": "UPDATE",
  "lastMessage": "Fire under control, no injuries"
}
```

### Data Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `incidentId` | string | Unique identifier for incident | ✅ Yes |
| `address` | string | Street address | ✅ Yes |
| `city` | string | City name | ✅ Yes |
| `state` | string | State abbreviation (e.g., NY) | ✅ Yes |
| `county` | string | County name (e.g., Kings) | ❌ Optional |
| `type` | string | Alert type (FIRE, EMS, etc.) | ✅ Yes |
| `message` | string | Alert message content | ✅ Yes |
| `lastSeenAt` | Timestamp | Firestore timestamp | ✅ Yes |
| `lastTs` | string | ISO timestamp | ✅ Yes |
| `lastType` | string | Last update type | ❌ Optional |
| `lastMessage` | string | Last update message | ❌ Optional |

---

## 2. Firestore Data Structure

### Collections Hierarchy

```
/incidents
  ├─ {incidentId}              (Document)
  │   ├─ address: string
  │   ├─ city: string
  │   ├─ state: string
  │   ├─ county: string
  │   ├─ type: string
  │   ├─ message: string
  │   ├─ updatedAt: Timestamp
  │   ├─ favoritedBy: string[]
  │   ├─ bookmarkedBy: string[]
  │   ├─ notes: Note[]
  │   ├─ lat: number (cached)
  │   ├─ lng: number (cached)
  │   ├─ geocodedAt: string (cache timestamp)
  │   │
  │   └─ /updates               (Subcollection)
  │       ├─ {updateId}         (Document)
  │       │   ├─ message: string
  │       │   ├─ stage: string
  │       │   ├─ ts: Timestamp
  │       │   ├─ type: string
  │       │   └─ id: string

/users
  ├─ {userId}                   (Document)
  │   ├─ email: string
  │   ├─ role: "chaser" | "supe" | "admin"
  │   ├─ settings: Settings{}
  │   └─ createdAt: Timestamp
```

---

## 3. Data Normalization

### Purpose
Raw data from MacroDroid has inconsistent field names that need to be normalized for the app.

### Normalization Function

**Location**: `hooks/use-incidents.ts` → `normalize()`

**Field Mappings**:

| Raw Field | Normalized Field | Fallback |
|-----------|------------------|----------|
| `lastType` or `type` | `type` | "UNKNOWN" |
| `lastMessage` or `message` | `message` | "" |
| `lastSeenAt` or `lastTs` | `updatedAt` | current time |
| `address` | `address` | "Unknown" |
| `city` | `city` | "" |
| `state` | `state` | "" |
| `county` or borough | `county` | BOROUGH_TO_COUNTY mapping |

**Example**:
```typescript
function normalize(id: string, data: any): IncidentLite {
  return {
    id,
    incidentId: data.incidentId || id,
    type: data.lastType || data.type || "UNKNOWN",
    message: data.lastMessage || data.message || "",
    address: data.address || "Unknown",
    city: data.city || "",
    state: data.state || "",
    county: normalizeCounty(data.county, data.city),
    updatedAt: parseTimestamp(data.lastSeenAt || data.lastTs),
    // ... other fields
  };
}
```

---

## 4. Borough to County Mapping

### Problem
NYC uses "boroughs" but we need to display "counties" for consistency.

### Mapping

**Location**: `hooks/use-incidents.ts` and `hooks/use-incident.ts`

```typescript
const BOROUGH_TO_COUNTY: Record<string, string> = {
  Manhattan: "New York",
  Brooklyn: "Kings",
  Queens: "Queens",
  Bronx: "Bronx",
  "Staten Island": "Richmond",
};
```

**Example**:
- Input: `city: "Brooklyn"`, `county: undefined`
- Output: `county: "Kings"`

---

## 5. Real-Time Indexing

### Firestore Listeners

**Hook**: `useIncidents()` in `hooks/use-incidents.ts`

```typescript
const q = query(
  collection(db, "incidents"),
  orderBy("updatedAt", "desc"),
  limit(500)
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  // Process new/updated incidents
  const data = snapshot.docs.map(doc => normalize(doc.id, doc.data()));
  setIncidents(data);
});
```

**Features**:
- ✅ Real-time updates (< 1 second latency)
- ✅ Automatic re-rendering when data changes
- ✅ Handles new incidents and updates to existing
- ✅ Memory efficient (limit 500 most recent)

---

## 6. Update Deduplication

### Problem
Firestore may contain duplicate updates with same timestamp and message.

### Solution

**Location**: `hooks/use-incident.ts` → `useEffect` for updates

```typescript
const seenKeys = new Set<string>();

updates.forEach(update => {
  const key = `${update.ts}|${update.message}|${update.stage || ""}`;
  
  if (!seenKeys.has(key)) {
    seenKeys.add(key);
    // Add to deduped array
  }
});
```

**Deduplication Key**: `timestamp|message|stage`

---

## 7. Geocoding & Caching

### First-Time Geocoding

When an incident doesn't have `lat`/`lng`:

1. Extract full address: `{address}, {city}, {state}`
2. Call Google Maps Geocoding API
3. Fallback to OpenStreetMap Nominatim if Google fails
4. Cache result in Firestore: `lat`, `lng`, `geocodedAt`

**Location**: `hooks/use-location-distance.ts` → `geocodeAddress()`

```typescript
async function geocodeAddress(address: string) {
  // Try Google Maps first
  const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
  const response = await fetch(googleUrl);
  const data = await response.json();
  
  if (data.results?.[0]) {
    return {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng
    };
  }
  
  // Fallback to OpenStreetMap
  // ...
}
```

### Cache Write

**Location**: `hooks/use-location-distance.ts` → `getIncidentDistance()`

```typescript
await updateDoc(doc(db, "incidents", incidentId), {
  lat,
  lng,
  geocodedAt: new Date().toISOString()
});
```

**Result**: Same address never geocoded twice! 💰

---

## 8. Indexing for Search & Filters

### Client-Side Indexes

**Location**: `hooks/use-incidents.ts` → `useMemo` filtering

#### Keyword Search Index
```typescript
if (filters.keyword) {
  const keyword = filters.keyword.toLowerCase();
  filtered = filtered.filter(inc =>
    inc.address.toLowerCase().includes(keyword) ||
    inc.type.toLowerCase().includes(keyword) ||
    inc.message.toLowerCase().includes(keyword)
  );
}
```

#### Distance Index
```typescript
if (filters.distanceMi !== undefined) {
  const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
  filtered = filtered.filter(inc => {
    const isRecent = new Date(inc.updatedAt).getTime() >= fourHoursAgo;
    const withinDistance = inc.distanceMi <= filters.distanceMi;
    return isRecent && withinDistance;
  });
}
```

#### Type Filter Index
```typescript
if (filters.types?.length > 0) {
  filtered = filtered.filter(inc => 
    filters.types.includes(inc.type)
  );
}
```

### Why Client-Side?
- ✅ Real-time filtering (no server round-trip)
- ✅ Works with Firestore's real-time listeners
- ✅ Flexible (can combine multiple filters)
- ✅ No Firestore query complexity limits

---

## 9. User-Specific Data Indexing

### Favorites Index

**Storage**: `favoritedBy: string[]` array in incident document

**Read**:
```typescript
const isFavorited = incident.favoritedBy?.includes(userId);
```

**Write**:
```typescript
await updateDoc(incidentRef, {
  favoritedBy: arrayUnion(userId)
});
```

### Bookmarks Index
Same pattern as favorites, uses `bookmarkedBy` array.

### Notes Index

**Storage**: `notes: Note[]` array in incident document

```typescript
interface Note {
  text: string;
  createdAt: string;
  createdBy: string;
}
```

**Append**:
```typescript
await updateDoc(incidentRef, {
  notes: arrayUnion({
    text: noteText,
    createdAt: new Date().toISOString(),
    createdBy: userId
  })
});
```

---

## 10. Performance Optimizations

### Batch Processing
**Location**: `hooks/use-incidents-with-distance.ts`

Process incidents in batches of 5 to avoid UI blocking:
```typescript
const BATCH_SIZE = 5;
for (let i = 0; i < incidents.length; i += BATCH_SIZE) {
  const batch = incidents.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(processIncident));
  
  // Small delay between batches
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

### Lazy Loading
Only geocode incidents as they become visible or needed for filtering.

### Caching Strategy
- **Location**: Cache for 5 minutes (`maximumAge: 300000`)
- **Geocoding**: Cache forever in Firestore (until address changes)
- **Distance**: Recalculate on user movement (cheap client-side math)

---

## 11. Data Retention

### Current Policy
All incidents stored indefinitely.

### Planned: 30-Day Retention

**Implementation** (not yet active):
```typescript
// Cloud Function (scheduled daily)
const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

const oldIncidents = await getDocs(
  query(
    collection(db, "incidents"),
    where("updatedAt", "<", new Date(thirtyDaysAgo))
  )
);

// Delete old incidents except favorited/noted ones
oldIncidents.forEach(async (doc) => {
  const data = doc.data();
  if (!data.favoritedBy?.length && !data.notes?.length) {
    await deleteDoc(doc.ref);
  }
});
```

---

## 12. Error Handling

### Parsing Errors
```typescript
try {
  const incident = normalize(doc.id, doc.data());
  return incident;
} catch (error) {
  console.error('[normalize] Failed to parse incident:', doc.id, error);
  return null; // Skip malformed incidents
}
```

### Geocoding Errors
```typescript
try {
  const coords = await geocodeAddress(address);
  return coords;
} catch (error) {
  console.error('[geocode] Failed:', address, error);
  return null; // Show incident without distance
}
```

### Firestore Errors
```typescript
onSnapshot(q, 
  (snapshot) => { /* success */ },
  (error) => {
    console.error('[Firestore] Real-time listener error:', error);
    setError(error);
    // Show error banner to user
  }
);
```

---

## 13. Monitoring & Logging

### Console Logging

**Levels**:
- `console.log` - Normal flow
- `console.warn` - Potential issues
- `console.error` - Actual errors

**Examples**:
```typescript
console.log('[useIncidents] Loaded', data.length, 'incidents');
console.warn('[geocode] Google Maps failed, trying OpenStreetMap');
console.error('[updateDoc] Failed to save note:', error);
```

### Firestore Logging
All Firestore operations logged to Firebase Console automatically.

---

## 14. Testing Data Flow

### How to Test Parsing

1. **Add test incident** in Firestore Console:
   ```json
   {
     "incidentId": "test-001",
     "address": "123 Test St",
     "city": "Brooklyn",
     "state": "NY",
     "lastType": "FIRE",
     "lastMessage": "Test alert",
     "lastSeenAt": { "seconds": 1730218800 }
   }
   ```

2. **Verify normalization**:
   - Check console logs for normalized data
   - Verify county shows "Kings" (not "Brooklyn")
   - Check `type` and `message` are correct

3. **Test geocoding**:
   - Open incident detail page
   - Check if `lat`/`lng` appear in Firestore
   - Verify distance calculation works

4. **Test real-time**:
   - Update incident in Firestore Console
   - Verify app updates within 1 second
   - No page refresh needed

---

## 15. Future Enhancements

### Planned Improvements

1. **Full-Text Search**
   - Algolia or Typesense integration
   - Search across all fields including updates
   
2. **Aggregations**
   - Total incidents by type
   - Heatmap data
   - Trend analysis

3. **Machine Learning**
   - Auto-categorize incident types
   - Predict incident escalation
   - Smart routing to nearest responders

4. **Offline Support**
   - Service worker caching
   - Local IndexedDB storage
   - Background sync when online

---

## Cross-References

- **Data Types**: See `types/domain.ts`
- **Hooks**: See `hooks/use-incidents.ts`, `hooks/use-incident.ts`
- **Filtering**: See `docs/FILTER_SYSTEM.md`
- **API Integration**: See `docs/API.md`
- **Architecture**: See `docs/WIRING.md`

---

**Last Updated**: October 29, 2025  
**Status**: ✅ Production-Ready  
**Maintainer**: EMU Development Team
