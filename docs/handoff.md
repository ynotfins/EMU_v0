# EMU_v0 — Handoff Summary

**Last Updated**: 2025-10-28  
**Status**: Firebase Wired, Real-Time Data Live

---

## Environment

- **Project Root**: `D:\github\EMU_v0`
- **Config**: `.env.local` contains Firebase + Maps keys
- **Firebase Project**: `emu-incidents`
- **Dev UID Fallback**: `dev-user-0000001` (for testing without auth)
- **Dev Server**: http://localhost:3000
- **Remote**: https://github.com/ynotfins/EMU_v0

---

## Architecture

### Stack
- **Framework**: Next.js 14 (App Router) + React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Firebase Firestore (real-time)
- **Auth**: Firebase Auth (stubbed, using DEV_UID)
- **Storage**: Firebase Storage (initialized, not wired)
- **Notifications**: FCM (initialized, no permission flow yet)
- **Maps**: Google Maps JavaScript API (placeholder)

### Data Patterns
- **Real-Time**: All data uses `onSnapshot` listeners
- **Normalization**: `normalize()` function handles inconsistent Firestore fields
- **User Flags**: `withUserFlags()` derives per-user favorites/bookmarks
- **Local State**: Silence preferences stored in `localStorage`
- **Error Handling**: Structured logging with `lib/logger.ts`

### Key Utilities
- **`lib/dev.ts`**: DEV_UID fallback for unauthenticated development
- **`lib/logger.ts`**: Structured error logging (`AppError`, `logError()`)
- **`lib/silence.ts`**: Local silence state management
- **`lib/diagnostics.ts`**: Firebase access testing

---

## Diagnostics

### Run Wiring Test
```bash
npm run wiring:test
```
**What it does**:
- Validates Firestore read access
- Reports current UID (real or DEV_UID fallback)
- Tests connectivity to Firebase project

### Error Logs
- **Browser Console**: All errors logged via `logError()` in `lib/logger.ts`
- **Next.js Overlay**: Shows compile and runtime errors in dev mode
- **Error Boundary**: Catches React errors and displays reload UI

### Performance
- **Next.js Dev Logs**: Shows compile and render times per route
- **Slow Queries**: Check browser Network tab for Firestore latency

---

## What's Working ✅

### Hooks
| Hook | Status | Description |
|------|--------|-------------|
| `useIncidents()` | ✅ **LIVE** | Real-time collection listener with normalization |
| `useIncident(id)` | ✅ **LIVE** | Real-time doc listener with error handling |
| `useProfile()` | ⚠️ Stubbed | Returns DEV_PROFILE, settings persist to localStorage |
| `useFilters()` | ✅ Works | Client-only filtering (no Firebase) |
| `useThreads()` | ⚠️ Stubbed | TODO: Wire to `/threads` collection |
| `useMessages(threadId)` | ⚠️ Stubbed | TODO: Wire to `/threads/{id}/messages` subcollection |
| `useFiles(incidentId)` | ⚠️ Stubbed | TODO: Wire to `/files` collection |
| `useLiveLocations()` | ⚠️ Stubbed | TODO: Wire to `/profiles` with location enabled |

### Firestore Actions
| Action | Status | Implementation |
|--------|--------|----------------|
| `toggleFavorite(id)` | ✅ **LIVE** | `arrayUnion` with current user UID |
| `unfavorite(id)` | ✅ **LIVE** | `arrayRemove` with current user UID |
| `toggleBookmark(id)` | ✅ **LIVE** | `arrayUnion` with current user UID |
| `unbookmark(id)` | ✅ **LIVE** | `arrayRemove` with current user UID |
| `silenceAlert(id)` | ✅ Local | Uses `localStorage` (per-device) |

### UI Components
- ✅ All 40+ shadcn/ui components installed
- ✅ All 15+ custom components built
- ✅ Role-based routing (chaser, supe, admin)
- ✅ Bottom navigation (mobile-first)
- ✅ Error boundary for graceful failures

---

## Known Issues & Outstanding Work

### 🔴 Critical
1. **Firebase Auth Not Implemented**
   - Currently using `DEV_UID` fallback
   - Need: Email/password auth, protected routes
   - Impact: Anyone can write to Firestore if rules allow

2. **Firestore Security Rules Not Deployed**
   - Default rules may be too permissive
   - Reference rules in `/docs/WIRING.md`
   - Need: Deploy rules with proper authentication checks

### 🟡 Important
3. **Detail Map Not Showing**
   - UI placeholder exists
   - Need: Integrate Google Maps JS API with dynamic lat/lng
   - File: `components/map-card.tsx`

4. **Favorites Error: "Missing or insufficient permissions"**
   - Likely cause: Firestore rules don't allow `arrayUnion` for current user
   - Fix: Update rules per `/docs/WIRING.md` security section
   - Test: After rules update, click ⭐ on incident

5. **Silent Toggle Re-Filters List**
   - Current: Toggle calls parent callback, triggers re-render
   - Expected: Local toggle only, no list reload
   - Fix: Remove `onToggleSilence` callback, purely local state

