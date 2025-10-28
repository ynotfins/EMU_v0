# Active Context: EMU Alerts

## Current Status
**Project Stage**: Development - Live-Ready Shell with Type Errors

**Last Updated**: Session initialized

## Current Work Focus
Initial setup and assessment completed:
- ✅ Dependencies installed (with --legacy-peer-deps for React 19)
- ⚠️ TypeScript type checking failed (38 errors)
- ❌ Environment check script failed (tsx dependency missing)
- ✅ Development server started successfully

## Recent Changes
- First session initialization
- Ran `npm install --legacy-peer-deps` to resolve React 19 + vaul compatibility
- Identified 38 TypeScript errors across 11 files
- Started dev server (running in background)

## Active Issues & Blockers

### Critical (Type Safety)
**38 TypeScript Errors** blocking production readiness:

1. **Profile Null Safety** (24 errors)
   - Files: `app/chaser/profile/page.tsx`, `app/supe/profile/page.tsx`, chat pages, incidents pages
   - Issue: `profile` from `useProfile()` can be null but used without checks
   - Fix: Add null checks or loading states before accessing profile properties

2. **Missing onToggleSilence Prop** (6 errors)
   - Files: `app/chaser/favorites/page.tsx`, `app/supe/favorites/page.tsx`
   - Issue: `<IncidentListItem />` requires `onToggleSilence` prop but not provided
   - Fix: Add handler function or make prop optional in component definition

3. **Type Mismatches in Hooks** (5 errors)
   - Files: `hooks/use-incidents.ts`, `hooks/use-profile.ts`
   - Issues:
     - `inc.distanceMi` is possibly undefined
     - `inc.title` doesn't exist on IncidentLite type
     - `inc.updates` is possibly undefined
     - `locationEnabled` not in settings type
     - `cashApp` not in payout type
   - Fix: Update type definitions or add proper guards

4. **Firebase Storage Import** (1 error)
   - File: `lib/firebase.ts`
   - Issue: `Storage` type not exported from firebase/storage
   - Fix: Remove unused type import or use correct import

### Non-Critical (Tooling)
- `tsx` package missing (needed for `npm run check-env`)
- Environment variables not configured (expected for local dev)

## Next Immediate Steps

### Priority 1: Fix Type Errors
1. Fix profile null safety issues (add guards or loading states)
2. Fix missing `onToggleSilence` prop issues
3. Fix type mismatches in hooks
4. Fix Firebase Storage import

### Priority 2: Dev Tools
1. Add `tsx` to devDependencies
2. Consider adding `.env.local.example` for reference

### Priority 3: Environment Setup
1. Create Firebase project
2. Generate and configure environment variables
3. Test Firebase connection

## Important Patterns & Preferences

### Coding Standards (from user preferences)
- **Self-descriptive code**: Clear, descriptive naming for enums, tables, identifiers
- **Minimal code**: Only essential logic, avoid over-engineering
- **Simple syntax**: Beautiful, readable code
- **No redundant prefixes**: Don't repeat type names
- **Arrow functions**: Default to const arrow functions unless hoisting needed
- **No lodash/fp**: Prefer native JS methods
- **cn() for classNames**: Simplify class name syntax
- **Capitalize UI labels**: All labels in UI should be capitalized

### TypeScript Patterns
- Strict mode enabled (no implicit any, strict null checks)
- Types defined in `/types/domain.ts`
- Schema variables suffixed with "Schema" (zod schemas)
- Props interfaces end with "Props"

### Component Patterns
- Presentational components receive all data via props
- Custom hooks handle data fetching and state
- Error boundaries for graceful failures
- Loading states for async operations

### Firebase Patterns
- Modular imports: `import { getFirestore } from 'firebase/firestore'`
- Real-time listeners: `onSnapshot` for live updates
- Optimistic updates with rollback on error
- Type-safe Firestore queries

## Learnings & Project Insights

### Architecture Decisions
- **Role-based directory structure**: Separate `/chaser` and `/supe` routes make authorization clear
- **Mock data during development**: Allows UI development without Firebase dependency
- **Stubs with TODO comments**: Clear path from mock → real implementation
- **Type-first development**: Domain types defined before implementation

### React 19 Compatibility
- Some packages (vaul) require `--legacy-peer-deps`
- May need updates when packages add React 19 support
- No functional issues observed, only peer dependency warnings

### Mobile-First Approach
- Bottom navigation for thumb reach
- Large touch targets
- High contrast for outdoor visibility
- Offline-capable PWA features planned

### Firebase Integration Strategy
- Firebase SDK initialized but queries not implemented
- All hooks have stub implementations with return types matching future Firebase queries
- Easy to swap: just replace mock data with Firestore calls
- Real-time listeners will use `onSnapshot` pattern

## Questions & Decisions Pending
- Should profile pages show loading spinner or redirect when profile is null?
- Should `onToggleSilence` be optional or always required in IncidentListItem?
- Do we need `inc.title` field on IncidentLite or is it a typo in filter logic?
- Firebase project setup: Development and production projects separate or combined?

## Context for Next Session
This is the **first session** initializing the Memory Bank. The project is a mature UI implementation with:
- Complete component library and routing structure
- Mock data for all features
- Firebase stubs ready for implementation
- **38 TypeScript errors blocking deployment** (primary focus)

The immediate goal should be fixing the type errors to achieve a clean TypeScript build, then proceeding with Firebase integration.

