# TypeScript Cleanup Progress

## Status: In Progress (241 errors remaining, down from 429)

### ✅ Completed Fixes

1. **Dependency Hygiene**
   - Pinned `firebase@^11.2.0` and `@vercel/analytics@^1.4.1`
   - Removed Node built-ins `fs` and `path` from dependencies
   - Regenerated pnpm-lock.yaml

2. **Firebase Repository Modular Imports**
   - Added modular imports to `incident.repository.firebase.ts`
   - Added modular imports to `user.repository.firebase.ts`
   - Imported: query, where, orderBy, limit, startAfter, getDocs, doc, onSnapshot, deleteDoc, setDoc, collection

3. **Extended Domain Types for UI Compatibility**
   - **Profile**: Added `uid`, `name`, `agency`, `super_admin` role, expanded `settings`, `stats`, `payout` with all UI-expected fields
   - **Thread**: Added `kind`, `title`, `lastMessageContent`, `lastMessageTimestamp`
   - **IncidentUpdate**: Added `ts` alias for timestamp
   - **FileMeta**: Added `name`, `type`, `kind`, `role`, `message`, `ts` aliases
   - **IncidentLite**: Added direct `lat`/`lng` access
   - **Incident**: Created UI-friendly interface with all fields hooks return
   - **HomeownerForm**: Made `phone` and `email` optional

4. **Component Prop Fixes**
   - Added optional `incidentId` to DocsManager and ESignManager
   - Made `incidentAddress` optional in IncidentChat
   - Fixed HomeownerForm initialization with required fields

5. **Timestamp Normalization**
   - Created `normalizeTimestamp` helper for Firestore `{ seconds: number }` format
   - Applied to all incident list pages (chaser/supe incidents, map)
   - Fixed date comparisons in filtering and sorting

6. **Minor Fixes**
   - Fixed Thread.title fallback in chat pages
   - Fixed optional undefined checks

### 🔄 Remaining Issues (241 errors)

#### High Priority

1. **Infrastructure Firebase Repositories** (~150 errors)
   - Still using Firebase Admin SDK imports but need client SDK for some operations
   - Missing proper error handling for Either types
   - Type mismatches in repository implementations
   - Files: `src/infrastructure/firebase/repositories/*.ts`

2. **Mock Data Type Alignment** (~40 errors)
   - Mock incidents using old type structure
   - Mock profiles missing new fields
   - Mock threads/messages type mismatches
   - Files: `src/lib/mock/*.ts`

3. **Component Type Issues** (~20 errors)
   - Settings fields not matching Profile type
   - Stats fields not matching Profile type
   - Payout fields not matching Profile type
   - Router typed routes issues
   - Files: `src/app/*/profile/page.tsx`, `src/app/*/incidents/page.tsx`

4. **Missing Test Files** (~10 errors)
   - `scripts/clear-bad-distance-cache.ts` - missing `../lib/firebase`
   - `scripts/wiring-test.ts` - missing `../lib/diagnostics`

5. **Misc Type Errors** (~21 errors)
   - Optional chaining issues (`incident` possibly undefined)
   - Element.click() type in signup
   - Router.push typed routes
   - HomeownerForm partial type issues

#### Strategy for Resolution

1. **Quick Wins** (next 30 min):
   - Fix mock data types
   - Fix profile settings/stats/payout field access with optional chaining
   - Delete or stub missing test utility files
   - Fix typed routes with explicit type assertions

2. **Infrastructure** (next 1-2 hours):
   - Properly separate client vs admin Firebase SDK usage
   - Fix repository Either return types
   - Add proper error boundaries

3. **Final Pass**:
   - Remove `ignoreBuildErrors` from next.config.mjs
   - Run build and deploy
   - Verify 0 TypeScript errors

### Next Actions

1. Continue fixing remaining 241 errors systematically
2. Focus on high-impact files (most errors)
3. Remove ignoreBuildErrors once clean
4. Deploy and verify production build

### Metrics

- **Initial**: 429 TypeScript errors
- **Current**: 241 TypeScript errors
- **Progress**: 44% reduction
- **Target**: 0 errors

---

**Last Updated**: 2025-11-05
**Status**: Active development



