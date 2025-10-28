# System Patterns: EMU Alerts

## Architecture Overview

### Application Structure
```
Next.js 14 App Router
├── Client Components (Interactive UI)
├── Server Components (Data fetching)
├── API Routes (Future: Custom endpoints)
└── Firebase Backend (Firestore, Auth, Storage, FCM)
```

### Key Technical Decisions

#### 1. **Next.js App Router**
- **Why**: Modern React patterns, built-in routing, server components
- **Pattern**: File-based routing with role-based directory structure
- **Trade-off**: Learning curve for App Router patterns

#### 2. **Role-Based Directory Structure**
```
/app
  /(auth)      # Public routes
  /chaser      # Chaser-only routes
  /supe        # Supe-only routes (includes chaser features)
  /admin       # Admin-only routes
```
- **Why**: Clear separation, easier to secure with middleware
- **Pattern**: Parallel route trees for each role
- **Trade-off**: Some component duplication between roles

#### 3. **Component Architecture**
- **Presentational Components**: UI-only, receive props
  - Example: `<IncidentListItem />`, `<MapCard />`, `<ProfileHeader />`
- **Container Components**: Data fetching + logic
  - Example: Page components that use hooks
- **Shared UI Components**: shadcn/ui in `/components/ui`

#### 4. **Custom Hooks Pattern**
```typescript
// hooks/use-incidents.ts
export const useIncidents = () => {
  const [incidents, setIncidents] = useState<IncidentLite[]>([])
  const [loading, setLoading] = useState(true)
  
  // TODO: Replace with Firestore real-time listener
  // const unsubscribe = onSnapshot(collection(db, 'incidents'), ...)
  
  return { incidents, loading, refetch: () => {} }
}
```
- **Why**: Centralize data access, easy to swap mock → Firebase
- **Current State**: Stub implementations with TODOs
- **Next Step**: Implement Firestore queries

#### 5. **Type-First Development**
```typescript
// types/domain.ts - Single source of truth
export type Incident = { ... }
export type Profile = { ... }
```
- **Why**: TypeScript strict mode catches errors early
- **Pattern**: All domain types in `/types/domain.ts`
- **Trade-off**: Type errors must be fixed before deployment

## Component Relationships

### Incident Management Flow
```
Page (chaser/incidents)
  ├── useIncidents() hook
  │     └── Firestore: /incidents collection
  ├── useFilters() hook (client state)
  └── <FilterBar /> + <IncidentListItem />
        └── Events: onToggleFavorite, onToggleSilence, etc.
```

### Chat System Flow
```
Page (chaser/chat/[threadId])
  ├── useThreads() hook
  │     └── Firestore: /threads collection
  ├── useMessages(threadId) hook
  │     └── Firestore: /threads/{id}/messages subcollection
  └── <ChatRoom />
        └── <MessageList /> + <MessageInput />
```

### Profile Management Flow
```
Page (chaser/profile)
  ├── useProfile(uid) hook
  │     └── Firestore: /profiles/{uid} document
  └── Components:
        ├── <ProfileHeader />
        ├── <StatsCards />
        ├── <IDVerificationCard />
        ├── <PreferencesCard />
        └── <EmergencyPaymentCard />
```

## Critical Implementation Paths

### Authentication & Authorization
```
1. Login Page → Firebase Auth
2. Get user UID → Fetch profile from /profiles/{uid}
3. Check role (chaser, supe, admin)
4. Redirect to role-specific dashboard
5. Middleware validates role for protected routes
```

### Real-Time Incident Updates
```
1. useIncidents() establishes Firestore listener
2. onSnapshot triggers on any /incidents change
3. Filter logic applied client-side
4. UI updates immediately
5. High-alert incidents trigger FCM push notification
```

### Live Location Tracking
```
1. Chaser enables location in profile settings
2. Geolocation API gets current position
3. Update Firestore /profiles/{uid}/location every 5-10 seconds
4. Supe's LiveMap subscribes to all /profiles where role=chaser
5. Map markers update in real-time
```

### Document Upload Flow
```
1. User selects file(s) in incident details
2. Upload to Firebase Storage: /incidents/{incidentId}/files/{filename}
3. Create Firestore doc: /files collection with metadata
4. Update incident doc with file reference
5. UI shows uploaded file with download link
```

### E-Signature Flow
```
1. User initiates signature request
2. Create Firestore doc: /signatures collection
3. Send notification to signer (FCM or email)
4. Signer opens unique link, signs on device
5. Signature saved to Storage, doc updated
6. Requestor gets notification of completion
```

## Design Patterns in Use

### 1. **Optimistic Updates**
- Update UI immediately, sync to Firestore in background
- Rollback if network request fails
- Example: Toggling favorites, muting incidents

### 2. **Stale-While-Revalidate**
- Show cached data immediately
- Fetch fresh data in background
- Update UI when fresh data arrives
- Example: Incident list on page load

### 3. **Pub/Sub for Real-Time**
- Components subscribe to Firestore collections
- Automatic UI updates when data changes
- Unsubscribe on component unmount
- Example: Chat messages, incident updates

### 4. **Context for Cross-Cutting State**
- Favorites stored in React Context
- Persisted to localStorage and Firestore
- Accessible from any component
- Example: `FavoritesContext` in `/lib/context/favorites-context.tsx`

### 5. **Error Boundaries**
- Catch component errors gracefully
- Show fallback UI instead of crash
- Log errors for debugging
- Pattern: Wrap critical sections with ErrorBoundary

## Technology Integration Points

### Firebase Integration
- **Firestore**: Primary database (NoSQL document store)
- **Auth**: User authentication (email/password, eventually SSO)
- **Storage**: File uploads (photos, documents, signatures)
- **FCM**: Push notifications (high alerts, chat messages)
- **Extensions**: Automated workflows (thumbnails, resize images)

### Google Maps Integration
- **Maps JavaScript API**: Render maps in MapCard and LiveMap
- **Geocoding API**: Convert addresses to coordinates
- **Geolocation API**: Browser API for GPS coordinates

### Vercel Deployment
- **Edge Functions**: Fast API routes globally distributed
- **Environment Variables**: Secure credential storage
- **Analytics**: Track performance and usage

