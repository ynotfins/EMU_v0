# EMU Alerts - Color Management System

## ✅ Color System Status

**Status**: Color system exists but is NOT being used consistently across the codebase.

## Current State

### ✅ What Exists

1. **Color Constants** (`lib/colors.ts`)
   - Defines `COLORS` object with all standard colors
   - Defines `COLOR_CLASSES` object with Tailwind class names
   - Includes usage examples

2. **Color Standards Documentation** (`docs/COLOR_STANDARDS.md`)
   - Comprehensive guide to color usage
   - Component-specific color rules
   - Testing checklist

3. **CSS Variables** (`app/globals.css`)
   - Defines `--emu-blue`, `--emu-red`, `--emu-green`, etc.
   - Not currently used throughout codebase

### ❌ Current Problem

**Hardcoded colors everywhere**: The codebase has 200+ instances of hardcoded color values like:
- `#007AFF` (blue)
- `#FF3B30` (red)
- `#34C759` (green)
- `#6B7280` (gray)
- `#E5E7EB` (border gray)
- `#F2F2F7` (background gray)

**These should be replaced with:**
- `COLORS.PRIMARY_BLUE` or `COLOR_CLASSES.bgPrimaryBlue`
- `COLORS.ALERT_RED` or `COLOR_CLASSES.bgAlertRed`
- etc.

## Standard Color Palette

### Primary Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|---------------|
| Primary Blue | `#007AFF` | Buttons, links, active states | `bg-[#007AFF]` |
| Primary Blue Hover | `#0051D5` | Blue hover state | `hover:bg-[#0051D5]` |
| Alert Red | `#FF3B30` | Alerts, errors, favorites | `bg-[#FF3B30]` |
| Alert Red Hover | `#FF2D1F` | Red hover state | `hover:bg-[#FF2D1F]` |
| Success Green | `#34C759` | Success, enabled states | `bg-[#34C759]` |
| Success Green Hover | `#2FB04D` | Green hover state | `hover:bg-[#2FB04D]` |
| Warning Orange | `#FF9500` | Toggle switches (ON) | `bg-[#FF9500]` |

### Neutral Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|---------------|
| Gray Dark | `#1C1C1E` | Primary text | `text-[#1C1C1E]` |
| Gray Medium | `#6B7280` | Secondary text | `text-[#6B7280]` |
| Gray Light | `#E5E7EB` | Borders, dividers | `border-[#E5E7EB]` |
| Gray Background | `#F9FAFB` | Page backgrounds | `bg-[#F9FAFB]` |
| Background Secondary | `#F2F2F7` | Card backgrounds | `bg-[#F2F2F7]` |

## Implementation Strategy

### Phase 1: Use Color Constants (Recommended)

Import from `lib/colors.ts`:

```tsx
import { COLORS, COLOR_CLASSES } from "@/lib/colors";

// In inline styles
<div style={{ backgroundColor: COLORS.PRIMARY_BLUE }}>

// In Tailwind classes
<div className={COLOR_CLASSES.bgPrimaryBlue}>
```

### Phase 2: Replace Hardcoded Colors

**Before:**
```tsx
<Button className="bg-[#007AFF] hover:bg-[#0051D5]">
```

**After:**
```tsx
import { COLOR_CLASSES } from "@/lib/colors";
<Button className={`${COLOR_CLASSES.bgPrimaryBlue} ${COLOR_CLASSES.bgPrimaryBlueHover}`}>
```

## Footer Layout System

### ✅ Footer Implementation

**Bottom Navigation** (`components/bottom-nav.tsx`):
- Position: `fixed bottom-0 left-0 right-0 z-50`
- Height: `h-16` (64px)
- Background: `bg-white`
- Border: `border-t border-[#E5E7EB]`

**RoleLayout** (`components/role-layout.tsx`):
- Padding bottom: `pb-16` (64px) to account for fixed footer

### ✅ Content Padding Standards

**All scrollable content areas must have:**
- `pb-20` (80px) - Extra padding for footer clearance
- Exception: RoleLayout already has `pb-16`, so content inside only needs `pb-20` total

**Fixed Elements:**
- Headers: `fixed top-0 z-20`
- Tabs bars: `fixed top-16 z-10` (below header)
- Footer: `fixed bottom-0 z-50`

### ✅ Layout Structure Pattern

```tsx
<RoleLayout role="chaser">
  <div className="flex flex-col h-screen">
    {/* Header - Fixed */}
    <div className="fixed top-0 left-0 right-0 z-20">...</div>
    
    {/* Spacer for fixed header */}
    <div className="h-16"></div>
    
    {/* Content - Scrollable */}
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Content */}
    </div>
  </div>
</RoleLayout>
```

## Consistency Checklist

### Footer
- [x] Bottom nav is `fixed bottom-0 z-50`
- [x] RoleLayout has `pb-16` 
- [x] All content areas have `pb-20`
- [x] Headers are `fixed top-0 z-20`
- [x] Proper spacers for fixed headers

### Colors
- [ ] All colors use `COLORS` or `COLOR_CLASSES` constants
- [ ] No hardcoded hex values
- [ ] Colors consistent across all pages
- [ ] Hover states use correct variants

## Next Steps

1. **Create migration script** to replace hardcoded colors with constants
2. **Add ESLint rule** to prevent hardcoded colors
3. **Update all components** to use color constants
4. **Document color usage** in component files

