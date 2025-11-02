# EMU Alerts - Uniform Layout System

## ✅ Layout System Status

**Status**: All pages now use uniform layout patterns with fixed headers and footers.

## Core Layout Pattern

### Standard Page Structure

```tsx
<RoleLayout role="chaser">
  <div className="flex flex-col h-screen">
    {/* Header - Fixed at top */}
    <div className="fixed top-0 left-0 right-0 z-20">...</div>
    
    {/* Spacer for fixed header */}
    <div className="h-12"></div> {/* or h-14, h-16 based on header height */}
    
    {/* Content - Scrollable */}
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Content */}
    </div>
  </div>
</RoleLayout>
```

### Tabs Page Structure (Favorites, Incident Details)

```tsx
<RoleLayout role="chaser">
  <div className="flex flex-col h-screen">
    {/* Header - Fixed at top */}
    <div className="fixed top-0 left-0 right-0 z-20">...</div>
    
    {/* Spacer for fixed header */}
    <div className="h-16"></div>
    
    {/* Tabs */}
    <Tabs className="flex-1 flex flex-col overflow-hidden">
      <TabsList className="fixed top-16 left-0 right-0 z-10">...</TabsList>
      
      <TabsContent className="flex-1 overflow-y-auto pt-12 pb-20 min-h-0">
        {/* Content */}
      </TabsContent>
    </Tabs>
  </div>
</RoleLayout>
```

## RoleLayout Component

```tsx
<div className="min-h-screen bg-[#F2F2F7] pb-16">
  {children}
  <BottomNav role={navRole} />
</div>
```

- `pb-16` (64px): Padding for fixed footer clearance
- `min-h-screen`: Ensures minimum viewport height

## Bottom Navigation (Footer)

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] safe-area-inset-bottom z-50">
  <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
    {/* Navigation items */}
  </div>
</nav>
```

- Position: `fixed bottom-0 left-0 right-0 z-50`
- Height: `h-16` (64px)
- Z-index: `z-50` (highest)

## Content Padding Standards

### All Scrollable Content Areas

**Must have:** `pb-20` (80px) for footer clearance

**Why:** 
- Footer is `h-16` (64px)
- RoleLayout has `pb-16` (64px)
- Extra `pb-20` ensures content scrolls above footer

### Pages with Fixed Tabs

**TabsContent must have:**
- `pt-12` (48px): Padding for fixed tabs bar
- `pb-20` (80px): Padding for footer
- `min-h-0`: Critical for flex items to shrink properly

## Header Heights

| Page Type | Header Height | Spacer Height | Tabs Height |
|-----------|--------------|---------------|-------------|
| Incidents | ~48px (h-12) | `h-12` | N/A |
| Favorites | ~64px (h-16) | `h-16` | `h-12` (48px) |
| Chat | ~64px (h-16) | `h-16` | N/A |
| Incident Details | ~56px (h-14) | `h-14` | `h-12` (48px) |
| Profile | Not fixed | N/A | N/A |

## Fixed Elements Z-Index Hierarchy

| Element | Z-Index | Purpose |
|---------|---------|---------|
| Bottom Nav (Footer) | `z-50` | Highest - Always visible |
| Headers | `z-20` | Secondary - Below footer |
| Tabs Bars | `z-10` | Lowest fixed - Below headers |

## Critical CSS Classes

### Required for Flex Layouts with Fixed Elements

1. **Outer Container**: `flex flex-col h-screen`
   - Creates flex column layout
   - Sets exact viewport height

2. **Tabs Container**: `flex-1 flex flex-col overflow-hidden`
   - `flex-1`: Fills available space
   - `overflow-hidden`: Prevents container scroll

3. **Content Container**: `flex-1 overflow-y-auto pb-20`
   - `flex-1`: Fills available space
   - `overflow-y-auto`: Creates scrollable area
   - `pb-20`: Footer clearance

4. **TabsContent**: `flex-1 overflow-y-auto pt-12 pb-20 min-h-0`
   - `min-h-0`: **CRITICAL** - Allows flex item to shrink below content size
   - Without this, flex items can overflow containers

## Page-Specific Implementations

### ✅ Working Pages

1. **Incidents Page** (`app/chaser/incidents/page.tsx`)
   - Header: `fixed top-0 z-20`
   - Spacer: `h-12`
   - Content: `flex-1 overflow-y-auto pb-20`

2. **Chat Page** (`app/chaser/chat/page.tsx`)
   - Header: `fixed top-0 z-20`
   - Spacer: `h-16` or `h-14`
   - Content: `flex-1 overflow-y-auto pb-20`
   - Input: `fixed bottom-16 z-10`

3. **Profile Page** (`app/chaser/profile/page.tsx`)
   - Header: NOT fixed (scrolls with content)
   - Container: `min-h-screen` (not `h-screen`)
   - Content: Natural scroll

### ✅ Fixed Pages

4. **Favorites Page** (`app/chaser/favorites/page.tsx`)
   - Header: `fixed top-0 z-20`
   - Spacer: `h-16`
   - Tabs: `flex-1 flex flex-col overflow-hidden`
   - TabsList: `fixed top-16 z-10`
   - TabsContent: `flex-1 overflow-y-auto pt-12 pb-20 min-h-0`

5. **Incident Details Page** (`app/chaser/incident/[id]/page.client.tsx`)
   - Header: `fixed top-0 z-20`
   - Spacer: `h-14`
   - Tabs: `flex-1 flex flex-col overflow-hidden`
   - TabsList: `fixed top-14 z-10`
   - Content wrapper: `flex-1 overflow-y-auto pb-20 pt-14`

## Common Issues & Solutions

### Issue: Footer Not Fixed

**Symptoms:** Footer scrolls with content or content overlaps footer

**Solutions:**
- Ensure RoleLayout has `pb-16`
- Ensure content has `pb-20`
- Verify footer has `fixed bottom-0 z-50`

### Issue: Content Hidden Behind Fixed Header/Tabs

**Symptoms:** Content starts under fixed elements

**Solutions:**
- Add spacer `div` after fixed header
- Add `pt-12` or `pt-14` to content for fixed tabs
- Verify z-index hierarchy

### Issue: TabsContent Not Scrolling

**Symptoms:** Content overflow instead of scrolling

**Solutions:**
- Add `overflow-hidden` to Tabs container
- Add `min-h-0` to TabsContent
- Verify `flex-1` on both Tabs and TabsContent

### Issue: Layout Broken on Desktop

**Symptoms:** Works on mobile but broken on desktop

**Solutions:**
- Ensure `h-screen` (not `min-h-screen`) on outer container
- Verify fixed elements use viewport-relative positioning
- Check for conflicting CSS

## Testing Checklist

Before committing any layout changes:

- [ ] Footer is fixed at bottom (`fixed bottom-0 z-50`)
- [ ] Content scrolls above footer (has `pb-20`)
- [ ] Fixed headers don't overlap content (spacer div present)
- [ ] Fixed tabs don't overlap content (`pt-12` or `pt-14` present)
- [ ] All pages use consistent pattern
- [ ] Works on mobile (viewport height)
- [ ] Works on desktop (viewport height)
- [ ] No content hidden behind fixed elements

## Migration Notes

When adding new pages:

1. Use `RoleLayout` wrapper
2. Use `flex flex-col h-screen` on outer div
3. Fixed headers: `fixed top-0 z-20`
4. Add spacer div matching header height
5. Content: `flex-1 overflow-y-auto pb-20`
6. For tabs: Add `overflow-hidden` to Tabs, `min-h-0` to TabsContent

