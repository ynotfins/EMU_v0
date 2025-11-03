# EMU Alerts - Complete Rebuild Plan
**Version**: 2.0 - Shared Component Architecture  
**Date**: 2025-11-03  
**Status**: READY FOR EXECUTION

---

## 🎯 **Core Architecture Decision**

### **ONE App, TWO Roles, SHARED Components**

**NOT**: Separate `/chaser` and `/supe` directories (90% duplication)  
**YES**: Shared pages with role-based conditional rendering

**Rationale**:
- Chaser and Supe are 90% identical
- Better to share code and conditionally render differences
- Easier to maintain, test, and debug
- Industry best practice for multi-role apps
- Follows Next.js patterns

---

## 📊 **Database Architecture (Confirmed)**

### **Firestore** (Primary Database)
**Use For**: Persistent data, queries, structured documents

```
/incidents/{incidentId}  ← Fire alerts (LIVE from BNN)
  ├── Fields:
  │   ├── id: string
  │   ├── incidentNumber: number
  │   ├── address: string
  │   ├── city: string
  │   ├── state: string
  │   ├── county: string
  │   ├── type: string
  │   ├── message: string
  │   ├── lat: number ✅
  │   ├── lng: number ✅
  │   ├── source: "BNN"
  │   ├── updatedAt: timestamp
  │   ├── firstSeenAt: timestamp
  │   └── updateCount: number
  │
  └── /updates/{updateId}  ← Subcollection (same incident, additional info)
      ├── message: string
      ├── ts: timestamp
      ├── address: string
      ├── lat: null
      └── lng: null

/users/{userId}
  ├── email: string
  ├── role: "chaser" | "supe"
  ├── displayName: string
  ├── location: {
  │   lat: number,
  │   lng: number,
  │   lastUpdated: timestamp,
  │   accuracy: number
  │ }
  ├── settings: {
  │   trackingEnabled: boolean,
  │   pushEnabled: boolean,
  │   muted: boolean,
  │   highAlertSound: string
  │ }
  └── stats: { responded: number, noted: number, daysActive: number }

/favorites/{favoriteId}
/bookmarks/{bookmarkId}
/notes/{noteId}
/responses/{responseId}
/notifications/{notificationId}

CRM Collections (Supe access only):
/claims
/leads  
/documents
/esignatures
/form_templates
/employees (extended user data)
```

### **Realtime Database** (Chat System)
**Use For**: Real-time messaging, transient data

```
/incident-chats/{incidentId}
  ├── participants: { userId: role, ... }
  ├── createdBy: userId
  ├── incidentAddress: string
  └── /messages/{messageId}
      ├── userId: string
      ├── userName: string
      ├── userRole: string
      ├── message: string
      ├── timestamp: number
      └── read: boolean

/direct-chats/{chatId}
  ├── participants: { userId: role, ... }
  ├── lastMessage: string
  ├── lastMessageTime: timestamp
  └── /messages/{messageId}
      (same structure as incident chats)
```

**Decision**: ✅ Keep this exact structure - it's working correctly

---

## 🔐 **Environment Configuration**

### **`.env.local`** (Development + Secrets)
```bash
# Firebase Client SDK (browser-safe, NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=XXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=4axe.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=emu-incidents
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=emu-incidents.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=XXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_APP_ID=XXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://emu-incidents-default-rtdb.firebaseio.com

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=XXXXXXXXXXXXX

# Firebase Admin SDK (server-only, SECRET)
FIREBASE_ADMIN_PROJECT_ID=emu-incidents
FIREBASE_ADMIN_CLIENT_EMAIL=XXXXXXXXXXXXX@emu-incidents.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXXXXXXXXXX\n-----END PRIVATE KEY-----\n"

# App Config
NEXT_PUBLIC_APP_URL=https://4axe.com
NODE_ENV=development
```

### **Vercel Environment Variables**
(Same as above, set in Vercel dashboard)

---

## 📁 **Project Structure (src/ Directory)**

