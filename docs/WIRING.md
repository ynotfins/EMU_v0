# EMU Alerts - Data Wiring & Contracts

## Firebase Collections

### Collection: `alerts`
**Purpose**: System-wide emergency alerts

**Schema**:
\`\`\`typescript
{
  id: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Timestamp
  read: boolean
}
\`\`\`

**Indexes**: `timestamp DESC`

---

### Collection: `incidents`
**Purpose**: Emergency incidents with sequential numbering

**Schema**:
\`\`\`typescript
{
  id: string
  incidentNumber: number // Sequential, starts at 1000000
  type: 'fire' | 'flood' | 'storm' | 'other'
  address: string
  lat?: number // Geocoded via Extension
  lng?: number // Geocoded via Extension
  status: 'new' | 'assigned' | 'responding' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string // userId
  createdAt: Timestamp
  updatedAt: Timestamp
  isFavorite: boolean
  isBookmarked: boolean
  notes: string
  updates: IncidentUpdate[]
}
\`\`\`

**Indexes**: 
- `status ASC, createdAt DESC`
- `assignedTo ASC, status ASC`
- `incidentNumber DESC`

**Extensions**:
- Incident Number Counter (auto-increment `incidentNumber`)
- Geocoding (address → lat/lng on create/update)

---

### Collection: `incidents/{incidentId}/files`
**Purpose**: Documents and photos per incident

**Schema**:
\`\`\`typescript
{
  id: string
  incidentId: string
  name: string
  type: 'photo' | 'document'
  url: string
  uploadedBy: string // userId
  uploadedAt: Timestamp
  size: number
}
\`\`\`

**Extensions**:
- Resize Images (create thumbnails for photos)
- OCR (optional, extract text from images)

---

### Collection: `incidents/{incidentId}/homeowner_forms`
**Purpose**: Homeowner information per incident

**Schema**:
\`\`\`typescript
{
  id: string
  incidentId: string
  homeownerName: string
  contactPerson?: string
  phone?: string
  email?: string
  propertyAddress?: string
  incidentDate?: string
  policyNumber?: string
  carrierName?: string
  claimsPhone?: string
  damageDescription?: string
  adjusterName?: string
  adjusterPhone?: string
  additionalNotes?: string
  updatedAt: Timestamp
  updatedBy: string // userId
}
\`\`\`

---

### Collection: `esign_packets`
**Purpose**: E-signature workflow tracking

**Schema**:
\`\`\`typescript
{
  id: string
  incidentId: string
  fileIds: string[]
  recipientEmail?: string
  status: 'pending' | 'completed' | 'declined'
  sentAt: Timestamp
  completedAt?: Timestamp
  signedBy?: string // userId or email
  signatureUrl?: string
}
\`\`\`

**Extensions**:
- Send FCM notification when status changes

---

### Collection: `threads`
**Purpose**: Chat threads (team, incident, DM)

**Schema**:
\`\`\`typescript
{
  id: string
  type: 'team' | 'incident' | 'dm'
  name: string
  incidentId?: string // if type === 'incident'
  participants: string[] // userIds
  lastMessage: string
  lastMessageAt: Timestamp
  unreadCount: number
}
\`\`\`

**Indexes**: `lastMessageAt DESC`

---

### Collection: `threads/{threadId}/messages`
**Purpose**: Messages within a thread

**Schema**:
\`\`\`typescript
{
  id: string
  threadId: string
  senderId: string
  text: string
  timestamp: Timestamp
  read: boolean
}
\`\`\`

**Indexes**: `timestamp ASC`

**Extensions**:
- Send FCM notification on new message

---

### Collection: `user_profiles`
**Purpose**: User profile data

**Schema**:
\`\`\`typescript
{
  id: string // matches Firebase Auth UID
  name: string
  email: string
  role: 'admin' | 'supe' | 'chaser'
  avatar?: string
  phone?: string
  isVerified: boolean
  pushEnabled: boolean
  locationEnabled: boolean
  cashApp?: string
  venmo?: string
  stats: {
    responded: number
    noted: number
    daysActive: number
  }
  createdAt: Timestamp
}
\`\`\`

---

### Collection: `live_locations`
**Purpose**: Real-time responder locations (supe map)

**Schema**:
\`\`\`typescript
{
  id: string // userId
  name: string
  lat: number
  lng: number
  status: 'active' | 'responding' | 'idle'
  lastUpdate: Timestamp
}
\`\`\`

**Indexes**: `status ASC, lastUpdate DESC`

**Security**: Only supes and admins can read

---

## Hooks ↔ Collections Mapping

| Hook | Collection(s) | Returns | Actions |
|------|---------------|---------|---------|
| `useIncidents()` | `incidents` | `{ data: Incident[], isLoading, error }` | `respondToAlert`, `toggleFavorite`, `toggleBookmark` |
| `useIncident(id)` | `incidents/{id}`, `incidents/{id}/files`, `incidents/{id}/homeowner_forms` | `{ data: Incident, files: IncidentFile[], homeownerForm: HomeownerForm, isLoading, error }` | `addNote`, `updateStatus` |
| `useThreads()` | `threads` | `{ data: Thread[], isLoading, error }` | - |
| `useMessages(threadId)` | `threads/{threadId}/messages` | `{ data: Message[], isLoading, error }` | `sendMessage` |
| `useProfile(userId)` | `user_profiles` | `{ data: UserProfile, isLoading, error }` | `updateProfile`, `togglePush`, `toggleLocation`, `uploadAvatar` |
| `useLiveLocations()` | `live_locations` | `{ data: LiveLocation[], isLoading, error }` | - |
| `useFiles(incidentId)` | `incidents/{incidentId}/files` | `{ data: IncidentFile[], isLoading, error }` | `uploadDoc`, `deleteDoc` |
| `useFilters()` | Local state | `{ filters: FilterState, setFilters }` | `setHighAlertSound`, `subscribeTopics` |

---

## Action Stubs

All actions are currently stubs that log to console. Replace with Firebase calls in production.

### Incident Actions

\`\`\`typescript
// hooks/use-incidents.ts
respondToAlert(incidentId: string): void
toggleFavorite(incidentId: string): void
toggleBookmark(incidentId: string): void
\`\`\`

### Incident Detail Actions

\`\`\`typescript
// hooks/use-incident.ts
addNote(incidentId: string, note: string): void
updateStatus(incidentId: string, status: IncidentStatus): void
\`\`\`

### File Actions

\`\`\`typescript
// hooks/use-files.ts
uploadDoc(incidentId: string, file: File, type: 'photo' | 'document'): void
deleteDoc(incidentId: string, fileId: string): void // supe-only
\`\`\`

### E-Sign Actions

\`\`\`typescript
// hooks/use-files.ts (or create use-esign.ts)
sendForESign(incidentId: string, fileIds: string[], recipientEmail: string): void
liveSign(incidentId: string, fileIds: string[]): void
\`\`\`

### Chat Actions

\`\`\`typescript
// hooks/use-messages.ts
sendMessage(threadId: string, text: string): void
\`\`\`

### Profile Actions

\`\`\`typescript
// hooks/use-profile.ts
updateProfile(userId: string, data: Partial<UserProfile>): void
togglePush(userId: string, enabled: boolean): void
toggleLocation(userId: string, enabled: boolean): void
uploadAvatar(userId: string, file: File): void
uploadID(userId: string, file: File): void
\`\`\`

### Filter Actions

\`\`\`typescript
// hooks/use-filters.ts
setHighAlertSound(sound: string): void
subscribeTopics(topics: string[]): void
\`\`\`

---

## FCM Topic Policy

### On Login
Subscribe to: `/topics/incidents`

### On Incident Open
Subscribe to: `/topics/incident-{incidentId}`

### On Incident Close
Unsubscribe from: `/topics/incident-{incidentId}`

### Implementation
\`\`\`typescript
// lib/fcm.ts (to be created)
export async function subscribeToTopic(topic: string) {
  // Use FCM SDK to subscribe
  console.log('[v0] Subscribe to topic:', topic)
}

export async function unsubscribeFromTopic(topic: string) {
  // Use FCM SDK to unsubscribe
  console.log('[v0] Unsubscribe from topic:', topic)
}
\`\`\`

---

## Security Rules (Firestore)

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isSupe() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'supe';
    }
    
    function isSupeOrAdmin() {
      return isAdmin() || isSupe();
    }
    
    // Incidents
    match /incidents/{incidentId} {
      allow read: if isAuthenticated();
      allow create: if isSupeOrAdmin();
      allow delete: if isAdmin();
      
      // Allow all authenticated users to update incidents, but restrict certain fields
      allow update: if isAuthenticated() && (
        // Anyone can update their own favorite/bookmark status
        (onlyUpdatingUserArrays() && request.auth != null) ||
        // Only supes and admins can update other fields
        isSupeOrAdmin()
      );
      
      // Helper: Check if only favoritedBy/bookmarkedBy arrays are being modified
      function onlyUpdatingUserArrays() {
        let affectedKeys = request.resource.data.diff(resource.data).affectedKeys();
        return affectedKeys.hasOnly(['favoritedBy', 'bookmarkedBy']) &&
               // User can only add/remove their own UID
               ((!affectedKeys.hasAny(['favoritedBy']) || 
                 request.auth.uid in request.resource.data.favoritedBy == 
                 !(request.auth.uid in resource.data.get('favoritedBy', []))) &&
                (!affectedKeys.hasAny(['bookmarkedBy']) || 
                 request.auth.uid in request.resource.data.bookmarkedBy == 
                 !(request.auth.uid in resource.data.get('bookmarkedBy', []))));
      }
      
      // Files subcollection
      match /files/{fileId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow delete: if isSupeOrAdmin(); // Only supes can delete
      }
      
      // Homeowner forms
      match /homeowner_forms/{formId} {
        allow read, write: if isAuthenticated();
      }
    }
    
    // Threads
    match /threads/{threadId} {
      allow read: if isAuthenticated() && 
                     request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                       request.auth.uid in resource.data.participants;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isAuthenticated() && 
                       request.auth.uid in get(/databases/$(database)/documents/threads/$(threadId)).data.participants;
        allow create: if isAuthenticated() && 
                         request.auth.uid in get(/databases/$(database)/documents/threads/$(threadId)).data.participants;
      }
    }
    
    // User profiles
    match /user_profiles/{userId} {
      allow read: if isAuthenticated();
      allow update: if isAuthenticated() && request.auth.uid == userId;
      allow create, delete: if isAdmin();
    }
    
    // Live locations (supe/admin only)
    match /live_locations/{userId} {
      allow read: if isSupeOrAdmin();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // E-sign packets
    match /esign_packets/{packetId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated();
      allow delete: if isAdmin();
    }
    
    // Alerts
    match /alerts/{alertId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
\`\`\`

---

---

## Incidents Favorites & Bookmarks

### Multi-User Arrays
The `incidents` collection uses **array fields** for favorites and bookmarks to support multiple users:

- **`favoritedBy`**: `string[]` - Array of user IDs who favorited this incident
- **`bookmarkedBy`**: `string[]` - Array of user IDs who bookmarked this incident

### Client-Side Implementation
The `hooks/use-incidents.ts` hook provides these Firestore actions:

```typescript
// Add current user to favoritedBy array
await toggleFavorite(incidentId)

