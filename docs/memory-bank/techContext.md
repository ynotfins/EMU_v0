# Technical Context: EMU Alerts

## Technologies Used

### Core Framework

- **Next.js 16.0.0** (App Router)
  - File-based routing (no route groups in use)
  - Server and client components
  - Built-in optimization (images, fonts, scripts)
  - Edge-ready deployment on Vercel
  - Production deployed at https://4axe.com

### Language

- **TypeScript 5.x** (Strict mode)
  - Type safety across entire codebase
  - Strict null checks enabled
  - No implicit any
  - All domain types in `/types/domain.ts`

### UI Framework & Styling

- **React 19.2.0** (RC)
  - Modern hooks patterns
  - Context API for state management
  - Requires `--legacy-peer-deps` for some packages (vaul)
- **Tailwind CSS 4.1.9**
  - Utility-first styling
  - Custom configuration for brand colors (#FF3B30, #34C759, #007AFF, #FF9500)
  - Dark mode support via next-themes
- **shadcn/ui (v0 components)**
  - Radix UI primitives (@radix-ui/react-\*)
  - Fully customizable components in `/components/ui`
  - Accessible by default (ARIA compliant)

### Backend Services (Firebase)

- **Firestore**: NoSQL database for incidents, users, favorites, bookmarks, notes, responses, contractors
  - Real-time listeners with `onSnapshot`
  - Offline persistence with IndexedDB (multi-tab support)
  - Security rules deployed with audit/legal paths locked
- **Firebase Realtime Database**: Chat system (incident chats + direct messages)
  - `/incident-chats/{chatId}/messages`
  - `/direct-chats/{chatId}/messages`
- **Firebase Auth**: User authentication (email/password + Google Sign-In)
  - `browserLocalPersistence` (never expires)
  - Triple-layer auth persistence (localStorage + sessionStorage + cookies)
  - Custom domain: authDomain=4axe.com
  - Cookie domain: `.4axe.com` (apex + www)
- **Firebase Cloud Functions**: TypeScript Cloud Functions (Node 20)
  - `logAuthEvent` - Audit logging with IP, UA, device fingerprint
  - `recordConsent` - Legal consent tracking with versioning
  - Writes to locked Firestore paths (only Functions can write)
- **Firebase Storage**: File uploads (initialized, not yet wired to UI)
- **Firebase Cloud Messaging (FCM)**: Push notifications (initialized, not yet wired)

### Key Dependencies

- **react-hook-form + zod**: Form validation
- **lucide-react**: Icon library
- **date-fns**: Date formatting and manipulation
- **recharts**: Charts and data visualization
- **vaul**: Drawer component (mobile-optimized)
- **sonner**: Toast notifications
- **cmdk**: Command palette (future search)
- **firebase-admin**: Server-side Firebase SDK (for Cloud Functions)
- **firebase-functions**: Cloud Functions SDK v6
- **@fingerprintjs/fingerprintjs-pro**: Device fingerprinting (optional, has fallback)

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm, pnpm, or yarn
- Git
- Firebase account (for backend integration)
- Google Cloud account (for Maps API)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd EMU_v0

# Install dependencies
npm install --legacy-peer-deps

# Note: --legacy-peer-deps required for React 19 + vaul compatibility
```

### Environment Variables

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID_WEB=your_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
NEXT_PUBLIC_FCM_VAPID_KEY=your_vapid_key
```

### Available Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
npm run check-env    # Verify environment variables (requires tsx)
npm run fn:build     # Build Firebase Functions TypeScript
npm run fn:deploy    # Deploy Cloud Functions to Firebase
npm run fn:emulate   # Run local Firebase emulators
npm run wiring:test  # Test Firebase wiring
npm run rules:deploy # Deploy Firestore security rules
```

### Development Workflow

1. Run `npm run typecheck` to catch type errors
2. Run `npm run dev` to start dev server
3. Open http://localhost:3000
4. Make changes (hot reload enabled)
5. Test in browser
6. Commit changes

## Technical Constraints

### TypeScript Strict Mode

- All code must pass `tsc --noEmit` with no errors
- Currently **38 type errors** that need fixing
- Null checks required (`profile` can be null)
- Proper type definitions for all props

### React 19 Compatibility

- Some packages (like vaul) don't officially support React 19
- Workaround: Install with `--legacy-peer-deps`
- Monitor for upstream compatibility updates

### Firebase SDK Version

- Using latest Firebase SDK (v10+)
- Modular imports pattern: `import { getFirestore } from 'firebase/firestore'`
- Tree-shaking enabled for smaller bundle size

### Tailwind CSS v4

- Using latest Tailwind (v4.1.9)
- PostCSS configuration required
- New CSS-first configuration approach

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari 14+, Android Chrome)
- PWA capabilities (service workers, push notifications)

## Tool Usage Patterns

### Firebase Initialization

```typescript
// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

### Custom Hooks Pattern

```typescript
// hooks/use-incidents.ts
export const useIncidents = () => {
  const [incidents, setIncidents] = useState<IncidentLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // TODO: Implement Firestore listener
    // const unsubscribe = onSnapshot(...)
    return () => {}; // cleanup
  }, []);

  return { incidents, loading, error };
};
```

### Component Composition

```typescript
// Pages compose hooks + components
export default function IncidentsPage() {
  const { incidents, loading } = useIncidents();
  const { filters } = useFilters();

  if (loading) return <Spinner />;

  return (
    <>
      <FilterBar filters={filters} />
      {incidents.map((inc) => (
        <IncidentListItem key={inc.id} incident={inc} />
      ))}
    </>
  );
}
```

### Error Handling

```typescript
try {
  await updateProfile(uid, data);
  toast.success("Profile updated");
} catch (err) {
  console.error("[v0] Profile update failed:", err);
  toast.error("Failed to update profile");
}
```

## Current State (As of Nov 1, 2025)

### What's Fully Implemented ✅

- ✅ Full UI/UX for all three roles (chaser, supe, admin, super_admin)
- ✅ Component library (shadcn/ui - 57 UI components)
- ✅ Custom hooks - **6 fully wired** (`useIncidents`, `useIncident`, `useIncidentsWithDistance`, `useLocationDistance`, `useProfile`, `useFilters`)
- ✅ Type definitions in `/types/domain.ts` (0 TypeScript errors)
- ✅ Firebase SDK initialization (Firestore + Auth + Realtime DB + Storage + FCM)
- ✅ Real authentication (email/password + Google Sign-In)
- ✅ Firestore real-time listeners (`onSnapshot` in all main hooks)
- ✅ Firebase Realtime Database chat system (incident + direct chats)
- ✅ Security rules deployed (Firestore)
- ✅ Routing structure (role-based: /chaser, /supe, /admin, /crm)
- ✅ Responsive design (mobile-first with desktop support)
- ✅ Deployed to production (Vercel at https://4axe.com)
- ✅ Distance calculation (client-side with geocoding)
- ✅ Offline persistence (IndexedDB for Firestore)
- ✅ Avatar system (20% rounded corners, reusable components)
- ✅ God Mode (super_admin role with toggle-based switching)
- ✅ CRM contractors page (desktop-first design)

### What's Initialized But Not Wired ⚠️

- ⚠️ Firebase Storage (SDK ready, no upload UI implementation)
- ⚠️ Firebase Cloud Messaging (SDK ready, no notification flow)
- ⚠️ File upload to Storage (UI exists in docs tab, backend not wired)
- ⚠️ Google Maps rendering (geocoding works, map UI is placeholder)

### What's Stubbed (TODO comments) ⏳

- ⏳ useThreads hook (TODO: Wire to /threads collection)
- ⏳ useMessages hook (TODO: Wire to /threads/{id}/messages)
- ⏳ useFiles hook (TODO: Wire to /files collection)
- ⏳ useLiveLocations hook (TODO: Wire to /profiles with location)

### What's Missing ❌

- ❌ E-signature integration (UI exists, no backend)
- ❌ File upload implementation (UI exists, no Storage wiring)
- ❌ Push notification flow (FCM initialized, no service worker)
- ❌ Google Maps rendering (geocoding works, map display pending)
- ❌ Real-time location tracking for supes (GPS works for distance, not tracking)

## Known Issues (Nov 1, 2025)

### Active Issues 🔴

1. **Chat contacts component ESLint warning**: setState in effect causes cascading renders (non-blocking)
2. **Spell checker warnings**: Multiple files have "firestore", "cashapp", "venmo" flagged (non-blocking, info level)
3. **Tailwind IntelliSense suggestions**: Some classes can use newer syntax (warnings, not errors)
4. **Unused imports**: A few components have unused imports (warnings, auto-fixed)

### Dependency Compatibility ⚠️

- **vaul**: Doesn't officially support React 19 (works with `--legacy-peer-deps`)
- **React 19**: Release candidate, some packages need peer dep override

### Features Not Yet Implemented ⏳

- Text messaging chat UI (backend ready, UI pending)
- File upload to Storage (UI exists, backend not wired)
- Push notifications (FCM SDK ready, service worker needed)
- Google Maps rendering (geocoding works, display pending)
- E-signature workflow (UI exists, backend not wired)

## Next Technical Steps

1. ✅ ~~Fix TypeScript errors~~ (COMPLETED - 0 errors)
2. ✅ ~~Add tsx dev dependency~~ (COMPLETED - v4.20.6 installed)
3. ✅ ~~Set up Firebase and configure env vars~~ (COMPLETED - deployed)
4. ✅ ~~Implement Firestore queries in hooks~~ (COMPLETED - 6 hooks wired)
5. ✅ ~~Add real-time listeners (onSnapshot)~~ (COMPLETED)
6. ✅ ~~Configure Firebase security rules~~ (COMPLETED - deployed)
7. ⏳ Integrate Google Maps SDK (geocoding done, display pending)
8. ⏳ Set up FCM push notifications (SDK ready, flow needed)
9. ✅ ~~Deploy to Vercel~~ (COMPLETED - live at 4axe.com)
10. ⏳ Build text messaging chat UI (high priority)
11. ⏳ Wire file upload to Storage
12. ⏳ Implement e-signature backend
