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

### `useThreads()` ⚠️ STUBBED
**Collection**: `threads` (PLANNED - Not yet implemented)  
**Status**: Stubbed, returns empty array

**Future Implementation**:
\`\`\`typescript
const threadsRef = collection(db, 'threads')
const q = query(
  threadsRef,
  where('participants', 'array-contains', currentUserId),
  orderBy('lastMessageAt', 'desc')
)
\`\`\`

**Note**: Chat is currently implemented using Firebase Realtime Database, not Firestore threads collection. See below.

---

### `useMessages(threadId)` ⚠️ STUBBED
**Collection**: `threads/{threadId}/messages` (PLANNED - Not yet implemented)  
**Status**: Stubbed, returns empty array

**Note**: Chat messages are currently implemented using Firebase Realtime Database. See below.

---

### **ACTUAL IMPLEMENTATION: Firebase Realtime Database**

Chat is implemented using Firebase Realtime Database (not Firestore) for better real-time performance.

#### Incident Group Chats
**Database Path**: `/incident-chats/{incidentId}`  
**Implementation**: `lib/realtime-database.ts`

**Structure**:
\`\`\`json
/incident-chats/{incidentId}
  /metadata
    {
      "incidentId": "NFA-1834242",
      "incidentAddress": "147-25 94th Ave, Queens, NY",
      "createdAt": 1730250000000,
      "createdBy": "userId123",
      "participants": {
        "chaserUserId": true,
        "supeUserId1": true
      }
    }
  
  /messages/{pushId}
    {
      "userId": "chaserUserId",
      "userName": "John Doe",
      "message": "On scene, heavy smoke visible",
      "timestamp": 1730250120000,
      "role": "chaser"
    }
\`\`\`

**Functions**:
- `createIncidentChat(incidentId, incidentAddress, creatorId, creatorName)` → Creates chat room with all supes
- `sendIncidentMessage(incidentId, senderId, senderName, message)` → Sends message to incident chat
- `subscribeToIncidentChat(incidentId, callback)` → Real-time listener for messages

**Component**: `components/incident-chat.tsx`

#### Direct 1-on-1 Chats
**Database Path**: `/direct-chats/{chatId}`  
**Implementation**: `lib/realtime-database.ts`

**Structure**:
\`\`\`json
/direct-chats/{chatId}
  /metadata
    {
      "participants": {
        "userId1": true,
        "userId2": true
      },
      "createdAt": 1730250000000
    }
  
  /messages/{pushId}
    {
      "userId": "userId1",
      "userName": "Jane Smith",
      "message": "Can you check the basement?",
      "timestamp": 1730250150000,
      "role": "supe"
    }
\`\`\`

**Functions**:
- `createDirectChat(userId1, userId2)` → Creates 1-on-1 chat room
- `sendDirectMessage(otherUserId, message, userName, userRole)` → Sends message to direct chat
- `subscribeToDirectChat(otherUserId, callback)` → Real-time listener for messages

**Components**: `app/chaser/chat/page.tsx`, `components/chat-contacts.tsx`, `components/chat-room.tsx`

**Chat ID Generation**: Chat IDs are deterministic (sorted user IDs joined by underscore) to ensure consistency:
\`\`\`typescript
const chatId = [userId1, userId2].sort().join('_');
\`\`\`

**Why Realtime Database?**
- ✅ Optimized for high-frequency updates
- ✅ Simpler structure for messaging
- ✅ Lower latency than Firestore
- ✅ Better suited for real-time chat

**Firebase Extensions**:
- FCM Notification (to be implemented)

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
