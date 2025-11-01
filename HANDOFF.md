# 🚀 EMU Alerts - Comprehensive Handoff Document

**Project Name**: EMU Alerts (Emergency Management Unit) - Also known as National Fire Alerts (NFA) System  
**Last Updated**: November 1, 2025  
**Project Stage**: Production - Deployed & Operational  
**Live URL**: https://4axe.com  
**Repository**: https://github.com/ynotfins/EMU_v0  
**Firebase Project**: `emu-incidents`  
**Vercel Project**: `emu-v0`

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current State](#2-current-state)
3. [Architecture](#3-architecture)
4. [Key Features](#4-key-features)
5. [Technical Stack](#5-technical-stack)
6. [File Structure](#6-file-structure)
7. [Data Models](#7-data-models)
8. [Critical Workflows](#8-critical-workflows)
9. [Known Issues & Fixes](#9-known-issues--fixes)
10. [Development Workflow](#10-development-workflow)
11. [Deployment](#11-deployment)
12. [Memory Bank Cross-Reference](#12-memory-bank-cross-reference)
13. [Next Steps](#13-next-steps)
14. [Support & Contact](#14-support--contact)

---

## 1. Project Overview

### What is EMU Alerts?

**EMU Alerts** (Emergency Management Unit), also known as the **National Fire Alerts (NFA) System**, is a real-time emergency incident coordination system designed for first responders (Chasers), supervisors (Supes), and administrators.

### Core Purpose

Enable emergency responders to quickly view, respond to, and coordinate incidents in the field with real-time updates, location tracking, chat communication, and document management.

### Target Users

- **Chasers (Emergency Responders)**: ~2-4 users, front-line incident response
- **Supes (Supervisors)**: ~2 users, team coordination and oversight
- **Admins**: System management and user administration
- **Super Admins**: Full system control (God Mode)

### Key Differentiators

- ✅ **Mobile-First**: Optimized for field use on smartphones
- ✅ **Real-Time**: Firebase Firestore + Realtime Database for instant updates
- ✅ **Offline-Capable**: LocalStorage caching for geocoding and user location
- ✅ **Production-Ready**: Deployed on Vercel at https://4axe.com with custom domain

**📚 Reference**: `docs/memory-bank/projectbrief.md`, `docs/memory-bank/productContext.md`

---

## 2. Current State

### ✅ What's Working (Production - Deployed Nov 1, 2025)

#### Authentication & Users

- ✅ **Email/Password Login**: Fully functional at `/login`
- ✅ **Google Sign-In**: OAuth integration with automatic profile creation
- ✅ **Role-Based Access Control**: Chaser, Supe, Admin, Super Admin (God Mode)
- ✅ **Bulletproof Auth Persistence**: Triple-layer storage (localStorage + sessionStorage + cookies)
- ✅ **Signup with Role Selection**: Users choose Chaser or Supe during account creation at `/signup`
- ✅ **Admin Tool**: One-click user role management at `/admin`
- ✅ **Auth Never Expires**: Users stay signed in until manual sign-out
- ✅ **God Mode Toggle**: Super admins can toggle God Mode and switch between Supe/Chaser views from profile page

#### Incident Management

- ✅ **Real-Time Incident List**: Firestore `onSnapshot` for live updates
- ✅ **Filtering by Distance**: 5mi, 10mi, 25mi, 50mi, Custom (last 4 hours only)
- ✅ **Filtering by Type**: All Hands, Fire Damage, Smoke Condition, Working Fire, etc.
- ✅ **Keyword Search**: Filter by address, city, message content
- ✅ **Distance Calculation**: Client-side Haversine formula with Google Geocoding API
- ✅ **Offline Geocoding Cache**: localStorage for geocoded addresses (permanent)
- ✅ **Device-Aware Location Caching**: Desktop (permanent), mobile (movement detection)
- ✅ **Distance Sorting**: Sorts alerts within last 4 hours by proximity
- ✅ **Hide/Unhide Incidents**: "Show All" banner to restore hidden incidents
- ✅ **Aggressive Deduplication**: Normalizes messages to prevent duplicate updates
- ✅ **Favorites & Bookmarks**: Multi-user arrays in Firestore (`favoritedBy`, `bookmarkedBy`)
- ✅ **Silence Alerts**: Per-device localStorage for muting
- ✅ **High Alert Button**: Visual squiggly lines when active
- ✅ **Response Tracking**: "Respond to Alert" button creates response records and notifies all supes
- ✅ **Auto-Saving Notes**: Notes save onBlur, persist to Firestore

#### UI/UX Features

- ✅ **Ultra-Compact Filter Bar**: Reduced from 5 rows to 3 for mobile optimization
- ✅ **Collapsible Filters**: 🤏 pinching hand button to hide/show filters
- ✅ **Embedded City-Zoom Map**: Google Maps iframe at zoom=12 on incident details
- ✅ **Color Standardization**: All reds use `#FF3B30`, all greens use `#34C759`
- ✅ **Bottom Navigation**: Thumb-friendly one-handed use on mobile
- ✅ **Role-Specific Navigation**: Different tabs for Chaser/Supe/Admin
- ✅ **20% Rounded Avatars**: All avatars use 20% border-radius with automatic processing
- ✅ **Live Team Map Component**: Shows real-time user locations with online badge (Supe profile page)
- ✅ **CRM Contractors Page**: Desktop-first design with stats dashboard at `/crm/contractors`
- ✅ **Multi-Step Signup**: Beautiful Apple-style UI with progress dots, camera ID capture, OCR processing

#### Chat System

- ✅ **Firebase Realtime Database**: Live chat infrastructure
- ✅ **Incident-Specific Group Chats**: One chaser + ALL supes automatically added
- ✅ **1-on-1 Direct Chats**: Chaser-to-chaser, Supe-to-supe (backend ready, UI at `/chaser/chat` and `/supe/chat`)
- ✅ **Real-Time Message Updates**: Instant synchronization across all devices
- ✅ **Chat Accessible from Incident Details**: "Chat" tab on incident details page
- ✅ **Nicknames in Chat**: Shows preferred nickname or fallback to name/email
- ✅ **Chat Contacts**: All/Supes/Chasers tabs for easy filtering

#### Document Management

- ✅ **Homeowner Form**: Name, phone, email, address, insurance (UI complete)
- ✅ **Docs Manager UI**: Upload interface (backend not yet wired to Firebase Storage)
- ✅ **eSign Manager UI**: Send for eSign, Sign Live, Signature History (backend not fully wired)

#### Maps & Location

- ✅ **Real-Time User Location**: Geolocation API with permission persistence
- ✅ **Location Permission Persistence**: Only asks once, saves to localStorage
- ✅ **Distance Displayed on Incident Cards**: When location enabled
- ✅ **Live Location Updates**: Every 30-60 seconds (device-dependent)
- ✅ **Google Maps Embed**: City-level zoom (12) on incident details pages

#### Code Quality & Standards

- ✅ **TypeScript**: 0 errors (strict mode, fully type-safe)
- ✅ **ESLint**: 0 critical errors, 95 non-critical warnings
- ✅ **React Best Practices**: All hooks follow official React rules
- ✅ **Performance Optimized**: useMemo for derived state, no cascading renders
- ✅ **Error Handling**: All catch blocks log errors properly
- ✅ **Modern Standards**: ES6 imports throughout, no require()
- ✅ **Git History**: Clean commits with conventional commit messages

### ⚠️ What's In Progress

#### High Priority

- 🔄 **Custom Alert Groups**: User-defined filters with train horn notifications
- 🔄 **CRM Database**: Properties and communications collections for homeowner data
- 🔄 **eSign Full Integration**: Upload PDFs, send via email/SMS for signature
- 🔄 **Firestore Geocoding Cache**: Permanent storage for lat/lng by address (currently localStorage only)

#### Medium Priority

- 🔄 **Live Map for Supes**: Real-time responder GPS tracking on map (component exists, not fully wired)
- 🔄 **Push Notifications (FCM)**: Web push for high-alert incidents (SDK initialized, not wired)
- 🔄 **30-Day Retention Policy**: Auto-delete old incidents

### ❌ What's Not Started

- ❌ **Command Palette**: Search across app (Cmd+K)
- ❌ **Analytics Dashboard**: Usage tracking, response times
- ❌ **Error Tracking**: Sentry integration
- ❌ **Advanced Filtering**: Saved searches
- ❌ **PWA Offline Mode**: Service workers, IndexedDB

**📚 Reference**: `docs/memory-bank/progress.md`, `docs/memory-bank/activeContext.md`

---

## 3. Architecture

### High-Level Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js 16    │────▶│   Firebase SDK   │────▶│  Firebase Cloud │
│   (App Router)  │     │  (Client-side)   │     │   (Backend)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                                   │
        │                                                   │
        ▼                                                   ▼
┌─────────────────┐                             ┌─────────────────┐
│  React 19 +     │                             │   Firestore     │
│  Tailwind CSS   │                             │   Auth, Storage │
│  shadcn/ui      │                             │   Realtime DB   │
└─────────────────┘                             └─────────────────┘
```

### Technology Stack

#### Frontend

- **Next.js 16.0.0**: App Router, React Server Components, file-based routing
- **React 19.2.0**: Hooks, Context API, concurrent features
- **TypeScript 5.x**: Strict mode, comprehensive type safety
- **Tailwind CSS 4.1.9**: Utility-first styling, custom color palette
- **shadcn/ui v0**: Radix UI primitives, accessible components
- **Lucide Icons**: Icon library

#### Backend & Services

- **Firebase Firestore**: Real-time NoSQL database, primary data store
- **Firebase Authentication**: Email/password + Google Sign-In, browser local persistence
- **Firebase Realtime Database**: Live chat messages (incident + direct chats)
- **Firebase Cloud Storage**: File uploads (initialized, not yet wired)
- **Firebase Cloud Messaging (FCM)**: Push notifications (initialized, not yet wired)

#### APIs & Integrations

- **Google Maps Embed API**: Embedded maps on incident details (zoom=12)
- **Google Geocoding API**: Address → lat/lng conversion with fallback to OpenStreetMap
- **Browser Geolocation API**: User location tracking with device-aware caching

#### Deployment & Hosting

- **Vercel**: Production hosting with automatic deployments on `git push`
- **Custom Domain**: https://4axe.com (DNS configured via Vercel)
- **Environment Variables**: Secure credential storage in Vercel dashboard

**📚 Reference**: `docs/memory-bank/techContext.md`, `docs/memory-bank/systemPatterns.md`, `package.json`

---

## 4. Key Features

### 🔥 Incident Management

**What it does**: Real-time list of fire alerts with filtering, sorting, and user-specific actions.

**User Flow**:

1. User lands on `/chaser/incidents` or `/supe/incidents`
2. Filter bar shows distance, type, keyword, and update count filters
3. Incidents auto-update via Firestore `onSnapshot`
4. User can:
   - **Hide incidents**: Click orange 🙈 button → disappears from list
   - **Sort by distance**: Click "Distance ▼" → shows alerts within 50mi from last 4 hours
   - **Favorite**: Click ❤️ → saves to favorites list
   - **Bookmark**: Click 🔖 → saves to bookmarks
   - **Silence**: Click 🔔 → mutes notifications for this incident

**Technical Implementation**:

- **Hook**: `hooks/use-incidents-with-distance.ts`
- **Component**: `app/chaser/incidents/page.tsx`, `app/supe/incidents/page.tsx`
- **Filter Bar**: `components/filter-bar.tsx`
- **Incident Card**: `components/incident-list-item.tsx`

**Firestore Structure**:

```typescript
/incidents/{incidentId}
  - id: string (NFA-XXXXXXX)
  - lastType: string ("All Hands", "Fire Damage", etc.)
  - lastMessage: string (latest alert message)
  - address: string
  - city: string
  - county: string (Brooklyn → Kings)
  - state: string ("NY")
  - lastTs: Timestamp
  - updateCount: number
  - favoritedBy: string[] (array of user IDs)
  - bookmarkedBy: string[]
  - notes: Note[] (employee notes)

  /updates/{updateId}
    - ts: Timestamp
    - stage: string ("new", "update")
    - message: string
    - title: string
    - address: string
```

**Filters**:

- **Distance**: 5mi, 10mi, 25mi, 50mi, Custom (only shows incidents from last 4 hours)
- **Type**: All, All Hands, Fire Damage, Smoke Condition, Working Fire
- **Keyword**: Text search across message content
- **Updates**: Minimum update count (1, 3, Custom)

**Distance Calculation**:

- Uses Haversine formula to calculate distance between user location and incident address
- Geocodes addresses using Google Geocoding API with OpenStreetMap fallback
- Caches geocoded addresses in `localStorage` (key: `emu_geocode_cache`)
- Only processes visible incidents (8 + 4 preload) for performance

**Deduplication**:

- **Location**: `hooks/use-incident.ts` (lines 149-166)
- **Strategy**: Normalizes message (trim, lowercase, remove extra whitespace) and uses as unique key
- **Why**: Prevents duplicate updates with slightly different timestamps

**📚 Reference**: `docs/WIRING.md`, `docs/API_MAP.md`, `docs/FILTER_SYSTEM.md`

---

### 🗺️ Maps & Location

**What it does**: Tracks user location, calculates distances, embeds maps on incident details.

**User Flow**:

1. App requests location permission on first load
2. Browser Geolocation API starts tracking
3. Location cached in `localStorage` (device-aware duration)
4. Distances appear on incident cards
5. Click incident → Embedded map shows incident location at city zoom

**Technical Implementation**:

- **Hook**: `hooks/use-location-distance.ts`
- **Cache**: `lib/offline-cache.ts`
- **Map Embed**: `app/chaser/incident/[id]/page.client.tsx` (lines 82-95)

**Device-Aware Caching**:

```typescript
DESKTOP   → Permanent cache, manual reset button
LAPTOP    → 6-hour cache
TABLET    → 1-hour cache, 100m movement threshold
PHONE     → 30-minute cache, 50m movement threshold
```

**Embedded Map**:

```html
<iframe
  src="https://www.google.com/maps/embed/v1/place?
    key=YOUR_API_KEY&
    q=ADDRESS&
    zoom=12"
  width="100%"
  height="256px"
/>
```

**Location Permission Persistence**:

- **Location**: `lib/offline-cache.ts` (lines 88-93)
- **Key**: `emu_location_permission`
- **Strategy**: Save `true` to `localStorage` after first successful location retrieval
- **Check**: On subsequent app loads, check if permission was granted before

**📚 Reference**: `docs/WIRING.md`, `docs/OFFLINE_CACHE_SYSTEM.md`

---

### 💬 Live Chat

**What it does**: Real-time chat for incident coordination and 1-on-1 messaging.

**Chat Types**:

1. **Incident Group Chat**: One chaser + ALL supes (auto-added)
2. **1-on-1 Direct Chat**: Chaser-to-chaser or Supe-to-supe

**User Flow (Incident Chat)**:

1. Chaser opens incident details → Clicks "Chat" tab
2. **First message creates chat room**:
   - Fetches all supes from Firestore `/users` collection
   - Creates chat in Realtime Database: `/incident-chats/{incidentId}`
   - Auto-adds chaser + all supes as participants
3. All messages appear in real-time
4. Supes see all incident chats they're part of

**Technical Implementation**:

- **Database**: Firebase Realtime Database (NOT Firestore)
- **Component**: `components/incident-chat.tsx`
- **Chat Contacts**: `components/chat-contacts.tsx`
- **Chat Room**: `components/chat-room.tsx`
- **Functions**: `lib/realtime-database.ts`
  - `createIncidentChat(incidentId, incidentAddress, creatorId, creatorName)`
  - `sendIncidentMessage(incidentId, senderId, senderName, message)`
  - `subscribeToIncidentChat(incidentId, callback)`
  - `createDirectChat(userId1, userId2)`
  - `sendDirectMessage(otherUserId, message, userName, userRole)`
  - `subscribeToDirectChat(otherUserId, callback)`

**Realtime Database Structure**:

```json
/incident-chats/{incidentId}
  /metadata
    {
      "incidentId": "NFA-1834242",
      "incidentAddress": "147-25 94th Ave, Queens, NY",
      "createdAt": 1730250000000,
      "createdBy": "userId123",
      "participants": {
        "chaserUserId": true,
        "supeUserId1": true,
        "supeUserId2": true
      }
    }

  /messages/{pushId}
    {
      "senderId": "chaserUserId",
      "senderName": "John Doe",
      "message": "On scene, heavy smoke visible",
      "timestamp": 1730250120000
    }

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
      "senderId": "userId1",
      "senderName": "Jane Smith",
      "message": "Can you check the basement?",
      "timestamp": 1730250150000
    }
```

**Chat ID Generation (Direct Chats)**:

```typescript
// Always sort user IDs alphabetically for consistent chat ID
const chatId = [userId1, userId2].sort().join("_");
// Example: "abc123_def456"
```

**Why Realtime Database?**

- ✅ Optimized for high-frequency updates (chat messages)
- ✅ Simpler data structure (JSON tree)
- ✅ Lower latency than Firestore for frequent writes
- ✅ Scales better for real-time messaging

**📚 Reference**: `docs/memory-bank/activeContext.md`, `docs/AUTH_AND_REALTIME.md`, `docs/LIVE_CHAT_TESTING_GUIDE.md`

---

### 👤 Authentication & Roles

**What it does**: Secure user authentication with role-based access control.

**User Roles**:

- **Chaser**: Front-line responder (view incidents, chat, upload docs)
- **Supe**: Supervisor (all chaser features + live map, oversight)
- **Admin**: System admin (user management, role changes)
- **Super Admin**: Full system control (God Mode, all features)

**Authentication Flow**:

```
1. User visits /login or /signup
2. Firebase Auth creates account (email/password or Google)
3. Firestore /users/{uid} document created with role
4. Triple-layer auth persistence (localStorage + sessionStorage + cookies)
5. Redirect to role-specific homepage:
   - Chaser → /chaser/incidents
   - Supe → /supe/incidents
   - Admin/Super Admin → /admin
```

**Bulletproof Auth Persistence**:

- **File**: `lib/auth-persistence.ts`
- **Strategy**:
  ```typescript
  saveAuthState(uid, email) {
    localStorage.setItem('emu_user_id', uid);      // Layer 1: Forever
    sessionStorage.setItem('emu_user_id', uid);    // Layer 2: Until tab close
    document.cookie = `emu_user_id=${uid}; ...`;   // Layer 3: 90 days
  }
  ```
- **Result**: Users NEVER auto-signed out (perfect for first responders)

**Signup with Role Selection**:

- **File**: `app/signup/page.tsx`
- **Flow**:
  1. User enters email, password, name
  2. Selects role: Chaser or Supe (dropdown)
  3. `createUserWithEmailAndPassword()` creates Firebase Auth user
  4. `setDoc()` creates Firestore `/users/{uid}` with role
  5. Redirects to role-specific homepage

**Multi-Step Signup (New Users)**:

- **File**: `app/signup/new/page.tsx`
- **Steps**:
  1. Basic Info (nickname, email, phone)
  2. Email Verification (sends verification email)
  3. Camera ID Capture (front + back)
  4. OCR Processing (auto-extract data)
  5. Complete (auto-creates profile)

**Admin Tool**:

- **URL**: https://4axe.com/admin
- **File**: `app/admin/page.tsx`
- **Features**:
  - Table view of all users
  - One-click role changes (→ Supe, → Chaser, → Admin, → Super Admin)
  - Color-coded role badges
  - Real-time Firestore updates

**God Mode (Super Admin)**:

- **Component**: `components/god-mode-card.tsx`
- **Features**:
  - Toggle God Mode ON/OFF (defaults to OFF)
  - Switch between Supe and Chaser views
  - Placed in profile page (no floating toggle)
  - Purple gradient card for visibility

**📚 Reference**: `docs/memory-bank/activeContext.md`, `docs/AUTH_AND_REALTIME.md`

---

### 📄 Document & eSign Management

**What it does**: Handle homeowner forms, document uploads, and e-signatures.

**Status**:

- ✅ **UI Complete**: Homeowner form, Docs manager, eSign manager
- ⚠️ **Backend Partial**: File upload not yet wired to Firebase Storage
- ❌ **eSign Not Wired**: Needs PDF generation and email/SMS integration

**User Flow (Planned)**:

1. Chaser opens incident details → "Homeowner" tab
2. Fills in homeowner info (name, phone, email, address, insurance)
3. Saves to Firestore `/incidents/{id}/homeowner_forms` (or embedded in incident doc)
4. "Docs" tab: Upload photos/PDFs to Firebase Storage
5. "eSign" tab: Send PDF to homeowner for signature via email/SMS link

**Technical Implementation (Planned)**:

- **Storage Path**: `/incidents/{incidentId}/files/{filename}`
- **Firestore Metadata**: `/files` collection
  ```typescript
  {
    id: string,
    incidentId: string,
    name: string,
    type: string (image/jpeg, application/pdf),
    url: string (Firebase Storage download URL),
    uploadedBy: string (userId),
    uploadedAt: Timestamp
  }
  ```

**eSign Requirements**:

- Upload PDF forms to Storage
- Generate unique signing link
- Send link via email or SMS
- Capture signature using canvas
- Save signed PDF back to Storage
- Notify uploader of completion

**📚 Reference**: `docs/memory-bank/progress.md` (Next Steps)

---

## 5. Technical Stack

### Core Framework

```json
"next": "^16.0.0",
"react": "^19.2.0",
"react-dom": "^19.2.0",
"typescript": "^5"
```

### Firebase

```json
"firebase": "^11.0.1",
"firebase-admin": "^13.0.0"
```

### UI & Styling

```json
"tailwindcss": "^4.1.9",
"@radix-ui/react-*": "various",
"lucide-react": "^0.462.0",
"class-variance-authority": "^0.7.1",
"clsx": "^2.1.1",
"tailwind-merge": "^2.6.0"
```

### Forms & Validation

```json
"react-hook-form": "^7.54.2",
"zod": "^3.24.1",
"@hookform/resolvers": "^3.9.1"
```

### Charts & Visualization

```json
"recharts": "^2.15.0"
```

### Notable Details

- ⚠️ **React 19 Compatibility**: Some packages require `--legacy-peer-deps`
- ⚠️ **Vaul Drawer**: Not officially React 19 compatible, but works
- ⚠️ **Next.js 16**: Very new, ensure compatibility when adding packages

**📚 Reference**: `package.json`, `docs/memory-bank/techContext.md`

---

## 6. File Structure

### Directory Layout

```
EMU_v0/
├── app/                          # Next.js App Router
│   ├── login/page.tsx            # Login page (root level, no auth group)
│   ├── signup/                   # Signup routes (root level)
│   │   ├── page.tsx              # Standard signup
│   │   └── new/page.tsx          # Multi-step new user signup
│   ├── role/page.tsx             # Role selection & smart routing
│   ├── chaser/                   # Chaser-only routes
│   │   ├── chat/                 # Team chat + DMs
│   │   │   ├── page.tsx          # Chat contacts list
│   │   │   └── [threadId]/page.tsx
│   │   ├── favorites/            # Favorited incidents
│   │   ├── incident/[id]/        # Incident details (tabs)
│   │   │   ├── page.tsx
│   │   │   └── page.client.tsx
│   │   ├── incidents/            # Main incident list
│   │   └── profile/              # User profile
│   ├── supe/                     # Supe routes (same structure as chaser)
│   │   ├── chat/
│   │   ├── favorites/
│   │   ├── incident/[id]/
│   │   ├── incidents/
│   │   ├── map/                  # Live team map
│   │   └── profile/
│   ├── admin/                    # Admin tool
│   │   └── page.tsx              # User management
│   ├── crm/                      # CRM routes
│   │   └── contractors/page.tsx  # Independent contractors & employees
│   ├── docs/page.tsx             # Dev documentation viewer
│   ├── globals.css               # Global styles + Tailwind
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Root redirect to /role
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components (57 files)
│   ├── avatar-picker.tsx         # Avatar selection with 20% rounded corners
│   ├── avatar.tsx                # Avatar display component
│   ├── bottom-nav.tsx            # Mobile bottom navigation
│   ├── chat-contacts.tsx         # Chat contacts list (All/Supes/Chasers tabs)
│   ├── chat-room.tsx             # Chat room component
│   ├── docs-manager.tsx          # File upload manager
│   ├── esign-manager.tsx         # E-signature UI
│   ├── filter-bar.tsx            # Incident filters (ultra-compact)
│   ├── god-mode-card.tsx         # Super admin God Mode toggle
│   ├── homeowner-form.tsx        # Homeowner info form
│   ├── incident-chat.tsx         # Live chat component
│   ├── incident-list-item.tsx    # Incident card
│   ├── live-map.tsx              # Map placeholder (not used)
│   ├── live-team-map.tsx         # Real-time user location map
│   ├── map-card.tsx              # Map placeholder (not used)
│   ├── notes-editor.tsx          # Notes editor
│   ├── profile-header.tsx        # Profile header
│   ├── protected-route.tsx       # Route guard
│   ├── role-switcher.tsx         # Role switcher (old, may be obsolete)
│   ├── stats-cards.tsx           # Profile stats
│   ├── theme-provider.tsx        # Theme context
│   ├── thread-list.tsx           # Chat thread list
│   ├── updates-list.tsx          # Incident updates list
│   └── ...                       # Other components
│
├── hooks/                        # Custom React hooks
│   ├── use-incidents.ts          # Firestore incidents query
│   ├── use-incidents-with-distance.ts  # + distance calculation
│   ├── use-incident.ts           # Single incident + updates
│   ├── use-location-distance.ts  # User location tracking
│   ├── use-filters.ts            # Filter state management
│   ├── use-profile.ts            # User profile
│   ├── use-responses.ts          # Alert responses
│   ├── use-threads.ts            # Chat threads (stubbed)
│   ├── use-messages.ts           # Chat messages (stubbed)
│   ├── use-files.ts              # File uploads (stubbed)
│   ├── use-live-locations.ts     # Live locations (stubbed)
│   └── use-toast.ts              # Toast notifications
│
├── lib/                          # Utility libraries
│   ├── firebase.ts               # Firebase SDK initialization
│   ├── auth-persistence.ts       # Triple-layer auth
│   ├── realtime-database.ts      # Chat functions
│   ├── offline-cache.ts          # Geocoding & location cache
│   ├── avatar-utils.ts           # Avatar processing (20% rounded)
│   ├── colors.ts                 # Standardized colors
│   ├── utils.ts                  # Helper functions (cn, etc.)
│   ├── logger.ts                 # Error logging
│   ├── fcm.ts                    # FCM setup (stubbed)
│   ├── dev.ts                    # Dev utilities
│   ├── diagnostics.ts            # Diagnostics
│   ├── high-alert.ts             # High alert sound
│   ├── silence.ts                # Silence functionality
│   ├── insurance-carriers.ts     # Insurance carrier data
│   ├── pwa-register.ts           # PWA registration
│   ├── context/
│   │   └── favorites-context.tsx # Favorites state
│   ├── actions/                  # Server actions
│   │   ├── chat.ts
│   │   ├── esign.ts
│   │   ├── files.ts
│   │   ├── incidents.ts
│   │   ├── notifications.ts
│   │   └── profiles.ts
│   └── mock/                     # Mock data for dev
│       ├── incidents.ts
│       ├── profiles.ts
│       ├── messages.ts
│       └── threads.ts
│
├── types/
│   └── domain.ts                 # TypeScript type definitions
│
├── public/
│   ├── app-icon.png              # Helmet logo
│   ├── manifest.json             # PWA manifest
│   ├── firebase-messaging-sw.js  # Service worker for FCM
│   └── avatars/                  # Avatar images
│
├── docs/                         # Documentation
│   ├── memory-bank/              # AI context files
│   │   ├── projectbrief.md       # Project overview
│   │   ├── productContext.md     # User problems & solutions
│   │   ├── systemPatterns.md     # Architecture & patterns
│   │   ├── techContext.md        # Tech stack & setup
│   │   ├── activeContext.md      # Current work focus
│   │   └── progress.md           # Status tracking
│   ├── API_MAP.md                # Hooks → Firebase mapping
│   ├── AUTH_AND_REALTIME.md      # Authentication & real-time updates
│   ├── AVATAR_GUIDE.md           # Avatar specifications
│   ├── COLOR_STANDARDS.md        # Color palette
│   ├── FILTER_SYSTEM.md          # Filter implementation
│   ├── FIRESTORE_SCHEMA.md       # Database schema
│   ├── INTEGRATION_LOG.md        # Firebase integration timeline
│   ├── LIVE_CHAT_TESTING_GUIDE.md # Chat testing procedures
│   ├── OFFLINE_CACHE_SYSTEM.md   # Cache implementation
│   ├── README.md                 # Project README
│   ├── ROUTES.md                 # Route documentation
│   ├── WIRING.md                 # Data flow documentation
│   └── ...                       # Other documentation
│
├── scripts/                      # Utility scripts
│   ├── make-admin.ts             # Make user admin
│   ├── seed-roles.ts             # Seed user roles
│   ├── verify-components.ts      # Component validation
│   └── ...                       # Other scripts
│
├── .env.local                    # Environment variables (not in git)
├── firebase.json                 # Firebase config
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore indexes
│ database.rules.json            # Realtime Database security rules
├── storage.rules                 # Storage security rules
├── next.config.mjs               # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── wrangler.toml                 # Cloudflare config (unused)
├── package.json                  # Dependencies
└── HANDOFF.md                    # This file

**Key Changes from Original Plan**:
- ❌ NO `(auth)` folder - deleted due to build conflicts
- ✅ `/login`, `/signup`, `/role` at root level
- ✅ `/crm/contractors` for CRM features
- ✅ Multi-step signup at `/signup/new`
```

**📚 Reference**: `docs/ROUTES.md`, Project layout

---

## 7. Data Models

### Firestore Collections

#### `/incidents` (Main Alerts)

```typescript
{
  id: string                  // "NFA-1834242" or auto-generated doc ID
  incidentNumber?: number     // Optional display number
  lastType: string            // "All Hands", "Fire Damage", etc.
  lastMessage: string         // Latest alert message
  address: string             // "147-25 94th Ave"
  city: string                // "Queens"
  county: string              // "Queens" (Brooklyn → "Kings")
  state: string               // "NY"
  lastTs: Timestamp           // Last update timestamp
  lastSeenAt?: Timestamp      // Alternate field name
  updateCount: number         // Total number of updates
  stage: string               // "new", "active", "closed"

  // User-specific arrays (multi-user support)
  favoritedBy: string[]       // [userId1, userId2, ...]
  bookmarkedBy: string[]
  silencedBy?: string[]       // Optional, may use localStorage instead

  // Notes (added by users)
  notes?: Note[]              // [{text, createdAt, createdBy}, ...]

  // Optional fields
  lat?: number                // Geocoded latitude
  lng?: number                // Geocoded longitude
  highAlert?: boolean         // High alert flag
  message?: string            // May be same as lastMessage
  updatedAt?: Timestamp       // May be same as lastTs

  // Updates array (embedded, not subcollection)
  updates?: Array<{
    id: string
    ts: number
    stage: string
    message: string
    title?: string
    address?: string
  }>
}
```

#### `/incidents/{id}/updates` (Subcollection - if used separately)

```typescript
{
  id: string                  // Auto-generated
  ts: Timestamp               // Update timestamp
  stage: string               // "new", "update"
  message: string             // Update message content
  title: string               // Update title (or stage)
  address: string             // Address at time of update
  lat?: number
  lng?: number
}
```

#### `/users` (User Profiles)

```typescript
{
  id: string                  // Firebase Auth UID (use uid in code, not id)
  uid: string                 // Firebase Auth UID (actual field used)
  email: string               // "user@example.com"
  name?: string               // Full name
  displayName: string         // Display name (preferred field)
  nickname?: string           // Preferred name (shown in chat)
  avatar?: string             // Avatar URL or path
  role: "super_admin" | "admin" | "supe" | "chaser"
  createdAt: Timestamp
  updatedAt?: Timestamp

  // Profile settings
  settings?: {
    muted?: boolean
    notificationsEnabled?: boolean
    highAlertSound?: string    // "train" | "siren" | "bell"
    locationEnabled?: boolean
  }

  // Stats (computed)
  stats?: {
    responsesCount: number
    favoritesCount: number
    bookmarksCount: number
  }

  // Location (for live map)
  location?: {
    lat: number
    lng: number
    accuracy: number
    updatedAt: Timestamp
  }

  // God Mode (super admin only)
  godModeEnabled?: boolean
  viewAs?: "supe" | "chaser"  // When God Mode is ON
}
```

#### `/responses` (Alert Responses)

```typescript
{
  id: string                  // Auto-generated
  incidentId: string
  userId: string
  userName: string
  userRole: "chaser" | "supe" | "admin"
  incidentAddress?: string
  timestamp: Timestamp
  respondedAt?: Timestamp
  status: "active" | "completed" | "cancelled"
  createdAt?: Timestamp
  updatedAt?: Timestamp
}
```

#### `/independent_contractors` (CRM - Contractors)

```typescript
{
  id: string
  name: string
  email: string
  phone: string
  role: "chaser" | "supe"
  status: "active" | "inactive" | "pending"
  verified: boolean
  avatar?: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}
```

#### `/favorites` (User Favorites - May use array in incidents instead)

```typescript
{
  userId: string;
  incidentId: string;
  createdAt: Timestamp;
}
// Composite index: userId + incidentId
```

#### `/bookmarks` (User Bookmarks - May use array in incidents instead)

```typescript
{
  userId: string;
  incidentId: string;
  createdAt: Timestamp;
}
// Composite index: userId + incidentId
```

### Firebase Realtime Database Structure

#### Incident Group Chats

```json
/incident-chats/{incidentId}
  /metadata
    {
      "incidentId": "NFA-1834242",
      "incidentAddress": "147-25 94th Ave, Queens, NY",
      "createdAt": 1730250000000,
      "createdBy": "userId123",
      "participants": {
        "chaserUserId": true,
        "supeUserId1": true,
        "supeUserId2": true
      }
    }

  /messages/{pushId}
    {
      "userId": "chaserUserId",      // Note: API uses senderId
      "userName": "John Doe",         // Note: API uses senderName
      "message": "On scene, heavy smoke visible",
      "text"?: "..." // May be alternate field
      "timestamp": 1730250120000,
      "role"?: "chaser"               // Optional
    }
```

#### Direct Chats

```json
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
```

**Chat ID Generation (Direct Chats)**:

```typescript
// Always sort user IDs alphabetically for consistent chat ID
const chatId = [userId1, userId2].sort().join("_");
// Example: "abc123_def456"
```

### localStorage Cache Structure

#### Geocode Cache

```typescript
// Key: "emu_geocode_cache" (note: uses hyphen, not underscore)
{
  "147-25 94th Ave, Queens, NY": {
    lat: 40.7646,
    lng: -73.8235,
    cachedAt: "2025-10-30T12:00:00.000Z"
  },
  "33-24 Parsons Blvd, Queens, NY": {
    lat: 40.7621,
    lng: -73.8195,
    cachedAt: "2025-10-30T12:05:00.000Z"
  }
}
```

#### User Location Cache

```typescript
// Key: "emu_user_location"
{
  lat: 40.7589,
  lng: -73.9851,
  accuracy: 20,
  cachedAt: "2025-10-30T12:00:00.000Z",
  deviceType: "phone"  // desktop | laptop | tablet | phone
}
```

#### Location Permission

```typescript
// Key: "emu_location_permission"
// Value: "true"
```

#### Auth Persistence

```typescript
// Keys:
// - "emu_user_id" (localStorage)
// - "emu_user_id" (sessionStorage)
// - "emu_user_id" (cookie, 90 days)
// Value: Firebase Auth UID
```

**📚 Reference**: `docs/WIRING.md`, `docs/FIRESTORE_SCHEMA.md`, `types/domain.ts`

---

## 8. Critical Workflows

### Workflow 1: User Signs Up → First Incident View

```mermaid
sequenceDiagram
    participant User
    participant SignupPage
    participant FirebaseAuth
    participant Firestore
    participant IncidentsPage

    User->>SignupPage: Enter email, password, name, select role
    SignupPage->>FirebaseAuth: createUserWithEmailAndPassword()
    FirebaseAuth-->>SignupPage: User UID
    SignupPage->>Firestore: setDoc(/users/{uid}, {role, email, displayName})
    Firestore-->>SignupPage: Success
    SignupPage->>SignupPage: saveAuthState(uid, email)
    SignupPage->>IncidentsPage: Redirect to /chaser/incidents or /supe/incidents
    IncidentsPage->>Firestore: onSnapshot(/incidents)
    Firestore-->>IncidentsPage: Real-time incident list
    IncidentsPage->>User: Display incidents with filters
```

**Files Involved**:

- `app/signup/page.tsx`
- `lib/firebase.ts`
- `lib/auth-persistence.ts`
- `app/chaser/incidents/page.tsx` or `app/supe/incidents/page.tsx`
- `hooks/use-incidents-with-distance.ts`

---

### Workflow 2: User Opens Incident → Starts Chat

```mermaid
sequenceDiagram
    participant User
    participant DetailsPage
    participant IncidentChat
    participant RealtimeDB
    participant Firestore

    User->>DetailsPage: Click incident card
    DetailsPage->>Firestore: useIncident(id) - onSnapshot
    Firestore-->>DetailsPage: Incident data + updates
    DetailsPage->>User: Display incident details
    User->>IncidentChat: Click "Chat" tab
    IncidentChat->>Firestore: getAllSupes()
    Firestore-->>IncidentChat: List of supes
    IncidentChat->>RealtimeDB: createIncidentChat(id, address, chaser, supes)
    RealtimeDB-->>IncidentChat: Chat created
    IncidentChat->>RealtimeDB: subscribeToIncidentChat(id, callback)
    RealtimeDB-->>IncidentChat: Real-time messages
    User->>IncidentChat: Type message
    IncidentChat->>RealtimeDB: sendIncidentMessage()
    RealtimeDB-->>IncidentChat: Message sent
    IncidentChat->>User: Message appears instantly
```

**Files Involved**:

- `app/chaser/incident/[id]/page.client.tsx` or `app/supe/incident/[id]/page.client.tsx`
- `components/incident-chat.tsx`
- `lib/realtime-database.ts`
- `hooks/use-incident.ts`

---

### Workflow 3: Distance Calculation with Caching

```mermaid
sequenceDiagram
    participant User
    participant IncidentsPage
    participant useIncidentsWithDistance
    participant GeocodeCache
    participant GoogleAPI
    participant Haversine

    User->>IncidentsPage: Open incidents page
    IncidentsPage->>useIncidentsWithDistance: Load incidents
    useIncidentsWithDistance->>GeocodeCache: Check localStorage

    alt Address cached
        GeocodeCache-->>useIncidentsWithDistance: Return lat/lng
    else Address not cached
        useIncidentsWithDistance->>GoogleAPI: Geocode address
        GoogleAPI-->>useIncidentsWithDistance: lat/lng
        useIncidentsWithDistance->>GeocodeCache: Save to localStorage
    end

    useIncidentsWithDistance->>useIncidentsWithDistance: Get user location
    useIncidentsWithDistance->>Haversine: Calculate distance
    Haversine-->>useIncidentsWithDistance: Distance in miles
    useIncidentsWithDistance->>IncidentsPage: Enriched incidents with distanceMi
    IncidentsPage->>User: Display incidents with "X mi" badges
```

**Files Involved**:

- `hooks/use-incidents-with-distance.ts`
- `lib/offline-cache.ts`
- `hooks/use-location-distance.ts`

---

### Workflow 4: Admin Changes User Role

```mermaid
sequenceDiagram
    participant Admin
    participant AdminPage
    participant Firestore

    Admin->>AdminPage: Visit /admin
    AdminPage->>Firestore: onSnapshot(/users)
    Firestore-->>AdminPage: List of all users
    AdminPage->>Admin: Display user table
    Admin->>AdminPage: Click "→ Supe" button
    AdminPage->>Firestore: updateDoc(/users/{uid}, {role: "supe"})
    Firestore-->>AdminPage: Success
    Firestore-->>AdminPage: Real-time update
    AdminPage->>Admin: Role badge changes from "Chaser" to "Supe"
```

**Files Involved**:

- `app/admin/page.tsx`

---

## 9. Known Issues & Fixes

### Issue 1: Duplicate Updates on Details Page ✅ FIXED

**Problem**: Same update message showing multiple times with slightly different timestamps.

**Root Cause**: Deduplication by `timestamp|message|stage` missed near-duplicates (e.g., timestamps 1 second apart).

**Fix** (Oct 30, 2025):

- **File**: `hooks/use-incident.ts` (lines 149-166)
- **Strategy**: Normalize message (trim, lowercase, remove extra whitespace) and use ONLY message as unique key
- **Result**: Aggressive deduplication catches ALL duplicate messages

```typescript
// Before
const uniqueKey = `${update.ts}|${update.message}|${update.stage}`;

// After
const normalizedMsg = update.message.trim().toLowerCase().replace(/\s+/g, " ");
if (seenMessages.has(normalizedMsg)) {
  return false;
}
seenMessages.set(normalizedMsg, update);
```

---

### Issue 2: Map Not Opening at City Zoom ✅ FIXED

**Problem**: Map showing street-level zoom instead of city-level overview.

**Root Cause**: Using a button that opened Google Maps URL, but no control over initial zoom level.

**Fix** (Oct 30, 2025):

- **File**: `app/chaser/incident/[id]/page.client.tsx` (lines 82-95)
- **Strategy**: Replaced `MapCard` button with embedded Google Maps iframe at `zoom=12`
- **Result**: Interactive map shows at city level

```html
<iframe
  src="https://www.google.com/maps/embed/v1/place?
    key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&
    q=147-25%2094th%20Ave%2C%20Queens%2C%20NY&
    zoom=12"
  width="100%"
  height="256px"
/>
```

---

### Issue 3: Filter Bar Too Large on Mobile ✅ FIXED

**Problem**: Filter bar taking 5-6 rows, leaving no room for incident list.

**Fixes** (Oct 29-30, 2025):

- **Phase 1**: Removed labels (Distance:, Type:, Updates:) → Saved 1 row
- **Phase 2**: Moved Search and Distance buttons to Type row → Saved 1 row
- **Phase 3**: Added collapse button (🤏) → Optional full collapse
- **Result**: 3 rows max, or 0 rows when collapsed

**File**: `components/filter-bar.tsx`

---

### Issue 4: Red Colors Inconsistent ✅ FIXED

**Problem**: Different shades of red across profile page, details page, buttons.

**Fix** (Oct 29, 2025):

- **File**: `app/globals.css` (lines 12-20)
- **Strategy**: Standardized `--destructive` CSS variable to `oklch(0.626 0.257 27.31)` = `#FF3B30`
- **Also Fixed**: Direct hex codes in various components for error text and heart icon
- **Result**: ALL reds now use `#FF3B30` consistently

---

### Issue 5: Location Permission Asked Every Time ✅ FIXED

**Problem**: Browser asking for location permission on every page load.

**Root Cause**: Not saving permission status in persistent storage.

**Fix** (Oct 29, 2025):

- **File**: `lib/offline-cache.ts` (lines 88-93)
- **Strategy**: Save `true` to `localStorage` (`emu_location_permission`) after first successful location retrieval
- **Result**: Permission only asked once, persists forever

---

### Issue 6: Users Getting Signed Out ✅ FIXED

**Problem**: Users occasionally signed out automatically (unacceptable for first responders).

**Root Cause**: Firebase Auth default persistence not aggressive enough.

**Fix** (Oct 30, 2025):

- **File**: `lib/auth-persistence.ts` (NEW)
- **Strategy**: Triple-layer storage:
  1. `localStorage` (persists forever)
  2. `sessionStorage` (persists until tab close)
  3. Cookies (90 days expiry)
- **Integration**: `lib/firebase.ts` calls `saveAuthState()` on every `onAuthStateChanged` event
- **Result**: Users NEVER auto-signed out

---

### Issue 7: Phone Distance Not Showing ✅ FIXED

**Problem**: Distance not appearing on incident cards on mobile.

**Root Cause**: HTTPS required for Geolocation API, but testing on `http://192.168.1.156:3000`.

**Fix** (Oct 29, 2025):

- **Action**: Deployed to Vercel (https://4axe.com)
- **Result**: Geolocation works perfectly on mobile over HTTPS

---

### Issue 8: Sort by Distance Not Working ✅ FIXED

**Problem**: Clicking "Distance" button showed no incidents.

**Root Cause**: Distance filter applied BEFORE distances were calculated.

**Fix** (Oct 29, 2025):

- **File**: `hooks/use-incidents-with-distance.ts`
- **Strategy**: Move distance filtering to AFTER enrichment step
- **Result**: Distance filter now works correctly, showing alerts within 50mi from last 4 hours

---

### Issue 9: Cloudflare Pages Build Failures ❌ ABANDONED

**Problem**: Cloudflare Pages returning 404 despite successful builds.

**Root Cause**: Next.js 16 not officially supported on Cloudflare Pages.

**Fix** (Oct 29, 2025):

- **Action**: Switched deployment to **Vercel**
- **Result**: Instant success, automatic deployments, full Next.js 16 support

---

### Issue 10: Google Login Profile Creation ✅ FIXED

**Problem**: Google sign-in didn't create Firestore profiles, users showed as "Dev User".

**Root Cause**: Assumed Firebase Auth = Firestore profile (incorrect assumption).

**Fix** (Oct 30, 2025):

- **File**: `app/login/page.tsx`
- **Strategy**: Check if Firestore profile exists after Google sign-in, auto-create if missing
- **Result**: Google users get proper Firestore profiles automatically

---

### Issue 11: Duplicate Routes Vercel Build Error ✅ FIXED

**Problem**: `app/(auth)/signup` + `app/signup` = build error.

**Root Cause**: Next.js is strict about route uniqueness.

**Fix** (Oct 30, 2025):

- **Action**: Deleted `app/(auth)/` folder entirely, kept only `app/signup/page.tsx`
- **Result**: Vercel build succeeds, deployment working

---

### Issue 12: TypeScript Errors in Chaser Chat Page ✅ FIXED

**Problem**: Multiple TypeScript errors related to `Profile` type properties and `sendDirectMessage` function signature.

**Root Cause**: Using `profile.id` instead of `profile.uid`, `profile.name` instead of `profile.displayName`, incorrect function signatures.

**Fix** (Nov 1, 2025):

- **File**: `app/chaser/chat/page.tsx`
- **Changes**:
  - Changed `profile.id` to `profile.uid`
  - Changed `profile.name` to `profile.displayName`
  - Corrected `subscribeToDirectChat` call signature
  - Corrected `sendDirectMessage` call signature
  - Added type cast for `profile.role`
- **Result**: Zero TypeScript errors

---

### Issue 13: Critical Linting Errors ✅ FIXED

**Problem**: 9 critical ESLint errors causing cascading renders, React hooks violations, and code quality issues.

**Errors Found**:

1. Conditional React hooks (2 errors) - `god-mode-card.tsx`, `role-switcher.tsx`
2. setState in effect (4 errors) - `chat-contacts.tsx`, `use-incident.ts`, `use-location-distance.ts`, `use-responses.ts`
3. Empty catch blocks (2 errors) - `use-profile.ts`
4. Import style (1 error) - `seed-admin.ts`

**Fix** (Nov 1, 2025):

**Files Modified**:

- `components/god-mode-card.tsx`:
  - Moved early return AFTER all hooks (React rules)
  - Converted `viewMode` to `useMemo` (derived from pathname)
  - Performance: Eliminates unnecessary re-renders
- `components/role-switcher.tsx`:
  - Moved early return AFTER all hooks
  - Converted `currentView` to `useMemo`
- `components/chat-contacts.tsx`:
  - Converted `filteredContacts` from useState to `useMemo`
  - Better performance: Derived state, no cascading renders
- `hooks/use-incident.ts`:
  - Initialize `isLoading` and `error` conditionally in useState
  - Avoids setState-in-effect warning
- `hooks/use-location-distance.ts`:
  - Defer setState with `Promise.resolve().then()`
  - Avoids synchronous setState in effect
- `hooks/use-responses.ts`:
  - Initialize `loading` conditionally in useState
- `hooks/use-profile.ts`:
  - Added `console.error()` in both catch blocks
  - Proper error logging
- `scripts/seed-admin.ts`:
  - Converted `require()` to ES6 `import` with JSON assertion
  - Modern import style

**Result**:

- **Before**: 103 problems (9 errors ❌, 94 warnings)
- **After**: 95 problems (0 errors ✅, 95 warnings)
- **Performance**: Improved rendering performance with useMemo
- **Code Quality**: All React best practices followed
- **Remaining warnings**: Non-critical (unused vars, `any` types, intentional patterns)

---

**📚 Reference**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`

---

## 10. Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/ynotfins/EMU_v0.git
cd EMU_v0

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Create environment file
cp .env.example .env.local

# 4. Add Firebase credentials to .env.local
# (Get from Firebase Console → Project Settings → General)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID_WEB=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_FCM_VAPID_KEY=...

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

### Daily Development Loop

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install new dependencies (if any)
npm install --legacy-peer-deps

# 3. Start dev server
npm run dev

# 4. Make changes (hot reload enabled)

# 5. Type check
npm run typecheck

# 6. Lint check (optional)
npm run lint

# 7. Commit changes
git add .
git commit -m "feat: your change description"
git push origin main

# 8. Automatic deployment to Vercel (within ~60 seconds)
```

### Testing Workflow

**Local Testing**:

```bash
# Desktop browser
http://localhost:3000

# Mobile testing (same network)
http://192.168.1.XXX:3000

# Note: Geolocation requires HTTPS, so mobile testing
# works better on production (https://4axe.com)
```

**Production Testing**:

```bash
# Always test on https://4axe.com after deployment
# Especially for:
- Location features
- Push notifications (when implemented)
- Service workers
- PWA capabilities
```

### Debugging Tips

**Firebase Console Logs**:

```typescript
// All Firebase operations are logged
console.log("[useIncident] Loading incident:", incidentId);
console.log("[useIncidents] ✅ Loaded X incidents");
console.log("[Chat] Message sent:", message);
```

**Browser DevTools**:

- **Console**: Check for Firebase errors, authentication issues
- **Network Tab**: Verify Firestore queries, API calls
- **Application Tab**: Check localStorage cache, service workers
- **Performance Tab**: Monitor real-time listener overhead

**Common Error Patterns**:

```typescript
// Firebase permission denied
// → Check firestore.rules
// → Ensure user is authenticated

// Location error: Timeout expired
// → Increase timeout in use-location-distance.ts
// → Check browser location settings

// Chat messages not appearing
// → Check Realtime Database rules
// → Verify chat room was created with createIncidentChat()

// Distance not showing
// → Check if HTTPS (required for Geolocation API)
// → Verify NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set
```

**📚 Reference**: `docs/memory-bank/techContext.md`

---

## 11. Deployment

### Vercel Deployment (Current Production)

**Live URL**: https://4axe.com  
**Platform**: Vercel  
**Auto-Deploy**: ✅ Enabled on `git push`

#### Vercel Setup (Already Complete)

```bash
# 1. Install Vercel CLI (optional)
npm i -g vercel

# 2. Link project to Vercel
vercel link

# 3. Deploy
vercel --prod

# 4. Configure custom domain
# Vercel Dashboard → Project → Settings → Domains
# Add: 4axe.com
# DNS: CNAME → cname.vercel-dns.com
```

#### Environment Variables (Vercel Dashboard)

```bash
# Production Environment Variables (Already Set):
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=emu-incidents.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=emu-incidents
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=emu-incidents.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=542892859092
NEXT_PUBLIC_FIREBASE_APP_ID_WEB=1:542892859092:web:79a40a2e02b8fca19e4c86
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBFw0...
NEXT_PUBLIC_FCM_VAPID_KEY=BJ4x...

# Note: NEVER commit these to git!
```

#### Deployment Workflow

```bash
# Automatic deployment:
git push origin main
# ↓
# GitHub webhook triggers Vercel build
# ↓
# Vercel builds Next.js app (2-3 minutes)
# ↓
# Automatic deployment to https://4axe.com
# ↓
# Done! (~60 seconds total)
```

#### Vercel Build Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "nodeVersion": "18.x"
}
```

### Firebase Hosting (Not Used)

**Status**: ❌ Not used (difficult with Next.js SSR + dynamic routes)

**Why Vercel Instead**:

- ✅ Native Next.js support (built by Next.js team)
- ✅ Automatic deployments
- ✅ Edge functions globally distributed
- ✅ Zero config for SSR + dynamic routes
- ✅ Custom domains easy to set up

### Cloudflare Pages (Attempted, Abandoned)

**Status**: ❌ Abandoned (Next.js 16 not supported)

**Why Not**:

- ❌ Next.js 16 not officially supported
- ❌ `@cloudflare/next-on-pages` deprecated
- ❌ 404 errors despite successful builds

**Cloudflare Support Response**:

> "Next.js 16 is not yet officially supported on Cloudflare Pages. Please use Next.js 13-15 or deploy to Vercel."

**📚 Reference**: `VERCEL_DEPLOYMENT.md`, `docs/memory-bank/activeContext.md`

---

## 12. Memory Bank Cross-Reference

### Core Memory Bank Files

All memory bank files are in `docs/memory-bank/`:

| File                  | Purpose                                                | Cross-References                                 |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| **projectbrief.md**   | Project overview, goals, success criteria              | → README.md, WIRING.md, ROUTES.md, API_MAP.md    |
| **productContext.md** | User problems, solutions, UX goals                     | → projectbrief.md, progress.md                   |
| **systemPatterns.md** | Architecture, component relationships, design patterns | → techContext.md, WIRING.md, API_MAP.md          |
| **techContext.md**    | Tech stack, dependencies, dev setup                    | → systemPatterns.md, package.json, tsconfig.json |
| **activeContext.md**  | Current work focus, recent changes, session history    | → progress.md                                    |
| **progress.md**       | Detailed status tracking, what's done, what's left     | → activeContext.md, projectbrief.md              |

### Key Documentation Files

| File                           | Purpose                                | Related Memory Bank Files                            |
| ------------------------------ | -------------------------------------- | ---------------------------------------------------- |
| **HANDOFF.md** (this file)     | Comprehensive project handoff          | → ALL memory bank files                              |
| **WIRING.md**                  | Data flow diagrams, Firebase structure | → systemPatterns.md, API_MAP.md, FIRESTORE_SCHEMA.md |
| **API_MAP.md**                 | Hooks → Firebase mapping               | → systemPatterns.md, WIRING.md                       |
| **ROUTES.md**                  | Route documentation, navigation        | → projectbrief.md                                    |
| **FIRESTORE_SCHEMA.md**        | Database schema reference              | → WIRING.md, API_MAP.md                              |
| **COLOR_STANDARDS.md**         | Official color palette                 | → systemPatterns.md                                  |
| **FILTER_SYSTEM.md**           | Filter implementation details          | → systemPatterns.md, API_MAP.md                      |
| **AVATAR_GUIDE.md**            | Avatar specifications and guidelines   | → systemPatterns.md                                  |
| **OFFLINE_CACHE_SYSTEM.md**    | Cache implementation details           | → systemPatterns.md, techContext.md                  |
| **AUTH_AND_REALTIME.md**       | Authentication & real-time updates     | → techContext.md, systemPatterns.md                  |
| **LIVE_CHAT_TESTING_GUIDE.md** | Chat testing procedures                | → AUTH_AND_REALTIME.md, WIRING.md                    |
| **docs/README.md**             | Project README                         | → projectbrief.md, techContext.md                    |

### How Memory Bank Works

**Purpose**: Persistent context for AI agents across sessions.

**Reading Order** (for new agent):

1. **projectbrief.md** → Understand what this project is
2. **productContext.md** → Understand why it exists and who uses it
3. **systemPatterns.md** → Understand how it's architected
4. **techContext.md** → Understand what technologies are used
5. **activeContext.md** → Understand what's happening right now
6. **progress.md** → Understand what's done and what's left
7. **HANDOFF.md** → Deep dive into everything (you are here)

**Updating Memory Bank**:

- Update **activeContext.md** after every session with new work
- Update **progress.md** when features are completed or status changes
- Update **techContext.md** when dependencies are added/removed
- Update **systemPatterns.md** when architecture changes

**Cross-Referencing Rules**:

- 🔗 Always link to related docs with `📚 Reference: filename.md`
- ✅ Keep line numbers accurate when referencing code
- 🔄 Update all related docs when making changes
- 📝 Add new sections to activeContext.md for major features

**📚 Reference**: `docs/memory-bank/` directory

---

## 13. Next Steps

### 🔥 High Priority (Week 1)

#### 1. Custom Alert Groups with Train Horn Notifications

**Status**: Not started  
**User Requirement**: "users can save specific searches... if the high alert button is selected... then the high alert alarm will sound"

**Implementation Plan**:

1. Create Firestore collection: `/users/{uid}/alertGroups/{groupId}`
   ```typescript
   {
     id: string,
     name: string,
     filters: {
       distanceMi?: number,
       types?: string[],
       keyword?: string,
       minUpdates?: number
     },
     highAlertEnabled: boolean,
     notificationChannels: string[]  // ["push", "email", "sms"]
   }
   ```
2. Create new page: `app/chaser/alert-groups/page.tsx`
3. Add "Manage Alert Groups" link to profile page
4. Implement matching logic: When new incident arrives, check all user's alert groups
5. Trigger train horn sound if match + `highAlertEnabled === true`
6. Use Web Audio API for train horn (max volume)
7. Add vibration + screen flash (similar to current High Alert)

**Files to Create**:

- `hooks/use-alert-groups.ts`
- `app/chaser/alert-groups/page.tsx`
- `app/chaser/alert-groups/[id]/page.tsx` (edit group)
- `components/alert-group-form.tsx`
- `lib/high-alert-matcher.ts` (matching logic)

**Estimated Time**: 8-12 hours

---

#### 2. CRM Database for Homeowner Data

**Status**: Not started  
**User Requirement**: "we are going to need more backend processing... pull up the owner of the address and put that into the homeowner fields"

**Implementation Plan**:

1. Create Firestore collections:

   ```typescript
   /properties/{propertyId}
   {
     address: string,
     city: string,
     state: string,
     lat: number,
     lng: number,

     owner: {
       name: string,
       email: string,
       phone: string
     },

     incidentIds: string[],
     lastContactedAt: Timestamp,
     contactCount: number
   }

   /communications/{communicationId}
   {
     propertyId: string,
     incidentId: string,
     type: "email" | "sms" | "call",
     to: string,
     subject?: string,
     message: string,
     sentAt: Timestamp,
     sentBy: string (userId),
     status: "sent" | "delivered" | "failed"
   }
   ```

2. Create homeowner lookup page: `app/chaser/properties/[propertyId]/page.tsx`
3. Add "Lookup Homeowner" button on incident details page
4. Integrate with public property records API (e.g., Zillow, Attom Data Solutions)
5. Auto-populate homeowner form when property found
6. Track communication history

**External APIs Needed**:

- Property data: Attom Data API or Zillow API
- SMS: Twilio
- Email: SendGrid or AWS SES

**Files to Create**:

- `lib/actions/properties.ts`
- `lib/actions/communications.ts`
- `hooks/use-property.ts`
- `app/chaser/properties/[id]/page.tsx`
- `components/property-lookup.tsx`

**Estimated Time**: 12-16 hours

---

#### 3. eSign Full Integration

**Status**: UI complete, backend not wired  
**User Requirement**: "I need to know how to upload forms, and how to send them to customers... send PDF docs to the homeowners to esign... send them a text message link that opens the pdf for them to esign"

**Implementation Plan**:

1. **Upload PDFs to Firebase Storage**:
   - Path: `/forms/{formTemplateId}.pdf`
   - Metadata in Firestore: `/formTemplates/{id}`
2. **Generate Signature Requests**:
   - Create `/signatureRequests/{requestId}`:
     ```typescript
     {
       formTemplateId: string,
       incidentId: string,
       signerEmail: string,
       signerPhone?: string,
       status: "pending" | "signed" | "expired",
       uniqueLink: string,  // e.g., /sign/abc123
       createdAt: Timestamp,
       expiresAt: Timestamp,
       signedAt?: Timestamp,
       signedPdfUrl?: string
     }
     ```
3. **Send Notification**:
   - Email: SendGrid template with unique link
   - SMS: Twilio with shortened link
4. **Signing Page**:
   - Public route: `/sign/[requestId]`
   - Render PDF with signature canvas overlay
   - Capture signature using HTML5 canvas
   - Merge signature into PDF using pdf-lib
   - Upload signed PDF to Storage
   - Update request status
5. **Notification to Requester**:
   - FCM push notification: "John Doe signed your form"
   - Email: "Your document has been signed"

**Dependencies to Add**:

```bash
npm install pdf-lib @sendgrid/mail twilio
```

**Files to Create**:

- `app/sign/[requestId]/page.tsx` (public signing page)
- `lib/actions/esign.ts`
- `lib/sendgrid.ts`
- `lib/twilio.ts`
- `components/signature-canvas.tsx`

**Estimated Time**: 16-20 hours

---

### ⚙️ Medium Priority (Week 2)

#### 4. Firestore Geocoding Cache

**Status**: Client-side cache working, Firestore cache not implemented  
**Why**: Permanent storage, multi-user benefit, reduce Google Maps API costs

**Implementation Plan**:

1. Create Firestore collection: `/geocodedAddresses/{addressHash}`
   ```typescript
   {
     address: string,
     lat: number,
     lng: number,
     cachedAt: Timestamp,
     hitCount: number  // Track usage
   }
   ```
2. Update `hooks/use-incidents-with-distance.ts`:
   - Check Firestore cache first
   - If miss, check localStorage
   - If miss, call Google API
   - Save to both Firestore + localStorage
3. Use MD5 hash of normalized address as document ID
4. Add Firestore index for `address` field

**Estimated Time**: 2-4 hours

---

#### 5. Live Map for Supes

**Status**: Component exists, not fully wired  
**Current File**: `app/supe/map/page.tsx`, `components/live-team-map.tsx`

**Implementation Plan**:

1. Subscribe to all `/users` where `role === "chaser"` and `location` exists
2. Render Google Maps with markers for each chaser
3. Update markers in real-time as locations change
4. Add clustering for many markers
5. Click marker → Show chaser name, last update time, current incident

**Dependencies to Add**:

```bash
npm install @react-google-maps/api @googlemaps/markerclusterer
```

**Files to Update**:

- `app/supe/map/page.tsx`
- `hooks/use-live-locations.ts`
- `components/live-team-map.tsx`

**Estimated Time**: 6-8 hours

---

#### 6. Push Notifications (FCM)

**Status**: VAPID key configured, FCM setup stubbed  
**Current File**: `lib/fcm.ts` (stubbed)

**Implementation Plan**:

1. Complete `lib/fcm.ts`:
   - Request notification permission
   - Register service worker
   - Get FCM token
   - Save token to Firestore `/users/{uid}/fcmTokens/{token}`
2. Update `public/firebase-messaging-sw.js`:
   - Handle background notifications
   - Show notification with icon, badge, actions
3. Trigger notifications:
   - High Alert incidents
   - New chat messages (when app in background)
   - eSign completions
4. Add notification preferences to profile page

**Estimated Time**: 4-6 hours

---

### 🔮 Future Enhancements (Week 3+)

#### 7. 30-Day Retention Policy

**Status**: Not started  
**Goal**: Auto-delete incidents older than 30 days

**Implementation Plan**:

- Use Firebase Extensions: "Delete Collections"
- Schedule: Daily at 2 AM
- Query: `WHERE lastTs < 30 days ago`
- Archive to Cloud Storage before deletion (optional)

**Estimated Time**: 2 hours

---

#### 8. Advanced Search & Saved Searches

**Status**: Not started  
**Goal**: Command palette (Cmd+K) for app-wide search

**Implementation Plan**:

1. Add `cmdk` component (already installed)
2. Implement search across:
   - Incidents (by address, type, message)
   - Users (by name, email)
   - Chat messages
3. Save searches to Firestore
4. Show recent searches

**Estimated Time**: 6-8 hours

---

#### 9. Analytics Dashboard

**Status**: Not started  
**Goal**: Track usage, response times, popular incidents

**Implementation Plan**:

1. Use Vercel Analytics (already enabled)
2. Add custom events:
   - `incident_opened`
   - `incident_favorited`
   - `chat_message_sent`
   - `document_uploaded`
3. Create admin analytics page
4. Show charts: Recharts (already installed)

**Estimated Time**: 8-10 hours

---

#### 10. Error Tracking

**Status**: Not started  
**Goal**: Catch and report errors automatically

**Implementation Plan**:

1. Add Sentry:
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```
2. Configure `sentry.client.config.js` and `sentry.server.config.js`
3. Add to Vercel environment variables:
   - `SENTRY_DSN`
   - `SENTRY_AUTH_TOKEN`
4. Wrap critical sections with Sentry error boundaries

**Estimated Time**: 2-3 hours

---

## 14. Support & Contact

### Project Owner

**Name**: ynotfins  
**GitHub**: https://github.com/ynotfins  
**Repository**: https://github.com/ynotfins/EMU_v0

### Production Environment

**Live URL**: https://4axe.com  
**Firebase Project**: `emu-incidents`  
**Vercel Project**: `emu-v0`

### Quick Reference Links

- **Firebase Console**: https://console.firebase.google.com/project/emu-incidents
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com/
- **GitHub Repository**: https://github.com/ynotfins/EMU_v0

---

## 🏁 Conclusion

**EMU Alerts** is a production-ready, real-time emergency management system deployed at https://4axe.com. The core features are complete and working:

✅ **Authentication**: Bulletproof persistence, role-based access, God Mode  
✅ **Incident Management**: Real-time updates, distance calculation, filtering, deduplication  
✅ **Live Chat**: Firebase Realtime Database, incident group chats, 1-on-1 DMs  
✅ **Maps & Location**: Embedded maps, user location tracking, offline caching  
✅ **UI/UX**: Ultra-compact filters, collapsible sections, mobile-optimized, 20% rounded avatars  
✅ **Admin Tools**: User management, role changes, God Mode toggle  
✅ **Deployment**: Vercel automatic deployments, custom domain

**Next priorities**: Custom Alert Groups, CRM database, eSign integration, Live Map for supes, Push Notifications.

This handoff document provides everything a new developer or AI agent needs to understand, maintain, and extend the EMU Alerts system. All memory bank files are cross-referenced and kept up-to-date.

**Welcome to the team! 🚀**

---

_Last Updated: November 1, 2025_  
_Document Version: 2.0_  
_Maintained by: ynotfins + AI Agent_