// Remove current user from favoritedBy array
await unfavorite(incidentId)

// Add current user to bookmarkedBy array
await toggleBookmark(incidentId)

// Remove current user from bookmarkedBy array
await unbookmark(incidentId)
```

### Per-User Flag Derivation
The `withUserFlags()` helper function derives `isFavorited` and `isBookmarked` flags based on the current user:

```typescript
function withUserFlags(incident: IncidentLite): IncidentLite {
  const uid = auth.currentUser?.uid
  return {
    ...incident,
    isFavorited: uid ? (incident.favoritedBy ?? []).includes(uid) : false,
    isBookmarked: uid ? (incident.bookmarkedBy ?? []).includes(uid) : false,
  }
}
```

This is the **single source of truth** for computing user-specific flags. The UI reads these flags directly without recomputation.

### Security Rules
The Firestore security rules (see above) allow authenticated users to:
- ✅ Add/remove **only their own UID** from `favoritedBy` or `bookmarkedBy` arrays
- ❌ Cannot modify other users' favorite/bookmark status
- ❌ Cannot update other incident fields (requires supe/admin role)

### Example Firestore Document
```json
{
  "id": "incident-123",
  "incidentNumber": 1001,
  "type": "Fire",
  "address": "123 Main St",
  "message": "Structure fire reported",
  "favoritedBy": ["user-uid-1", "user-uid-2", "user-uid-3"],
  "bookmarkedBy": ["user-uid-1", "user-uid-4"],
  "updatedAt": "2025-10-28T23:30:00Z",
  // ... other fields
}
```

---

## Next Steps for Production

1. **Replace Mock Hooks**: Update all hooks in `/hooks` to use Firebase SDK
2. **Implement Actions**: Replace console.log stubs with actual Firebase writes
3. **Add FCM**: Implement topic subscription logic in `/lib/fcm.ts`
4. **Configure Extensions**: Set up Firebase Extensions per `/docs/EXTENSIONS.md`
5. **Deploy Security Rules**: Apply Firestore security rules above
6. **Test End-to-End**: Verify all data flows work with real Firebase backend