```
/src
  /app                    ← Next.js App Router
    /actions              ← Server Actions (NEW)
      auth.ts             ← Login/logout actions
      incidents.ts        ← Incident mutations
      profile.ts          ← Profile updates
    
    /(auth)               ← Public routes
      /login
        page.tsx
      /signup
        page.tsx
    
    /(protected)          ← Authenticated routes (NEW)
      /incidents
        page.tsx          ← Server Component (role-aware)
        incidents-client.tsx
      
      /incident/[id]
        page.tsx          ← Server Component (shared)
        incident-client.tsx
      
      /map
        page.tsx          ← Server Component (shared)
        map-client.tsx
      
      /profile
        page.tsx          ← Server Component (role-aware)
        profile-client.tsx
      
      /chat
        page.tsx
        chat-client.tsx
      
      /favorites
        page.tsx
      
      /crm              ← Supe ONLY (middleware protected)
        /claims
        /leads
        /documents
        /employees
        /esign
        /forms
        page.tsx
      
      layout.tsx        ← Protected layout wrapper
    
    layout.tsx          ← Root layout
    page.tsx            ← Redirect to /login or /incidents
  
  /components
    /ui                 ← shadcn/ui (keep current)
    
    incident-list-item.tsx
    incident-detail-tabs.tsx
    google-map.tsx
    live-team-map.tsx
    filter-bar.tsx
    bottom-nav.tsx
    profile-header.tsx
    chat-room.tsx
    (all other shared components)
    
    CRM Components:
    employee-onboarding.tsx
    form-builder.tsx
    document-viewer.tsx
    e-signature.tsx
  
  /lib
    /modules            ← Consolidated business logic (NEW)
      auth.module.ts    ← ALL authentication in one file
      incident.module.ts ← ALL incident operations
      database.module.ts ← Database utilities
      chat.module.ts    ← Chat functionality
      maps.module.ts    ← Map operations
      storage.module.ts ← File storage
      user.module.ts    ← User profile management
      
    /firebase
      firebase-client.ts  ← Client SDK initialization
      firebase-admin.ts   ← Admin SDK initialization
      auth-persistence.ts ← Auth state persistence
      
    /utils
      realtime-database.ts ← Chat DB operations
      logger.ts         ← Centralized logging
      
    /lead-generation
      index.ts
  
  /hooks
    use-incidents.ts
    use-incident.ts
    use-profile.ts
    use-filters.ts
    use-location-distance.ts
    use-live-locations.ts
  
  /types
    domain.ts           ← All types (keep + CRM types)
  
  middleware.ts         ← Proper session verification (NEW)

/public
  app-icon.png
  manifest.json
  firebase-messaging-sw.js

.env.local              ← All secrets
.env.local.example      ← Template (no secrets)
next.config.mjs
tsconfig.json
package.json
```

---

## 🔄 **Phase-by-Phase Implementation**

### **Phase 0: Preparation** (30 minutes)

#### 0.1 Create Backup
```bash
# Save current state
git checkout -b backup-nov3-pre-rebuild
git push origin backup-nov3-pre-rebuild

# Save CRM work specifically
mkdir -p _backup/crm
cp -r app/crm _backup/crm
cp -r components/employee-onboarding.tsx _backup/
cp -r components/form-builder.tsx _backup/
cp -r components/document-viewer.tsx _backup/
cp -r components/e-signature.tsx _backup/
cp -r lib/lead-generation _backup/
git add _backup && git commit -m "backup: save CRM work before rebuild"
```

#### 0.2 Rollback to Stable
```bash
# Go to Nov 2 @ 3:19 PM (working maps/updates)
git reset --hard b8f0754
git push --force origin main
```

#### 0.3 Verify Stable State
- Test login works
- Test map displays on detail page
- Test updates show all items
- Confirm this is our solid baseline

---

### **Phase 1: Project Restructure** (1 hour)

#### 1.1 Create src/ Directory
```bash
mkdir src
```

#### 1.2 Move Directories
```bash
# Move main directories
mv app src/
mv components src/
mv lib src/
mv hooks src/
mv types src/

# Update paths
```

#### 1.3 Update tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

#### 1.4 Update next.config.mjs
No changes needed - Next.js auto-detects src/

#### 1.5 Test Build
```bash
npm run build
# Must pass before proceeding
```

---

### **Phase 2: Firebase Proper Separation** (1 hour)

#### 2.1 Create firebase-client.ts
**File**: `src/lib/firebase-client.ts`

```typescript
'use client'

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
}

// Initialize Firebase Client SDK (singleton)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app)
export const rtdb = getDatabase(app)
export const storage = getStorage(app)

// Set persistence to LOCAL (never expires)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
  
  // Enable offline persistence
  enableIndexedDbPersistence(db).catch(err => {
    console.warn('Firestore persistence:', err.code)
  })
}

// Messaging (only in browser with service worker support)
export const getMessagingInstance = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      return getMessaging(app)
    } catch {
      return null
    }
  }
  return null
}
```

#### 2.2 Create firebase-admin.ts
**File**: `src/lib/firebase-admin.ts`

```typescript
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK
let adminApp: App

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  })
} else {
  adminApp = getApps()[0]
}

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export { adminApp }
```

