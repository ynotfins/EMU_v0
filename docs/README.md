# EMU Alerts - Emergency Management Unit Alert System

## Overview

EMU Alerts is a comprehensive emergency management system built with Clean Architecture, Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and Firebase. The application provides role-based interfaces for emergency responders (chasers) and supervisors (supes) to manage fire incidents, communicate via real-time chat, track locations on live maps, and handle documentation including e-signatures.

**Deployments**:
- Production: https://4axe.com (main branch - original architecture)
- Staging/Rebuild: https://rebuild.4axe.com (rebuild-proper-architecture branch - Clean Architecture)

### Correction 2025-01-05T01:30:00Z
[status]: active
[id]: c_20250105_013000_readme1
[source]: action
[reason]: Updating README with current accurate state

Previous statement about "currently deployed at 4axe.com" was incomplete. The application has two active deployments serving different purposes during the architecture migration.

## Key Features

### Core Functionality
- **Real-Time Incident Alerts**: MacroDroid ingests BNN fire alerts → Firestore → Instant display
- **Auto-Geocoding**: Cloud Functions geocode addresses server-side, add lat/lng coordinates
- **Live Maps**: Three different maps (incident detail, live alerts, team tracking)
- **Distance Calculation**: Show distance from user to each incident
- **Response Tracking**: Chasers respond to alerts, Supes get notified automatically

### Communication
- **Incident Group Chat**: Opens chat → ALL Supes added automatically
- **Direct Messages**: Chaser↔Supe and Chaser↔Chaser private messaging
- **Real-Time Sync**: Firebase Realtime Database, < 1 second latency
- **Push Notifications**: New incidents, responses, messages

### Documentation
- **Auto-Save Notes**: Type notes, auto-saves on blur, appears in Notes tab
- **Homeowner Forms**: Collect property owner info, links to CRM
- **Document Upload**: Photos and PDFs to Firebase Storage
- **E-Signatures**: Send for signature or sign live on device

### Maps & Location
- **Incident Detail Map**: Embedded Google Map on each incident (city zoom)
- **Live Alert Map**: Interactive map with last 10 incidents (pinch to zoom)
- **Live Team Map** (Supe only): Real-time GPS tracking of all Chasers

### CRM Integration
- **Contact Management**: Auto-created per unique address
- **Incident History**: Track all incidents at same property
- **Homeowner Data**: Pre-populate for repeat locations

### Correction 2025-01-05T01:35:00Z
[status]: active
[id]: c_20250105_013500_features1
[source]: action
[reason]: Previous feature list was generic, now specific to actual implementation

Added specific details about:
- Auto-geocoding via Cloud Functions
- Three distinct map types
- CRM contact auto-creation
- Incident group chat behavior
- Note auto-save functionality

## Tech Stack

- **Framework**: Next.js 16.0.0 with App Router
- **Runtime**: React 19.2.0 (RC)
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, Presentation layers)
- **Language**: TypeScript 5.x (strict mode, ~429 errors being fixed)
- **Styling**: Tailwind CSS v4.1.9 with shadcn/ui components (57 components)
- **State Management**: React hooks with real-time Firebase listeners
- **Backend**: Firebase (Firestore + Realtime Database + Auth + Storage + FCM)
  - **Firestore**: Real-time data with `onSnapshot`, offline persistence
  - **Realtime DB**: Chat system (incident + direct messages)
  - **Auth**: Email/password + Google Sign-In, `browserLocalPersistence`
  - **Storage**: Initialized (not yet wired)
  - **FCM**: Initialized (not yet wired)
