# EMU Alerts - Color Standards

## 🎨 Standard Color Palette

**ALL colors across the entire application MUST use these standard colors.**

This document defines the official EMU Alerts color palette and usage guidelines.

---

## Core Colors

### Primary Blue
- **Color**: `#007AFF`
- **Hover**: `#0051D5`
- **Usage**: 
  - Primary buttons
  - Links
  - Active navigation items
  - Brand elements
  - Default "Online" badges

```tsx
// Example usage
<Button className="bg-[#007AFF] hover:bg-[#0051D5] text-white">
  Primary Action
</Button>
```

---

### Alert Red
- **Color**: `#FF3B30`
- **Hover**: `#FF2D1F`
- **Usage**:
  - Hearts (favorites)
  - Emergency buttons
  - Destructive actions (delete, sign out)
  - Critical alerts
  - Error states
  - Denied/disabled location banners

```tsx
// Example usage
<Button className="bg-[#FF3B30] hover:bg-[#FF2D1F] text-white">
  Emergency Call
</Button>

<Heart className="fill-[#FF3B30] text-[#FF3B30]" />
```

---

### Success Green
- **Color**: `#34C759`
- **Hover**: `#2FB04D`
- **Usage**:
  - Success messages
  - Confirmation buttons
  - "Enabled" location banners
  - Positive status indicators

```tsx
// Example usage
<Badge className="bg-[#34C759] text-white">
  Success
</Badge>
```

---

### Warning Orange
- **Color**: `#FF9500`
- **Hover**: `#FF8800`
- **Usage**:
  - Toggle switches (ON state) in Preferences
  - Warning messages
  - Important notifications
  - Pending states

```tsx
// Example usage
<Switch className="data-[state=checked]:bg-[#FF9500]" />
```

---

### Neutral Grays
- **Dark**: `#1C1C1E` - Primary text
- **Medium**: `#6B7280` - Secondary text, inactive icons
- **Light**: `#E5E7EB` - Borders, dividers
- **Background**: `#F9FAFB` - Page backgrounds

```tsx
// Example usage
<div className="border-[#E5E7EB] text-[#6B7280] bg-[#F9FAFB]">
  Content
</div>
```

---

## Component-Specific Colors

### Bottom Navigation
- **Inactive**: `#6B7280` (gray)
- **Active**: `#007AFF` (blue)
- **Favorites Heart (Active)**: `fill-[#FF3B30] text-[#FF3B30]` (red)

### Profile Page
- **Toggle Switches**: `#FF9500` (orange) when ON
- **Sign Out Button**: `bg-[#FF3B30] hover:bg-[#FF2D1F]` (red)

### Chat Page
- **Emergency Buttons**: `bg-[#FF3B30] hover:bg-[#FF2D1F]` (red)
- **Online Badge**: `#34C759` (green)

### Favorites Page
- **Empty Heart Icon**: `text-[#FF3B30]` (red, filled)

### Location Permission Banners
- **Denied/Disabled**: `bg-[#FF3B30]` (red)
- **Enabled**: `bg-[#34C759]` (green)

---

## Implementation

### Method 1: Using Color Constants (Recommended)

Import from `lib/colors.ts`:

```tsx
import { COLORS, COLOR_CLASSES } from "@/lib/colors";

// In inline styles
<div style={{ backgroundColor: COLORS.ALERT_RED }}>

// In Tailwind classes
<div className={COLOR_CLASSES.bgAlertRed}>
```

### Method 2: Direct Tailwind Classes

```tsx
<div className="bg-[#FF3B30] hover:bg-[#FF2D1F]">
```

---

## ⚠️ Critical Rules

1. **NEVER hardcode colors outside of `lib/colors.ts`**
2. **ALL reds must be `#FF3B30` (hover: `#FF2D1F`)**
3. **ALL greens must be `#34C759` (hover: `#2FB04D`)**
4. **ALL oranges must be `#FF9500` (hover: `#FF8800`)**
5. **ALL blues must be `#007AFF` (hover: `#0051D5`)**
6. **When in doubt, refer to this document**

---

## Testing Checklist

Before any UI changes are committed, verify:

- [ ] All reds match `#FF3B30`
- [ ] All greens match `#34C759`
- [ ] All oranges match `#FF9500`
- [ ] All blues match `#007AFF`
- [ ] No hardcoded colors exist outside `lib/colors.ts`
- [ ] Hover states use correct darker variants
- [ ] Colors are consistent across all pages

---

## Color Reference Quick Guide

| Element | Color | Code |
|---------|-------|------|
| Primary Button | Blue | `#007AFF` |
| Emergency Button | Red | `#FF3B30` |
| Success Badge | Green | `#34C759` |
| Toggle Switch (ON) | Orange | `#FF9500` |
| Heart Icon (Active) | Red | `#FF3B30` |
| Sign Out Button | Red | `#FF3B30` |
| Location Denied | Red | `#FF3B30` |
| Location Enabled | Green | `#34C759` |
| Inactive Nav Item | Gray | `#6B7280` |
| Active Nav Item | Blue | `#007AFF` |
| Border | Light Gray | `#E5E7EB` |

---

## Figma/Design Tool Hex Codes

For designers:
- Primary Blue: `#007AFF`
- Alert Red: `#FF3B30`
- Success Green: `#34C759`
- Warning Orange: `#FF9500`
- Gray Dark: `#1C1C1E`
- Gray Medium: `#6B7280`
- Gray Light: `#E5E7EB`

---

**Last Updated**: October 29, 2025
**Approved By**: Project Lead
**Status**: ✅ Official Standard