#### 2.3 Update All Imports
- Client Components → `from '@/lib/firebase-client'`
- Server Components → `from '@/lib/firebase-admin'`
- Remove old `lib/firebase.ts`

---

### **Phase 2.5: Module Architecture** (2 hours)

#### Create Consolidated Module Files

Instead of scattering functionality across multiple files, we consolidate into focused modules:

**Auth Module** (`src/lib/modules/auth.module.ts`):
```typescript
// Single source of truth for ALL authentication
export class AuthenticationModule {
  // Methods:
  - signInWithEmail(email, password)
  - signInWithGoogle()
  - signUpWithEmail(data)
  - signOut()
  - onAuthStateChanged(callback)
  - getUserRole(uid)
  - updateUserRole(uid, role)
  - isAuthenticated()
  - hasRole(role)
  - isAdmin()
}

// Export singleton
export const authModule = new AuthenticationModule()
```

**Benefits**:
- ✅ No more auth logic in 10+ different files
- ✅ Single place to debug auth issues
- ✅ Easy to test
- ✅ Clear API surface

**Incident Module** (`src/lib/modules/incident.module.ts`):
```typescript
// ALL incident operations in one place
export class IncidentModule {
  // Methods:
  - createIncident(data)
  - getIncident(id)
  - getIncidents(filters)
  - getRecentIncidents(limit)
  - updateIncident(id, updates)
  - deleteIncident(id)
  - addIncidentUpdate(id, update)
  - addChaserResponse(id, response)
  - toggleFavorite(id)
  - toggleSilence(id)
  - assignIncident(id, chaserIds)
  - subscribeToIncident(id, callback)
  - subscribeToIncidents(callback, filters)
}
```

**Database Module** (`src/lib/modules/database.module.ts`):
```typescript
// Generic database utilities used by other modules
export class DatabaseModule {
  - getDocument(collection, id)
  - getDocuments(collection, query)
  - createDocument(collection, data)
  - updateDocument(collection, id, data)
  - deleteDocument(collection, id)
  - batchOperations(operations)
  - subscribeToDocument(collection, id, callback)
  - subscribeToCollection(collection, callback)
}
```

**How Components Use Modules**:
```typescript
// BEFORE (scattered):
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { saveAuthState } from '@/lib/auth-persistence'
// ... logic spread across file

// AFTER (consolidated):
import { authModule } from '@/lib/modules/auth.module'
await authModule.signInWithEmail(email, password)
// That's it! All complexity handled in module
```

---

### **Phase 3: Authentication Rebuild** (2 hours)

#### 3.1 Server Actions for Auth
**File**: `src/app/actions/auth.ts`

```typescript
'use server'

import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase-admin'

export async function createSession(idToken: string) {
  try {
    // Verify ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    
    // Create session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })
    
    // Set httpOnly cookie (secure!)
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.4axe.com' : undefined,
    })
    
    return { success: true, uid: decodedToken.uid }
  } catch (error: any) {
    console.error('[Server] Session creation failed:', error)
    return { success: false, error: error.message }
  }
}

export async function destroySession() {
  cookies().delete('session')
  return { success: true }
}

export async function getUserFromSession() {
  const sessionCookie = cookies().get('session')?.value
  
  if (!sessionCookie) {
    return null
  }
  
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      role: decodedClaims.role || 'chaser',
    }
  } catch {
    return null
  }
}
```

#### 3.2 Login Page (Client Component)
**File**: `src/app/(auth)/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase-client'
import { createSession } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Sign in with Firebase Client SDK
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // 2. Get ID token
      const idToken = await userCredential.user.getIdToken()
      
      // 3. Create server session via Server Action
      const result = await createSession(idToken)
      
      if (result.success) {
        // 4. Redirect (middleware will handle role-based routing)
        router.push('/incidents')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const idToken = await userCredential.user.getIdToken()
      const result = await createSession(idToken)
      
      if (result.success) {
        router.push('/incidents')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Keep current beautiful UI */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <Input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <Input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        <Button type="button" onClick={handleGoogleLogin}>
          Sign in with Google
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  )
}
```

#### 3.3 Middleware (Proper Verification)
**File**: `src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

const PUBLIC_PATHS = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Verify session cookie
  const sessionCookie = request.cookies.get('session')?.value
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  try {
    // Verify with Admin SDK (secure!)
    await adminAuth.verifySessionCookie(sessionCookie, true)
    return NextResponse.next()
  } catch {
    // Invalid session - redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
}
```

**Benefits**: ✅ No race conditions, secure server-side verification

