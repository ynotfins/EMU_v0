# EMU Alerts - Emergency Management Unit Alert System

## Overview

EMU Alerts is a comprehensive emergency management system built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and shadcn/ui. The application provides role-based interfaces for emergency responders (chasers), supervisors (supes), and administrators to manage incidents, communicate via chat, track locations, and handle documentation including e-signatures.

## Key Features

- **Role-Based Access**: Three distinct user roles (chaser, supe, admin) with tailored interfaces
- **Incident Management**: Create, track, and respond to emergency incidents with real-time updates
- **Live Chat**: Team, incident-specific, and direct messaging with real-time notifications
- **Document Management**: Upload photos, documents, and manage files per incident
- **E-Signature Workflow**: Send documents for signature or sign live on device
- **Live Map Tracking**: Supervisors can view active responder locations in real-time
- **Favorites & Bookmarks**: Star incidents, bookmark items, and save notes for quick access
- **High Alert System**: Configurable audio alerts for high-priority incidents
- **Profile Management**: ID verification, preferences, emergency payment info

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: React hooks with SWR for client-side caching
- **Backend (Future)**: Firebase (Firestore, FCM, Storage, Extensions)
- **Maps**: Google Maps API (placeholder ready)

## Project Structure

\`\`\`
/app                    # Next.js App Router pages
  /(auth)              # Authentication routes
  /admin               # Admin dashboard
  /chaser              # Chaser role routes
  /supe                # Supervisor role routes
  /docs                # Dev documentation viewer
/components            # React components
  /ui                  # shadcn/ui components
/hooks                 # Custom React hooks
/lib                   # Utilities and mock data
  /mock                # Mock datasets for development
/types                 # TypeScript type definitions
/scripts               # Verification and utility scripts
/docs                  # Documentation files
/public                # Static assets (logo, images)
\`\`\`

## How to Run

### Development

\`\`\`bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev
\`\`\`

The app will be available at `http://localhost:3000`

### Build

\`\`\`bash
# Create production build
npm run build

# Run production server
npm start
\`\`\`

### Type Checking

\`\`\`bash
# Run TypeScript compiler without emitting files
npm run type-check
# or
npx tsc --noEmit
\`\`\`

### Linting

\`\`\`bash
# Run ESLint
npm run lint
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
npm run check-env
# or
node scripts/check-env.ts
\`\`\`

### Firebase Wiring Status

The application is currently in **live-ready shell mode**:
- ✅ Firebase SDK initialized (`lib/firebase.ts`, `lib/fcm.ts`)
- ✅ All hooks converted to Firebase-ready stubs
- ✅ Mock data removed from all hooks
- ⏳ Firestore queries need to be implemented (see TODOs in hooks)
- ⏳ Real-time listeners need to be added
- ⏳ Firebase Extensions need to be configured
- ⏳ Security rules need to be deployed

### Integration Documentation

- `/docs/INTEGRATION_LOG.md` - Track Firebase wiring progress
- `/docs/API_MAP.md` - Hooks → Firestore collections mapping
- `/docs/WIRING.md` - Complete data contracts and security rules
- `/docs/EXTENSIONS.md` - Firebase Extensions setup guide

### Wiring Checklist

1. Set up Firebase project in Firebase Console
2. Enable Firestore, Auth, Storage, and FCM
3. Add all environment variables to Vercel project (see `/docs/ENV.md`)
4. Run `npm run check-env` to verify configuration
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
