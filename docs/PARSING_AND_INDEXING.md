# EMU Alerts - Data Parsing & Indexing Guide

## Overview

This document explains how data flows from MacroDroid notifications through Firebase to the Next.js app, and how to properly parse and index it for optimal performance.

---

## Data Flow Architecture

```
MacroDroid (Phone)
    ↓ HTTP POST with X-Ingest-Token
Cloud Function (ingestBNN)
    ↓ Parse & Store
Firestore Database
    ↓ Real-time Listeners (onSnapshot)
Next.js App (useIncidents, useIncident hooks)
    ↓ Normalize & Display
User Interface
```

---

## 1. Data Ingestion (MacroDroid → Cloud Function)

### Input Format

MacroDroid sends JSON via HTTP POST to Cloud Function `ingestBNN`:

```json
{
  "message": "NY | Suffolk | Terryville | Suspicious Fire | 6th Pct | 49 Joline Rd | ... | #1834007",
  "lastFormattedMessage": "10/18/2024 3:45 PM ...",
  "address": "49 Joline Rd",
  "lat": 40.1234,
  "lng": -73.5678
}
```

### Parsing Logic (Cloud Function)

```javascript
// Extract fields from pipe-delimited message
const [state, county, city, alertType, address, alertMessage] = line
  .split("|")
  .map((s) => s.trim());

// Extract incident ID from tail (after field 6)
const incidentId =
  extractIncidentId(tail, line) ||
  synthesizeIncidentId({ state, county, city, address, alertType });
```

**Key Insight:** The incident ID comes from the notification text (e.g., `#1834007`) or is synthesized using a hash of location+type.

---

## 2. Firestore Storage Structure

### Main Document: `incidents/{incidentId}`

Stores the **latest snapshot** for the incident list page:

```javascript
{
  // Timestamps
  firstSeenAt: Timestamp,  // When first created ("new")
  lastTs: Timestamp,       // Last update timestamp
  lastSeenAt: Timestamp,   // Last seen (deprecated, use lastTs)

  // Location
  state: "NY",
  county: "Suffolk",
  city: "Terryville",
  address: "49 Joline Rd",
  lat: 40.1234,
  lng: -73.5678,

  // Alert Info
  lastType: "Suspicious Fire",      // Alert type (category)
  lastMessage: "49 Joline Rd",      // Latest message
  stage: "update",                  // "new" or "update"
  source: "BNN",

  // Metadata
  updateCount: 8,                   // Number of updates
  favoritedBy: ["dev-user-0000001"],
  bookmarkedBy: ["dev-user-0000001"]
}
```

### Subcollection: `incidents/{incidentId}/updates`

Stores **full history** for the details page:

```javascript
{
  ts: Timestamp,              // Update timestamp
  reportedAt: Timestamp,      // Original report time (optional)
  stage: "update",            // "new" or "update"
  message: "49 Joline Rd",    // Update message text
  title: "",                  // Optional title
  address: "49 Joline Rd",    // Address at time of update
  lat: 40.1234,
  lng: -73.5678,
  source: "BNN"
}
```

### Helper Collection: `alerts` (optional)

Flat feed of all alerts for analytics:

```javascript
{
  ts: Timestamp,
  incidentId: "1834007",
  state: "NY",
  county: "Suffolk",
  // ... all fields
  rawText: "original pipe-delimited string"
}
```

---

## 3. Firestore Indexing

### Current Indexes

#### Single-Field Indexes (Automatic)

Firestore automatically creates single-field indexes:

- `incidents.lastTs` (DESC) - for sorting
- `incidents.state` (ASC) - for filtering
- `incidents.county` (ASC) - for filtering
- `incidents.favoritedBy` (ARRAY) - for array-contains queries

#### Composite Indexes (Manual)

