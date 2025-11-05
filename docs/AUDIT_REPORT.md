# Repository Audit & Refactor Report
## Live Fire Incident App - Full Audit

**Date**: 2025-01-XX
**Scope**: Complete codebase audit and refactor
**Priority**: Field-critical application - security and efficiency paramount

---

## PHASE 1: DELETION & PRUNING

### 1.1 Unused Routes & Folders

#### ❌ **DELETE - Empty/Unused Route Folders:**
```
src/app/app/ (entire folder - empty, no pages)
├── (authed)/ (empty)
├── (protected)/ (empty)
└── All subfolders are empty

src/app/docs/ (empty folder)
```

#### ⚠️ **REVIEW - Test Page:**
```
src/app/test-clean-arch/page.tsx
- Test page for Clean Architecture validation
- Not linked from anywhere
- **Decision**: Keep for now (may be useful for testing), but remove before production
```

### 1.2 Duplicate Firebase Config Files

#### ❌ **DELETE - Old Firebase Configs (Superseded by src/lib/):**
```
src/infrastructure/firebase/config/firebase-client.config.ts
- Duplicate of src/lib/firebase-client.ts
- Old exports: clientAuth, clientDb, clientStorage, clientRealtimeDb, clientMessaging
- **Status**: Check if any files import from this before deleting

src/infrastructure/firebase/config/firebase-admin.config.ts
- Duplicate of src/lib/firebase-admin.ts
- Old exports: adminAuth, adminDb, adminStorage, adminRealtimeDb, adminMessaging
- **Status**: Check if any files import from this before deleting
```

### 1.3 Unused Exports (To Verify)

**Files with potential unused exports** (need to verify usage):
- `src/presentation/hooks/index.ts` - re-exports
- `src/core/application/index.ts` - re-exports
- `src/core/domain/repositories/index.ts` - re-exports
- `src/presentation/actions/incidents/index.ts` - re-exports
- `src/presentation/actions/auth/index.ts` - re-exports

### 1.4 Commented Code Blocks

**Files with commented code** (need cleanup):
- 26 files found with commented code patterns
- Need to review each file individually

### 1.5 Unused Media Assets

**Public assets to review:**
```
public/placeholder-logo.png
public/placeholder-logo.svg
public/placeholder-user.jpg
public/placeholder.jpg
public/placeholder.svg
```
**Status**: Verify if these are actually used before deletion

---

## PHASE 2: SECURITY SCAN

### 🔴 **CRITICAL - Firebase Admin SDK in Client Components**

**Files checked** - All `firebase-admin` imports are in Server Components/Server Actions ✅
- No firebase-admin found in client components
- All admin SDK usage is in:
  - Server Actions (`src/lib/actions/`)
  - API Routes (`src/app/api/`)
  - Infrastructure layer (`src/infrastructure/`)
  - Firebase Functions (`functions/`)

### ⚠️ **Listener Cleanup Audit**

**Files with onSnapshot/onValue listeners** (20 files found):
- Need to verify each has proper cleanup in useEffect return

### ⚠️ **Query Efficiency Audit**

**Files with onSnapshot without .limit()** (need to check):
- Need to review each listener for limit clauses

---

## PHASE 3: TYPE SAFETY

### 🔴 **Any Types Found**

**42 files with `any` types** - Need to replace with proper types from:
- `src/types/extended-domain.d.ts`
- `src/types/domain.d.ts`
- `src/core/domain/entities/`

---

## PHASE 4: COMPONENT REFACTORING OPPORTUNITIES

### Large Client Components (Need Analysis)
- `src/app/supe/incident/[id]/page.client.tsx` (292 lines)
- `src/app/chaser/incident/[id]/page.client.tsx` (389 lines)
- `src/components/features/google-map-live.tsx`
- `src/components/features/homeowner-form.tsx`
- `src/components/features/incident-chat.tsx`

### useEffect Fetching (Potential Server Component Conversion)
- Need to scan for useEffect hooks doing one-time fetches

---

## NEXT STEPS

1. ✅ Verify imports of old Firebase configs → Delete if unused
2. ✅ Delete empty route folders
3. ✅ Review test-clean-arch page → Delete or keep
4. ✅ Scan for commented code → Remove
5. ✅ Review listener cleanup → Fix missing cleanup
6. ✅ Review onSnapshot limits → Add limits where needed
7. ✅ Replace `any` types → Use proper types
8. ✅ Format all files → Apply Prettier
9. ✅ Organize imports → Sort and group
10. ✅ Split large Client Components → Extract logic to hooks