---

### **Phase 4: Shared Pages with Role-Aware Logic** (3 hours)

#### 4.1 Incidents List Page
**File**: `src/app/(protected)/incidents/page.tsx` (Server Component)

```typescript
// Server Component - NO 'use client'
import { adminDb } from '@/lib/firebase-admin'
import { getUserFromSession } from '@/app/actions/auth'
import IncidentsClient from './incidents-client'
import { redirect } from 'next/navigation'

export default async function IncidentsPage() {
  // Get user session server-side
  const user = await getUserFromSession()
  
  if (!user) {
    redirect('/login')
  }
  
  // Fetch initial incidents (fast server-side query)
  const snapshot = await adminDb
    .collection('incidents')
    .orderBy('updatedAt', 'desc')
    .limit(50)
    .get()
  
  const initialIncidents = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  
  // Pass to Client Component with role
  return <IncidentsClient 
    initialData={initialIncidents} 
    userRole={user.role}
    userId={user.uid}
  />
}
```

**File**: `src/app/(protected)/incidents/incidents-client.tsx` (Client Component)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase-client'
import { IncidentListItem } from '@/components/incident-list-item'
import { FilterBar } from '@/components/filter-bar'
import { BottomNav } from '@/components/bottom-nav'

interface Props {
  initialData: any[]
  userRole: 'chaser' | 'supe'
  userId: string
}

export default function IncidentsClient({ initialData, userRole, userId }: Props) {
  // Start with server data (instant display!)
  const [incidents, setIncidents] = useState(initialData)
  const [filters, setFilters] = useState({
    distance: 50,
    types: [],
    highAlertOnly: false
  })
  
  // Add real-time listener
  useEffect(() => {
    const q = query(
      collection(db, 'incidents'),
      orderBy('updatedAt', 'desc')
    )
    
    return onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setIncidents(data)
    })
  }, [])
  
  // Filter based on role
  const filteredIncidents = userRole === 'supe'
    ? incidents  // Supe sees ALL
    : incidents.filter(inc => {
        // Chaser filters by distance (client-side)
        if (filters.distance && inc.distanceMi) {
          return inc.distanceMi <= filters.distance
        }
        return true
      })
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Keep your beautiful header */}
      <Header role={userRole} />
      
      {/* Filters - Chaser has more options */}
      <FilterBar 
        role={userRole}
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      {/* Incident list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredIncidents.map(incident => (
          <IncidentListItem 
            key={incident.id}
            incident={incident}
            userRole={userRole}
          />
        ))}
      </div>
      
      {/* Bottom nav - different tabs per role */}
      <BottomNav role={userRole} />
    </div>
  )
}
```

#### 4.2 Incident Detail Page (Shared)
**File**: `src/app/(protected)/incident/[id]/page.tsx` (Server Component)

```typescript
import { adminDb } from '@/lib/firebase-admin'
import { getUserFromSession } from '@/app/actions/auth'
import IncidentDetailClient from './incident-client'
import { notFound } from 'next/navigation'

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const user = await getUserFromSession()
  if (!user) redirect('/login')
  
  // Fetch incident + updates server-side
  const incidentDoc = await adminDb.collection('incidents').doc(params.id).get()
  
  if (!incidentDoc.exists) {
    notFound()
  }
  
  const incident = {
    id: incidentDoc.id,
    ...incidentDoc.data()
  }
  
  // Fetch updates subcollection
  const updatesSnapshot = await adminDb
    .collection('incidents')
    .doc(params.id)
    .collection('updates')
    .orderBy('ts', 'desc')
    .get()
  
  const updates = updatesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  
  return (
    <IncidentDetailClient 
      incident={incident}
      initialUpdates={updates}
      userRole={user.role}
    />
  )
}
```

**File**: `incident-client.tsx` (Client Component)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase-client'
import { GoogleMap } from '@/components/google-map'

export default function IncidentDetailClient({ incident, initialUpdates, userRole }) {
  const [updates, setUpdates] = useState(initialUpdates)  // Server data!
  
  // Add real-time listener for new updates
  useEffect(() => {
    const q = collection(db, `incidents/${incident.id}/updates`)
    
    return onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUpdates(data)
    })
  }, [incident.id])
  
  return (
    <div>
      {/* Map - single incident location */}
      <div className="h-64">
        <GoogleMap 
          center={incident.lat && incident.lng ? {
            lat: Number(incident.lat),
            lng: Number(incident.lng)
          } : undefined}
          zoom={15}
        />
      </div>
      
      {/* Incident info */}
      <div className="p-4">
        <h2>{incident.type}</h2>
        <p>{incident.address}, {incident.city}, {incident.state}</p>
      </div>
      
      {/* Updates - server data + real-time */}
      <div className="p-4">
        <h3>Updates ({updates.length})</h3>
        
        {/* Initial alert */}
        <UpdateCard 
          title="INITIAL ALERT"
          message={incident.message}
          timestamp={incident.updatedAt}
        />
        
        {/* All updates */}
        {updates.map((update, i) => (
          <UpdateCard 
            key={update.id}
            title={`UPDATE #${i + 1}`}
            message={update.message}
            timestamp={update.ts}
          />
        ))}
      </div>
      
      {/* Role-specific actions */}
      {userRole === 'chaser' && (
        <Button onClick={handleRespond}>Respond to Alert</Button>
      )}
    </div>
  )
}
```

#### 4.3 Profile Page (Role-Aware)
**File**: `src/app/(protected)/profile/page.tsx` (Server Component)

```typescript
import { adminDb } from '@/lib/firebase-admin'
import { getUserFromSession } from '@/app/actions/auth'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
  const user = await getUserFromSession()
  if (!user) redirect('/login')
  
  // Fetch user profile
  const userDoc = await adminDb.collection('users').doc(user.uid).get()
  const profile = { id: userDoc.id, ...userDoc.data() }
  
  // If Supe, fetch team members for map
  let teamMembers = []
  if (user.role === 'supe') {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const usersSnapshot = await adminDb
      .collection('users')
      .where('location.lastUpdated', '>', fiveMinutesAgo.toISOString())
      .get()
    
    teamMembers = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }
  
  return (
    <ProfileClient 
      profile={profile}
      teamMembers={teamMembers}  // Empty for Chaser, populated for Supe
      userRole={user.role}
    />
  )
}
```

**File**: `profile-client.tsx` (Client Component)

```typescript
'use client'

