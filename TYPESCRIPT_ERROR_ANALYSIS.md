# 🔍 TypeScript Error Analysis

## Summary: 284 Errors Found

### Error Categories

#### 1. Branded Types Issues (30+ errors) 🔴
- `Property '_userIdBrand' is missing in type 'Id' but required in type 'UserId'`
- Need to use proper factory methods instead of generic `Id.create()`

#### 2. Firebase Import Issues (50+ errors) 🔴
- Missing imports: `query`, `where`, `collection`, `getDocs`, etc.
- Using Admin SDK incorrectly in client repositories

#### 3. Missing Type Definitions (40+ errors) 🟡
- `FileMeta`, `Profile`, `Thread` not exported from domain
- `IncidentLite` vs `Incident` confusion
- Missing properties on DTOs

#### 4. Decorator Metadata Issues (20+ errors) 🟡
- Need to use `import type` for decorator parameters
- Related to `isolatedModules` and `emitDecoratorMetadata`

#### 5. Module Not Found (10+ errors) 🟡
- Old modules: `../lib/firebase`, `../lib/diagnostics`
- Need to remove or update imports

#### 6. Route Type Safety (15+ errors) 🟡
- Next.js typed routes expecting `RouteImpl<string>`
- Need to cast or fix route strings

#### 7. Duplicate Exports (5+ errors) 🟡
- `Pagination` exported from multiple places
- `IncidentLite` defined in multiple places

---

## Fix Priority

### 🔴 Critical (Fix First)
1. **Branded Types** - Core architecture issue
2. **Firebase Imports** - Blocking all repositories

### 🟡 High Priority
3. **Missing Types** - Add to domain.d.ts temporarily
4. **Decorator Issues** - Update imports to use `import type`

### 🟢 Medium Priority
5. **Route Safety** - Cast routes or disable typed routes
6. **Module Cleanup** - Remove old imports
7. **Duplicate Exports** - Consolidate exports