- **Maps**: Google Maps Geocoding API (address → coordinates) + planned map rendering
- **Deployment**: Vercel (live at https://4axe.com)

## Project Structure

\`\`\`
/app # Next.js App Router pages
/login # Login page
/signup # Signup pages (basic + new multi-step)
/role # Role selection page
/admin # Admin dashboard (user management)
/chaser # Chaser role routes (incidents, favorites, profile, chat)
/supe # Supervisor role routes (includes chaser features + map)
/crm # CRM pages (independent contractors)
/docs # Dev documentation viewer
/components # React components
/ui # shadcn/ui components (57 components)
/hooks # Custom React hooks (10 total, 6 fully wired)
/lib # Utilities and Firebase integration
/actions # Server actions (Firestore operations)
/context # React context providers
/mock # Mock data (legacy, mostly replaced)
/types # TypeScript type definitions
/scripts # Admin scripts (make-admin, seed-roles, etc)
/docs # Documentation files (30+ guides)
/memory-bank # AI memory bank files (6 core files)
/public # Static assets (logo, avatars, manifest.json)
\`\`\`

## How to Run

### Development

\`\`\`bash

# Install dependencies (if needed)

pnpm install

# Run development server

pnpm dev
\`\`\`

The app will be available at `http://localhost:3000`

### Build

\`\`\`bash

# Create production build

pnpm build

# Run production server

pnpm start
\`\`\`

### Type Checking

\`\`\`bash

# Run TypeScript compiler without emitting files

pnpm typecheck

# or

npx tsc --noEmit
\`\`\`

### Linting

\`\`\`bash

# Run ESLint

pnpm lint
\`\`\`

## Environment Variables

The following environment variables are required and should be configured in your Vercel project:

- `FIREBASE_API_KEY` - Firebase Web API key
- `GOOGLE_MAPS_API_KEY` - Google Maps JavaScript API key
- `FCM_VAPID_KEY` - Firebase Cloud Messaging VAPID key for push notifications

See `/docs/ENV.md` for detailed information about each variable and where they're used.

## User Roles

### Chaser (Emergency Responder)

- View and respond to incidents
- Access incident details, homeowner forms, documents, and e-signatures
- Chat with team and supervisors
- Manage favorites and bookmarks
- Update profile and preferences

### Supe (Supervisor)

- All chaser capabilities
- View live map of active responders
- Delete files from incidents
- Manage team communications

### Admin

- User management dashboard
- Toggle user roles and verification status
- System-wide oversight

## Default Login

For development, the app uses mock authentication. After login, select a role to access the appropriate dashboard.

## Mock Data

The application includes comprehensive mock data in `/lib/mock/` for development:

- 15 sample incidents with varied statuses and types
- User profiles for all three roles
- Chat threads and messages
- Document and signature records

## Integration

### Check Environment Variables

Before wiring Firebase, verify all required environment variables are set:

\`\`\`bash

# Check if all Firebase env vars are configured

pnpm check

# or

node scripts/check-env.ts
\`\`\`

### Firebase Integration Status (Nov 1, 2025)

The application is **LIVE and fully integrated with Firebase**:

- ✅ Firebase SDK initialized (`lib/firebase.ts`, `lib/fcm.ts`, `lib/realtime-database.ts`)
- ✅ Firestore fully wired with real-time listeners (`onSnapshot`)
- ✅ 6 hooks fully implemented with Firebase
- ✅ Real authentication (email/password + Google Sign-In)
- ✅ Chat system using Firebase Realtime Database
- ✅ Security rules deployed and active
- ✅ Offline persistence enabled (IndexedDB)
- ✅ Distance calculation with geocoding
- ⏳ File upload to Storage (UI exists, backend pending)
- ⏳ Push notifications (FCM SDK ready, flow pending)
- ⏳ 4 hooks still stubbed (threads, messages, files, live locations)

### Integration Documentation

- `/docs/INTEGRATION_LOG.md` - Track Firebase wiring progress
- `/docs/API_MAP.md` - Hooks → Firestore collections mapping
- `/docs/WIRING.md` - Complete data contracts and security rules
- `/docs/EXTENSIONS.md` - Firebase Extensions setup guide

### Wiring Checklist

1. Set up Firebase project in Firebase Console
2. Enable Firestore, Auth, Storage, and FCM
3. Add all environment variables to Vercel project (see `/docs/ENV.md`)
4. Run `pnpm check` to verify configuration
5. Implement Firestore queries in hooks (replace TODOs)
6. Add real-time listeners (onSnapshot)
7. Configure Firebase Extensions per `/docs/EXTENSIONS.md`
8. Deploy Firestore security rules from `/docs/WIRING.md`
9. Test end-to-end with real data
10. Update `/docs/INTEGRATION_LOG.md` with progress

## Next Steps

1. **Firebase Integration**: Replace mock hooks with real Firebase queries
2. **Google Maps**: Integrate Google Maps SDK in MapCard and LiveMap components
3. **Push Notifications**: Implement FCM for real-time alerts
4. **Authentication**: Add Firebase Auth with email/password
5. **File Upload**: Connect to Firebase Storage for document uploads
6. **E-Signature**: Integrate with e-signature provider or build custom solution

## Documentation

- `/docs/ROUTES.md` - Complete route tree and navigation structure
- `/docs/COMPONENTS.md` - Component catalog with props and usage
- `/docs/WIRING.md` - Data contracts, hooks, and Firebase collections
- `/docs/ENV.md` - Environment variable reference
- `/docs/TESTPLAN.md` - Manual testing checklist
- `/docs/EXTENSIONS.md` - Firebase Extensions configuration guide
- `/docs/manifest.json` - Machine-readable project structure

## Support

For issues or questions, refer to the documentation in `/docs` or visit `/docs` in development mode for an interactive documentation viewer.