6. **Push/Location Toggles Not Persisting Remotely**
   - Current: Settings save to `localStorage` only
   - Expected: Sync to Firestore user settings subcollection
   - Fix: Wire `useProfile().updateSettings()` to Firestore

### 🟢 Nice to Have
7. **UI Parity with Mobile "Goal" App**
   - Current: Web-first layout
   - Expected: Replicate exact tab structure and map-first layout from designs
   - Files: All pages in `app/chaser/` and `app/supe/`

8. **Chat Not Wired**
   - UI exists, but no Firestore integration
   - Need: Wire `useThreads()` and `useMessages(threadId)`
   - Collections: `/threads`, `/threads/{id}/messages`

9. **File Upload Not Implemented**
   - UI exists (DocsManager component)
   - Need: Wire to Firebase Storage
   - Path: `/incidents/{id}/files/`

10. **Live Map Not Wired**
    - UI placeholder exists
    - Need: Wire `useLiveLocations()` to Firestore
    - Query: `/profiles` where `settings.trackingEnabled === true`

---

## Next Steps (Recommended Order)

### Step 1: Verify Firestore Access 🧪
```bash
npm run wiring:test
```
- Should return `{ ok: true, uid: "dev-user-0000001", message: "Firestore read OK" }`
- If fails: Check `.env.local` has correct Firebase keys

### Step 2: Deploy Firestore Rules 🔐
1. Open `/docs/WIRING.md` → copy Firestore rules
2. Open Firebase Console → Firestore Database → Rules
3. Paste rules, publish
4. Test: Click ⭐ on incident, should work without errors

### Step 3: Add Test Data 📊
1. Firebase Console → Firestore Database
2. Create collection: `incidents`
3. Add document with structure from `/docs/WIRING.md`
4. Refresh app → should see incident in list
5. Test real-time: Modify doc in console → UI updates instantly

### Step 4: Implement Firebase Auth 🔑
1. Firebase Console → Authentication → Sign-in method → Enable Email/Password
2. Wire `app/(auth)/login/page.tsx` to `signInWithEmailAndPassword()`
3. Wire `app/(auth)/signup/page.tsx` to `createUserWithEmailAndPassword()`
4. Add middleware for protected routes
5. Replace `DEV_UID` with `auth.currentUser?.uid`

### Step 5: Integrate Google Maps 🗺️
1. Get API key from Google Cloud Console
2. Update `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`
3. Wire `components/map-card.tsx` to `@googlemaps/js-api-loader`
4. Pass `incident.lat`, `incident.lng` to map component

### Step 6: Wire Remaining Hooks 📡
1. `useProfile()` → `/profiles/{uid}` document
2. `useThreads()` → `/threads` collection where user is member
3. `useMessages(threadId)` → `/threads/{id}/messages` subcollection
4. `useFiles(incidentId)` → `/files` collection where `incidentId` matches
5. `useLiveLocations()` → `/profiles` where tracking enabled

### Step 7: Deploy to Firebase Hosting 🚀
```bash
npm run build
firebase deploy --only hosting
```
- Test production URL
- Verify environment variables loaded correctly

---

## Important Files

### Configuration
- `.env.local` - Environment variables (Firebase, Maps, FCM)
- `.env` - Template (committed to Git)
- `firebase.json` - Firebase Hosting config
- `tsconfig.json` - TypeScript config
- `.eslintrc.json` - ESLint config

### Core Libraries
- `lib/firebase.ts` - Firebase SDK initialization
- `lib/dev.ts` - DEV_UID fallback
- `lib/logger.ts` - Error logging
- `lib/diagnostics.ts` - Firebase access testing
- `lib/silence.ts` - Local silence state

### Documentation
- `docs/README.md` - Project overview
- `docs/WIRING.md` - Data contracts, Firestore rules, security
- `docs/ROUTES.md` - Complete route tree
- `docs/COMPONENTS.md` - Component catalog
- `docs/API_MAP.md` - Hooks → Firestore mapping
- `docs/ENV.md` - Environment variables guide
- `docs/TESTPLAN.md` - Manual testing checklist

### Memory Bank
- `docs/memory-bank/activeContext.md` - Current work focus
- `docs/memory-bank/progress.md` - What's complete, in progress, remaining
- `docs/memory-bank/projectbrief.md` - Project overview
- `docs/memory-bank/systemPatterns.md` - Architecture patterns
- `docs/memory-bank/techContext.md` - Tech stack details

---

## Contact & Handoff Notes

**Project Owner**: ynotfins  
**GitHub**: https://github.com/ynotfins/EMU_v0  
**Firebase Project**: emu-incidents

**Development Mode**:
- YOLO Mode: ✅ Enabled (auto-fix, auto-commit)
- Autonomous Mode: ✅ Enabled (proactive improvements)
- Memory Bank: ✅ Up to date

**Git Status**:
- Branch: `main`
- Commits this session: 12
- Last commit: "docs: update Memory Bank with Firebase integration progress"
- Remote: ✅ Synced

**TypeScript**: 0 errors ✅  
**ESLint**: 0 errors, 4 warnings ⚠️  
**Build**: ✅ Passing

---

_This handoff document is current as of 2025-10-28. Check Memory Bank for latest status._

