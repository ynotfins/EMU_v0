# EMU Alerts - API Mapping

## Hooks → Firestore Collections

This document maps each React hook to its corresponding Firestore collections and Firebase services.

---

## Incidents

### `useIncidents(filters)`
**Collection**: `incidents`  
**Query**: 
\`\`\`typescript
const incidentsRef = collection(db, 'incidents')
const q = query(
  incidentsRef,
  where('status', 'in', ['new', 'assigned', 'responding']),
  orderBy('createdAt', 'desc')
)
\`\`\`

**Real-time**: Yes (onSnapshot)  
**Returns**: `{ data: IncidentLite[], isLoading, error }`

**Actions**:
- `respondToAlert(incidentId)` → Update `incidents/{id}` set `status='responding'`, `assignedTo=currentUserId`

---

### `useIncident(id)`
**Collections**: 
- `incidents/{id}` (main document)
- `incidents/{id}/files` (subcollection)
- `incidents/{id}/homeowner_forms` (subcollection)

**Query**:
\`\`\`typescript
const incidentRef = doc(db, 'incidents', id)
const filesRef = collection(db, 'incidents', id, 'files')
const formsRef = collection(db, 'incidents', id, 'homeowner_forms')
\`\`\`

**Real-time**: Yes (onSnapshot on all)  
**Returns**: `{ data: Incident, isLoading, error }`

**Actions**:
- `addNote(incidentId, note)` → Update `incidents/{id}` append to `notes` array
- `updateStatus(incidentId, status)` → Update `incidents/{id}` set `status` field

---

## Files & Documents

### `useFiles(incidentId)`
**Collection**: `incidents/{incidentId}/files`  
**Query**:
\`\`\`typescript
const filesRef = collection(db, 'incidents', incidentId, 'files')
const q = query(filesRef, orderBy('uploadedAt', 'desc'))
\`\`\`

**Real-time**: Yes (onSnapshot)  
**Returns**: `{ data: FileMeta[], isLoading, error, upload, remove }`

**Actions**:
- `upload(file, message)` → Upload to Storage → Create doc in `incidents/{id}/files`
- `remove(fileId)` → Delete from Storage → Delete doc from `incidents/{id}/files`
- `sendForESign(incidentId, fileIds, email)` → Create doc in `esign_packets`
- `liveSign(incidentId, fileIds)` → Create doc in `esign_packets` with `status='completed'`

**Firebase Extensions**:
- Image Resize (auto-create thumbnails)
- OCR (optional, extract text)

---

## Chat

### `useThreads()`
**Collection**: `threads`  
**Query**:
\`\`\`typescript
const threadsRef = collection(db, 'threads')
const q = query(
  threadsRef,
  where('participants', 'array-contains', currentUserId),
  orderBy('lastMessageAt', 'desc')
)
\`\`\`

**Real-time**: Yes (onSnapshot)  
**Returns**: `{ data: Thread[], isLoading, error }`

---

### `useMessages(threadId)`
**Collection**: `threads/{threadId}/messages`  
**Query**:
\`\`\`typescript
const messagesRef = collection(db, 'threads', threadId, 'messages')
const q = query(messagesRef, orderBy('timestamp', 'asc'))
\`\`\`

**Real-time**: Yes (onSnapshot)  
**Returns**: `{ data: Message[], isLoading, error, send }`

**Actions**:
- `send(text)` → Add doc to `threads/{threadId}/messages` + Update `threads/{threadId}` lastMessage fields
- `sendMessage(threadId, text)` → Same as above

**Firebase Extensions**:
- FCM Notification (trigger on new message)

---

## User Profile

### `useProfile()`
**Collection**: `user_profiles/{currentUserId}`  
**Query**:
\`\`\`typescript
const profileRef = doc(db, 'user_profiles', currentUserId)
\`\`\`

**Real-time**: Yes (onSnapshot)  
**Returns**: `{ data: Profile, isLoading, error, updateSettings, updatePayout }`

**Actions**:
- `updateSettings(settings)` → Update `user_profiles/{id}` merge `settings` field
- `updatePayout(payout)` → Update `user_profiles/{id}` merge `payout` field
- `updateProfile(userId, data)` → Update `user_profiles/{id}` merge data
- `togglePush(userId, enabled)` → Update `user_profiles/{id}` set `pushEnabled`
- `toggleLocation(userId, enabled)` → Update `user_profiles/{id}` set `locationEnabled`
- `uploadAvatar(userId, file)` → Upload to Storage → Update `user_profiles/{id}` `avatar` field
- `uploadID(userId, file)` → Upload to Storage → Update `user_profiles/{id}` `isVerified=true`

---

## Live Locations (Supervisor Map)

### `useLiveLocations()`
**Collection**: `live_locations`  
**Query**:
\`\`\`typescript
const locationsRef = collection(db, 'live_locations')
const q = query(
  locationsRef,
  where('status', 'in', ['active', 'responding'])
)
\`\`\`

**Real-time**: Yes (onSnapshot)  
**Returns**: `{ markers: LocationMarker[], isLoading, error }`

**Security**: Only supes and admins can read

---

## Filters (Local State Only)

### `useFilters()`
**Storage**: Local React state (no Firestore)  
**Returns**: `{ filters: FilterState, setFilters, ... }`

**Actions**:
- `setHighAlertSound(sound)` → Store in localStorage + Subscribe to FCM topic
- `subscribeTopics(topics)` → Call FCM API to subscribe

---

## Firebase Cloud Messaging (FCM)

### Topic Subscriptions

**On Login**:
\`\`\`typescript
subscribeToTopic('/topics/incidents')
\`\`\`

**On Incident Open**:
\`\`\`typescript
subscribeToTopic(`/topics/incident-${incidentId}`)
\`\`\`

**On Incident Close**:
\`\`\`typescript
unsubscribeFromTopic(`/topics/incident-${incidentId}`)
\`\`\`

**Implementation**: See `lib/fcm.ts`

---

## Firebase Extensions Triggers

### Incident Number Counter
**Trigger**: `onCreate` in `incidents` collection  
**Action**: Auto-increment `incidentNumber` field starting at 1000000

### Geocoding
**Trigger**: `onCreate` or `onUpdate` in `incidents` collection when `address` changes  
**Action**: Set `lat` and `lng` fields from address

### Image Resize
**Trigger**: `onFinalize` in Storage when image uploaded to `incidents/{id}/files/`  
**Action**: Create thumbnail versions

### FCM Notifications
**Trigger**: `onCreate` in `threads/{id}/messages` or `incidents` status change  
**Action**: Send push notification to relevant users/topics

---

## Security Rules Summary

- **Incidents**: Read (all authenticated), Create (supe/admin), Update (all), Delete (admin)
- **Files**: Read (all), Create (all), Delete (supe/admin only)
- **Threads**: Read/Write (participants only)
- **Messages**: Read/Write (thread participants only)
- **Profiles**: Read (all), Update (self only), Create/Delete (admin)
- **Live Locations**: Read (supe/admin), Write (self only)

Full rules: See `docs/WIRING.md`

---

## Next Steps

1. Wire each hook with actual Firestore queries
2. Replace all `console.debug` action stubs with Firebase writes
3. Implement real-time listeners (onSnapshot)
4. Configure Firebase Extensions
5. Deploy security rules
6. Test end-to-end