export default function ProfileClient({ profile, teamMembers, userRole }) {
  return (
    <div>
      {/* Shared for both */}
      <ProfileHeader profile={profile} />
      <StatsCards stats={profile.stats} />
      <PreferencesCard settings={profile.settings} />
      
      {/* Chaser-specific */}
      {userRole === 'chaser' && (
        <LocationTrackingToggle />
      )}
      
      {/* Supe-specific */}
      {userRole === 'supe' && (
        <LiveTeamMap 
          initialTeamMembers={teamMembers}  // Server data!
        />
      )}
      
      {/* Shared */}
      <PaymentCard />
      <SignOutButton />
    </div>
  )
}
```

---

### **Phase 5: Google Maps Proper Implementation** (1 hour)

#### 5.1 Install Official Package
```bash
npm install @react-google-maps/api
```

#### 5.2 Create Proper Map Component
**File**: `src/components/google-map.tsx`

```typescript
'use client'

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

interface MapProps {
  center?: { lat: number; lng: number }
  markers?: Array<{ lat: number; lng: number; label: string }>
  zoom?: number
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

export function Map({ center, markers = [], zoom = 13 }: MapProps) {
  if (!center && markers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p>No location data available</p>
      </div>
    )
  }
  
  const mapCenter = center || {
    lat: markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
    lng: markers.reduce((sum, m) => sum + m.lng, 0) / markers.length,
  }
  
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
      >
        {/* Single marker for detail page */}
        {center && (
          <Marker position={center} />
        )}
        
