# Technical Context: EMU Alerts

## Technologies Used

### Core Framework
- **Next.js 16.0.0** (App Router)
  - File-based routing
  - Server and client components
  - Built-in optimization (images, fonts, scripts)
  - Edge-ready deployment

### Language
- **TypeScript 5.x** (Strict mode)
  - Type safety across entire codebase
  - Strict null checks enabled
  - No implicit any

### UI Framework & Styling
- **React 19.2.0**
  - Modern hooks patterns
  - Context API for state management
- **Tailwind CSS 4.1.9**
  - Utility-first styling
  - Custom configuration for brand colors
  - Dark mode support via next-themes
- **shadcn/ui**
  - Radix UI primitives
  - Fully customizable components
  - Accessible by default

### Backend Services (Firebase)
- **Firestore**: NoSQL database for incidents, profiles, chat
- **Firebase Auth**: User authentication
- **Firebase Storage**: File uploads (photos, documents)
- **Firebase Cloud Messaging (FCM)**: Push notifications
- **Firebase Extensions**: Image processing, automation

### Key Dependencies
- **react-hook-form + zod**: Form validation
- **lucide-react**: Icon library
- **date-fns**: Date formatting and manipulation
- **recharts**: Charts and data visualization
- **vaul**: Drawer component (mobile-optimized)
- **sonner**: Toast notifications
- **cmdk**: Command palette (future search)

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
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
```

### Custom Hooks Pattern
```typescript
// hooks/use-incidents.ts
export const useIncidents = () => {
  const [incidents, setIncidents] = useState<IncidentLite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // TODO: Implement Firestore listener
    // const unsubscribe = onSnapshot(...)
    return () => {} // cleanup
  }, [])

  return { incidents, loading, error }
}
```

### Component Composition
```typescript
// Pages compose hooks + components
export default function IncidentsPage() {
  const { incidents, loading } = useIncidents()
  const { filters } = useFilters()
  
  if (loading) return <Spinner />
  
  return (
    <>
      <FilterBar filters={filters} />
      {incidents.map(inc => (
        <IncidentListItem key={inc.id} incident={inc} />
      ))}
    </>
  )
}
```

### Error Handling
```typescript
try {
  await updateProfile(uid, data)
  toast.success("Profile updated")
} catch (err) {
  console.error("[v0] Profile update failed:", err)
  toast.error("Failed to update profile")
}
```

## Current State

### What's Implemented
- ✅ Full UI/UX for all three roles
- ✅ Component library (shadcn/ui)
- ✅ Custom hooks (stubbed)
- ✅ Type definitions
- ✅ Firebase SDK initialization
- ✅ Mock data for development
- ✅ Routing structure
- ✅ Responsive design (mobile-first)

### What's Stubbed
- ⚠️ Firebase hooks (have TODO comments)
- ⚠️ Authentication (mock login)
- ⚠️ Real-time listeners
- ⚠️ File upload to Storage
- ⚠️ Push notifications (FCM)
- ⚠️ Google Maps integration

### What's Missing
- ❌ Firestore queries implementation
- ❌ Security rules
- ❌ Firebase Extensions configuration
- ❌ Real authentication flow
- ❌ Google Maps rendering
- ❌ E-signature integration
- ❌ Environment variables (not set)

## Known Issues

### Type Errors (38 total)
1. **Profile null checks** (24 errors): `profile` can be null but used without checks
2. **Missing props** (6 errors): `onToggleSilence` missing in favorites pages
3. **Type mismatches** (5 errors): `use-incidents.ts` and `use-profile.ts`
4. **Import error** (1 error): Firebase Storage type import
5. **Domain type issues** (2 errors): `locationEnabled` and `cashApp` fields

### Dependency Issues
- **vaul**: Doesn't support React 19 officially (works with --legacy-peer-deps)
- **tsx missing**: `npm run check-env` fails (needs tsx package)

### Environment Setup
- No environment variables configured
- Firebase not connected
- Google Maps API not set
- FCM VAPID key not generated

## Next Technical Steps
1. Fix TypeScript errors (38 errors blocking type safety)
2. Add tsx dev dependency for check-env script
3. Set up Firebase project and configure env vars
4. Implement Firestore queries in hooks
5. Add real-time listeners (onSnapshot)
6. Configure Firebase security rules
7. Integrate Google Maps SDK
8. Set up FCM for push notifications
9. Deploy to Vercel with env vars