**Purpose:** Enable complex queries with multiple filters/sorts.

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "incidents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "state", "order": "ASCENDING" },
        { "fieldPath": "lastTs", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**When to Add Indexes:**

- Console error: "The query requires an index"
- Click the provided URL to auto-create
- Or manually add to `firestore.indexes.json` and deploy:
  ```bash
  firebase deploy --only firestore:indexes
  ```

### Index Strategy

**DO Index:**

- Fields used in `where()` clauses
- Fields used in `orderBy()`
- Array fields used with `array-contains`

**DON'T Index:**

- Fields only used for display
- Large text fields (descriptions, notes)
- Fields that change frequently (reduces write performance)

---

## 4. Client-Side Parsing (Next.js Hooks)

### useIncidents Hook (List Page)

**Purpose:** Load all incidents and normalize inconsistent field names.

```typescript
// Subscribe to real-time updates
const incidentsRef = collection(db, "incidents");
const q = query(incidentsRef, orderBy("lastTs", "desc"), limit(100));

onSnapshot(q, (snapshot) => {
  const incidents = snapshot.docs.map((doc) => normalize(doc.id, doc.data()));
});
```

**Normalization Logic:**

```typescript
function normalize(docId: string, data: any): IncidentLite {
  return {
    id: docId,
    incidentNumber: data.incidentId || parseInt(docId) || 0,
    type: data.lastType || data.type || "Unknown",
    message: data.lastMessage || data.message || "",
    address: data.address || "",
    city: data.city || "",
    county: data.county || "",
    state: data.state || "",
    updatedAt:
      data.lastTs?.toDate?.()?.toISOString() || new Date().toISOString(),
    // Convert Firestore Timestamp to ISO string
  };
}
```

### useIncident Hook (Details Page)

**Purpose:** Load single incident + full update history.

```typescript
// Load main document
const incidentDocRef = doc(db, "incidents", incidentId);
onSnapshot(incidentDocRef, (docSnap) => {
  const incident = docSnap.data();
  setData(incident);
});

// Load updates subcollection
const updatesRef = collection(db, "incidents", incidentId, "updates");
const updatesQuery = query(updatesRef, orderBy("ts", "desc"));
onSnapshot(updatesQuery, (snapshot) => {
  const updates = snapshot.docs.map((doc) => ({
    id: doc.id,
    message: doc.data().message,
    ts: doc.data().ts?.toDate?.()?.toISOString(),
  }));
  setUpdates(updates);
});
```

---

## 5. Data Consistency Patterns

### Problem: Legacy vs New Data

BNN data has evolved over time, causing field name inconsistencies:

| Old Field     | New Field        | Notes                        |
| ------------- | ---------------- | ---------------------------- |
| `incidentId`  | `firestoreDocId` | Some docs have, some don't   |
| `lastMessage` | `message`        | Use `lastMessage` for latest |
| `lastSeenAt`  | `lastTs`         | Use `lastTs` for sorting     |

### Solution: Defensive Parsing

Always provide fallbacks:

```typescript
const type = data.lastType || data.type || data.alertType || "Unknown";
const message = data.lastMessage || data.message || data.alertMessage || "";
const timestamp = data.lastTs || data.lastSeenAt || data.updatedAt;
```

### Timestamp Handling

Firestore stores timestamps as `Timestamp` objects:

```typescript
// ❌ WRONG
const date = data.lastTs; // Returns Timestamp object

// ✅ CORRECT
const date = data.lastTs?.toDate?.()?.toISOString(); // Returns ISO string
```

---

## 6. Custom Numbering System

### Current: BNN IDs (7-8 digits)

```
1834007, 1833986, 1832224
```

### Proposed: Custom IDs (starts at 1000000)

```
1000000, 1000001, 1000002, ...
```

### Implementation Strategy

**Option A: Counter in Firestore**

```javascript
// In Cloud Function
const counterRef = db.collection("metadata").doc("counters");
const newId = await db.runTransaction(async (tx) => {
  const counterDoc = await tx.get(counterRef);
  const currentId = counterDoc.data()?.incidentCounter || 999999;
  const newId = currentId + 1;
  tx.update(counterRef, { incidentCounter: newId });
  return newId;
});
```

**Option B: Map BNN ID → Custom ID**

```javascript
// Store mapping
incidents/{bnnId} = {
  customId: 1000000,
  bnnId: "1834007",
  // ... other fields
}
```

**Recommendation:** Option B (mapping) preserves original BNN IDs for debugging.

---

## 7. Distance Calculation

### Using Haversine Formula

```typescript
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
}
```

### Getting User Location

```typescript
navigator.geolocation.getCurrentPosition((position) => {
  const userLat = position.coords.latitude;
  const userLng = position.coords.longitude;

  // Calculate distance to each incident
  const distanceMi = calculateDistance(
    userLat,
    userLng,
    incident.lat,
    incident.lng
  );
});
```

---

## 8. Search & Filtering

### Current: Client-Side Filtering

```typescript
const filtered = incidents.filter((inc) => {
  if (filters.keyword) {
    const searchText =
      `${inc.type} ${inc.message} ${inc.address}`.toLowerCase();
    if (!searchText.includes(filters.keyword.toLowerCase())) return false;
  }
  if (filters.state && inc.state !== filters.state) return false;
  if (filters.county && inc.county !== filters.county) return false;
  return true;
});
```

**Limitations:**

- Can't search full-text efficiently
- Limited to loaded documents
- No typo tolerance

### Recommended: Firebase Extension

Install **firestore-algolia-search** for:

- Full-text search
- Typo tolerance
- Geo-search by radius
- Instant results

---

## 9. Best Practices

### ✅ DO:

- Use `onSnapshot` for real-time updates
- Normalize field names with fallbacks
- Convert Timestamps to ISO strings
- Index fields used in queries
- Batch writes when updating multiple docs

### ❌ DON'T:

- Query without indexes (causes errors)
- Store large arrays (>10k items)
- Use client-side filtering for >1000 docs
- Forget to unsubscribe from listeners
- Over-index (slows writes)

---

## 10. Performance Optimization

### Pagination

```typescript
// Load first page
const firstPage = query(incidentsRef, orderBy("lastTs", "desc"), limit(25));

// Load next page
const lastVisible = snapshot.docs[snapshot.docs.length - 1];
const nextPage = query(
  incidentsRef,
  orderBy("lastTs", "desc"),
  startAfter(lastVisible),
  limit(25)
);
```

### Caching

Firestore automatically caches documents locally. To clear:

```typescript
await clearIndexedDbPersistence(db);
```

---

## Quick Reference

| Task               | Code Pattern                                             |
| ------------------ | -------------------------------------------------------- |
| Load all incidents | `onSnapshot(query(collection(db, "incidents")))`         |
| Load one incident  | `onSnapshot(doc(db, "incidents", id))`                   |
| Load updates       | `onSnapshot(collection(db, "incidents", id, "updates"))` |
| Filter by state    | `query(ref, where("state", "==", "NY"))`                 |
| Sort by time       | `query(ref, orderBy("lastTs", "desc"))`                  |
| Toggle favorite    | `updateDoc(ref, { favoritedBy: arrayUnion(uid) })`       |

---

**Last Updated:** October 29, 2025  
**Author:** AI Assistant (Claude Sonnet 4.5)  
**Status:** Active Development