        {/* Multiple markers for list maps */}
        {markers.map((marker, i) => (
          <Marker 
            key={i}
            position={{ lat: marker.lat, lng: marker.lng }}
            label={marker.label}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  )
}
```

**Benefits**:
- ✅ Official Google Maps SDK
- ✅ Proper marker support
- ✅ Customizable
- ✅ Info windows
- ✅ Clustering (can add)
- ✅ No iframe limitations

---

### **Phase 6: Bottom Navigation (Role-Based)** (30 minutes)

#### Keep Current UI, Make Role-Aware
**File**: `src/components/bottom-nav.tsx`

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, Map, Star, User, Briefcase } from 'lucide-react'

interface Props {
  role: 'chaser' | 'supe'
}

export function BottomNav({ role }: Props) {
  const pathname = usePathname()
  
  // Chaser tabs
  const chaserTabs = [
    { href: '/incidents', icon: Home, label: 'Incidents' },
    { href: '/chat', icon: MessageCircle, label: 'Chat' },
    { href: '/map', icon: Map, label: 'Map' },
    { href: '/favorites', icon: Star, label: 'Favorites' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]
  
  // Supe tabs (same + CRM)
  const supeTabs = [
    { href: '/incidents', icon: Home, label: 'Incidents' },
    { href: '/chat', icon: MessageCircle, label: 'Chat' },
    { href: '/map', icon: Map, label: 'Map' },
    { href: '/crm', icon: Briefcase, label: 'CRM' },  // ← Different!
    { href: '/profile', icon: User, label: 'Profile' },
  ]
  
  const tabs = role === 'supe' ? supeTabs : chaserTabs
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="flex justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = pathname.startsWith(tab.href)
          
          return (
            <Link 
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center p-2 ${
                isActive ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

**Key Differences**:
- Chaser: Favorites tab
- Supe: CRM tab (instead of Favorites)
- Both: Incidents, Chat, Map, Profile

---

### **Phase 7: CRM Integration (Proper)** (2 hours)

#### 7.1 CRM Routes Structure
```
src/app/(protected)/crm/
  page.tsx                ← Dashboard (Server Component)
  
  /claims/
    page.tsx              ← Claims list (Server Component)
    claims-client.tsx
    /[id]/page.tsx        ← Claim detail (Server Component)
    /new/page.tsx
  
  /employees/
    page.tsx              ← Employee list (Server Component)
    employees-client.tsx
  
  /leads/
    page.tsx
    /new/page.tsx
    /settings/page.tsx
  
  /documents/
    page.tsx
  
  /forms/
    page.tsx
  
  /esign/
    page.tsx
```

#### 7.2 CRM Middleware Protection
**Add to** `src/middleware.ts`:

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // ... existing auth check ...
  
  // CRM routes - Supe only
  if (pathname.startsWith('/crm')) {
    try {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
      
      // Fetch user role from Firestore
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
      const role = userDoc.data()?.role
      
      if (role !== 'supe' && role !== 'admin' && role !== 'super_admin') {
        return NextResponse.redirect(new URL('/incidents', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}
```

#### 7.3 CRM Dashboard (Server Component)
**File**: `src/app/(protected)/crm/page.tsx`

```typescript
import { adminDb } from '@/lib/firebase-admin'
import { getUserFromSession } from '@/app/actions/auth'
import CRMDashboardClient from './crm-client'

export default async function CRMPage() {
  const user = await getUserFromSession()
  
  // Double-check Supe access
  if (user?.role !== 'supe' && user?.role !== 'admin') {
    redirect('/incidents')
  }
  
  // Fetch CRM stats server-side
  const claimsCount = (await adminDb.collection('claims').count().get()).data().count
  const leadsCount = (await adminDb.collection('leads').count().get()).data().count
  const employeesCount = (await adminDb.collection('users').count().get()).data().count
  
  const stats = {
    claims: claimsCount,
    leads: leadsCount,
    employees: employeesCount
  }
  
  return <CRMDashboardClient stats={stats} />
}
```

---

### **Phase 8: Chat System (Group vs PM Logic)** (1 hour)

#### Keep Current Realtime DB Functions (They're Correct!)

**File**: `src/lib/realtime-database.ts` (Keep as-is, just move to src/)

**The logic is already perfect**:
```typescript
// Incident chat = Group (Chaser + ALL Supes)
createIncidentChat(incidentId, address)
  → Queries users WHERE role IN ['supe', 'admin', 'super_admin']
  → Adds Chaser + ALL Supes as participants
  → Group chat

// Direct chat = PM (1-on-1)
createDirectChat(otherUserId, otherUserName, otherUserRole)
  → Generates chatId from sorted user IDs
  → Only 2 participants
  → Private message
```

**Chat Page** (Shared):
```typescript
// src/app/(protected)/chat/page.tsx
export default function ChatPage() {
  const user = await getUserFromSession()
  
  // Fetch contacts based on role
  let contacts
  if (user.role === 'supe') {
    // Supe sees all users
    contacts = await adminDb.collection('users').get()
  } else {
    // Chaser sees Supes + other Chasers
    contacts = await adminDb.collection('users')
      .where('role', 'in', ['chaser', 'supe', 'admin'])
      .get()
  }
  
  return <ChatClient contacts={contacts} userRole={user.role} />
}
```

**When User Clicks Contact**:
```typescript
// In ChatClient.tsx
const handleContactClick = async (contact) => {
  if (userRole === 'chaser' && contact.role === 'supe') {
    // Chaser → Supe: Should this be group or PM?
    // CURRENT: Direct PM
    // USER WANTS: Group with all Supes (only from incident page)
    await createDirectChat(contact.id, contact.name, contact.role)
  } else {
    // Chaser → Chaser or Supe → Anyone: PM
    await createDirectChat(contact.id, contact.name, contact.role)
  }
}
```

**Incident Chat** (Group):
```typescript
// Only from incident detail page "Chat" button
const handleIncidentChat = async () => {
  await createIncidentChat(incidentId, incident.address)
  // This creates group with ALL Supes automatically
}
```

---

## 🗺️ **Map Strategy (Three Types, All Working)**

### **1. Detail Map** (Single Incident)
```typescript
// Both roles use same component
<GoogleMap 
  center={{ lat: incident.lat, lng: incident.lng }}
  markers={[{ 
    lat: incident.lat, 
    lng: incident.lng, 
    label: incident.address 
  }]}
  zoom={15}
/>
```

### **2. Live Alert Map** (Both Have This)
```typescript
// /map page (shared)
const recentIncidents = await adminDb.collection('incidents')
  .where('updatedAt', '>', fourHoursAgo)
  .where('lat', '!=', null)
  .orderBy('updatedAt', 'desc')
  .limit(10)
  .get()

<GoogleMap 
  markers={recentIncidents.map(inc => ({
    lat: inc.lat,
    lng: inc.lng,
    label: inc.address
  }))}
  zoom={10}
/>
```

### **3. Team Map** (Supe Profile Only)
```typescript
// In profile-client.tsx
{userRole === 'supe' && (
  <LiveTeamMap initialMembers={teamMembers}>
    <GoogleMap 
      markers={activeUsers.map(user => ({
        lat: user.location.lat,
        lng: user.location.lng,
        label: user.displayName
      }))}
      zoom={10}
    />
  </LiveTeamMap>
)}
```

---

## 📋 **Complete Execution Plan**

### **Phase 0: Backup & Rollback** (30 min)
- [ ] Create backup branch
- [ ] Save CRM to `_backup/` directory
- [ ] Reset to `b8f0754`
- [ ] Verify stable state
- [ ] Document what works

### **Phase 1: Structure** (1 hour)
- [ ] Move to `src/` directory
- [ ] Update tsconfig.json
- [ ] Update all import paths
- [ ] Test build passes

### **Phase 2: Firebase Separation & Modules** (2 hours)
- [ ] Create `firebase-client.ts`
- [ ] Create `firebase-admin.ts` 
- [ ] Create module files:
  - [ ] `auth.module.ts` - All authentication logic
  - [ ] `incident.module.ts` - All incident operations
  - [ ] `database.module.ts` - Database utilities
  - [ ] `chat.module.ts` - Chat functionality
  - [ ] `maps.module.ts` - Map operations
  - [ ] `user.module.ts` - User profile management
- [ ] Update all imports to use modules
- [ ] Test modules work correctly

### **Phase 3: Auth Rebuild** (2 hours)
- [ ] Server Actions for auth
- [ ] httpOnly session cookies
- [ ] Middleware with Admin SDK verification
- [ ] Test login on PC/mobile/PWA
- [ ] **MUST WORK before proceeding**

### **Phase 4: Shared Pages** (3 hours)
- [ ] `/incidents` - Server Component + Client (role-aware)
- [ ] `/incident/[id]` - Server Component + Client (shared)
- [ ] `/profile` - Server Component + Client (role-aware)
- [ ] `/map` - Shared alert map
- [ ] `/chat` - Shared with role logic
- [ ] `/favorites` - Shared

### **Phase 5: Maps** (1 hour)
- [ ] Install `@react-google-maps/api`
- [ ] Implement detail map (single incident)
- [ ] Implement alert map (last 10, 4 hours)
- [ ] Implement team map (Supe profile only)
- [ ] **Test each map type works**

### **Phase 6: Bottom Nav** (30 min)
- [ ] Update with role prop
- [ ] Chaser: Incidents, Chat, Map, Favorites, Profile
- [ ] Supe: Incidents, Chat, Map, CRM, Profile
- [ ] Test navigation

### **Phase 7: CRM Re-integration** (2 hours)
- [ ] Copy from `_backup/crm/`
- [ ] Refactor to Server Components
- [ ] Add middleware protection
- [ ] Test each CRM module
- [ ] Claims, Employees, Leads, Docs, E-sign, Forms

### **Phase 8: Final Testing** (1 hour)
- [ ] Test Chaser full flow
- [ ] Test Supe full flow
- [ ] Test chat interaction
- [ ] Test maps all 3 types
- [ ] Test on PC, mobile, PWA

**Total Time**: ~12 hours of focused work  
**Timeline**: 2-3 days  
**Success Criteria**: All features work, following best practices

---

## 🎯 **Key Architectural Decisions**

### **1. Shared Components**
✅ **Decision**: ONE set of pages, role-based rendering  
**Benefit**: 90% less code duplication

### **2. Server Components**
✅ **Decision**: Use Server Components for initial data  
**Benefit**: Fast loads, no flash of empty state, SEO

### **3. Auth Pattern**
✅ **Decision**: Server Actions + httpOnly cookies  
**Benefit**: Secure, no race conditions, works on all platforms

### **4. Database Split**
✅ **Decision**: Firestore for data, Realtime DB for chat  
**Benefit**: Right tool for right job (already working)

### **5. Map Implementation**
✅ **Decision**: Official `@react-google-maps/api`  
**Benefit**: Full features, proper support, customizable

### **6. Role Architecture**
✅ **Decision**: Conditional rendering, not separate apps  
**Benefit**: Maintainable, scalable, best practice

---

## 📝 **Success Criteria Checklist**

### **Must Work After Rebuild**:

**Authentication**:
- [ ] Login on PC (no race conditions)
- [ ] Login on mobile Chrome
- [ ] Login on PWA
- [ ] Session persists properly
- [ ] Logout works correctly

**Chaser Features**:
- [ ] See incidents list (with real BNN data)
- [ ] Filter by distance (client-side)
- [ ] Sort by distance/time
- [ ] Click incident → detail page
- [ ] Detail map shows incident location
- [ ] All updates display (initial + subcollection)
- [ ] Respond button works
- [ ] Chat with Supe creates incident group chat
- [ ] Chat with Chaser creates PM
- [ ] Live alert map shows last 10 (4 hours)
- [ ] Favorites/bookmarks work
- [ ] Location tracking updates

**Supe Features**:
- [ ] See ALL incidents (no distance filter)
- [ ] Click incident → same detail page as Chaser
- [ ] Detail map shows incident location
- [ ] All updates display
- [ ] Profile shows Live Team Map
- [ ] Team map displays all active users
- [ ] Receive group chats from Chasers
- [ ] Can PM any user
- [ ] Live alert map shows last 10
- [ ] Access CRM dashboard
- [ ] CRM modules all work

**Maps (Critical)**:
- [ ] Detail: Single location, zoom 15
- [ ] Alert: Multiple locations, zoom 10, 4 hours
- [ ] Team: User locations, zoom 10, < 5 min, **Supe only**

**Chat (Critical)**:
- [ ] Chaser → Supe (incident): Group with ALL Supes
- [ ] Chaser → Chaser (contacts): 1-on-1 PM
- [ ] Supe → Chaser (contacts): 1-on-1 PM
- [ ] Supe → Supe (contacts): 1-on-1 PM

---

## 📦 **What Gets Preserved**

### **Keep from Current**:
- ✅ All UI components (`components/ui/*`)
- ✅ Visual design (colors, spacing, layouts)
- ✅ Incident list item design
- ✅ Filter bar design
- ✅ Profile cards
- ✅ Bottom nav design
- ✅ Mobile responsiveness
- ✅ All CRM components (from backup)

### **Rebuild**:
- ✅ File structure (`src/` directory)
- ✅ Auth flow (Server Actions)
- ✅ Data fetching (Server → Client)
- ✅ Page architecture (shared components)
- ✅ Maps (proper SDK)
- ✅ Firebase separation

---

## 🎯 **Final Plan Summary**

### **The Approach**:
1. **Keep current branch** (`rebuild-proper-architecture`)
2. **Modularize code** into focused, single-responsibility files
3. **Consolidate scattered logic**:
   - Authentication → `auth.module.ts`
   - Incidents → `incident.module.ts`
   - Database → `database.module.ts`
   - Chat → `chat.module.ts`
   - Maps → `maps.module.ts`
4. **Update components** to use clean module APIs
5. **Test each module** independently
6. **Build incrementally** with working code at each step

### **Timeline**:
- **Aggressive**: 2 days
- **Realistic**: 3 days
- **Conservative**: 4 days

### **Confidence**: 95% success rate

### **Risk**: Low (you have backup zip + backup branch)

---

## ✅ **PLAN UPDATED**

The plan now includes:
- ✅ Shared component architecture (not duplicate apps)
- ✅ CRM integrated from overall view
- ✅ Database structure confirmed (Firestore + Realtime DB)
- ✅ All credentials placeholders
- ✅ Wired live from beginning
- ✅ Proper Server/Client separation
- ✅ Role-based rendering throughout

**Ready to execute?** Say the word and I'll begin with Phase 0! 🚀
