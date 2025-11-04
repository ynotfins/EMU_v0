# 🏗️ Architecture Consolidation Plan

## Current Problem: Duplicate Everything!

### What We Have (❌ WRONG)
```
/app/chaser/
  - incidents/page.tsx    (Chaser-specific implementation)
  - favorites/page.tsx    (Missing Responses tab)
  - incident/[id]/        (Has all features)
  - chat/
  - profile/

/app/supe/
  - incidents/page.tsx    (Supe-specific, has Live Map button)
  - favorites/page.tsx    (Has Responses tab)
  - incident/[id]/        (Was broken, we "fixed" it)
  - chat/
  - profile/
  - map/                  (Supe-only feature)
```

### What We Should Have (✅ CORRECT)
```
/app/(shared)/
  - incidents/page.tsx    (SHARED by both roles)
  - favorites/page.tsx    (SHARED by both roles)
  - incident/[id]/        (SHARED by both roles)
  - chat/                 (SHARED by both roles)
  - map/                  (SHARED by both roles)
  - profile/              (Role-specific content)
```

## Implementation Plan

### Step 1: Create Shared Pages Directory
```typescript
// src/app/(shared)/incidents/page.tsx
export default function IncidentsPage() {
  const { data: profile } = useProfile();
  const role = profile?.role;
  
  // Same page, role-based features
  return (
    <RoleLayout role={role}>
      {/* Shared incident list */}
      {/* Show Live Map button for both roles */}
    </RoleLayout>
  );
}
```

### Step 2: Update Navigation Routes
```typescript
// src/components/layouts/bottom-nav.tsx
const navItems = [
  {
    label: "Incidents",
    href: "/incidents",  // No role prefix!
  },
  {
    label: "Favorites",
    href: "/favorites",  // No role prefix!
  },
  {
    label: "Chat",
    href: "/chat",       // No role prefix!
  },
  {
    label: profileLabel,
    href: "/profile",   // No role prefix!
  },
];
```

### Step 3: Add Role-Based Features
```typescript
// Inside shared components
const isSupe = role === 'supe' || role === 'admin';
const isChaser = role === 'chaser';

// Features available to both:
- View incidents
- Use favorites
- Chat
- View map
- Take notes

// Supe-only features:
- View team locations on map
- See all responses
- Manage incidents

// Chaser-only features:
- Respond to alert button
- Track personal responses
```

### Step 4: Consolidation Steps

1. **Create new shared pages** in `/app/(shared)/`
2. **Copy best features** from both role versions
3. **Add role checks** for specific features
4. **Update BottomNav** to use shared routes
5. **Delete old pages** in `/app/chaser/` and `/app/supe/`
6. **Test thoroughly** with both roles

## Benefits

1. **Feature Parity**: Both roles get all features
2. **Less Code**: One implementation to maintain
3. **Consistency**: Same UX for common features
4. **Easier Updates**: Change once, works for both

## Quick Wins First

### 1. Add Live Map to Chaser
Just add the Live Map button to chaser incidents page (temporary fix)

### 2. Fix Notes Save
Ensure notes are actually saving to Firestore

### 3. Then Consolidate
Once working, consolidate to shared architecture

## Migration Path

### Phase 1: Feature Parity (Quick)
- Add missing features to each role's pages
- Ensure everything works identically

### Phase 2: Shared Components (Medium)
- Extract common UI into shared components
- Keep separate pages but use shared internals

### Phase 3: Full Consolidation (Best)
- Single page implementation
- Role-based routing and permissions
- Delete all duplicate code
