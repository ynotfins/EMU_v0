# 🎨 AVATAR GUIDE - NFA Alerts

**Complete guide for preparing and implementing user avatars**

---

## 📐 **IMAGE SPECIFICATIONS**

### **Recommended Dimensions**
- **Primary**: 512x512px (highest quality)
- **Alternative**: 256x256px (good balance)
- **Minimum**: 128x128px (acceptable)

### **Aspect Ratio**
- **Required**: 1:1 (perfect square)
- Non-square images will be cropped

### **File Format**
- **Preferred**: PNG with transparent background
- **Alternative**: JPG with white/light background
- **Avoid**: GIF, WebP, BMP

### **File Size**
- **Target**: Under 100KB per avatar
- **Maximum**: 200KB per avatar
- **Optimization**: Use TinyPNG or similar tools

---

## 🎯 **DISPLAY SIZES**

Avatars are displayed at different sizes throughout the app:

| Location | Size (px) | Notes |
|----------|-----------|-------|
| Profile Header | 80x80 (mobile)<br>96x96 (desktop) | Large, high visibility |
| Chat Contacts | 40x40 | Small, must be recognizable |
| Team Directory | 64x64 | Medium, list view |
| Incident Cards | 48x48 | Medium, inline display |
| Avatar Picker | 96x96 | Preview size |
| Bottom Nav | 32x32 | Tiny, icon-sized |

**Design Principle**: Avatars should be clear and recognizable even at 32x32px!

---

## 🎨 **DESIGN GUIDELINES**

### **Visual Style**
- ✅ High contrast colors
- ✅ Clear, bold shapes
- ✅ Centered subject
- ✅ Simple, iconic designs
- ✅ Consistent style across collection
- ❌ Fine details (won't show at small sizes)
- ❌ Busy backgrounds
- ❌ Low contrast text

### **Color Palette**
Suggested colors that match NFA Alerts theme:

**Primary Colors:**
- Blue: `#007AFF` (brand blue)
- Red: `#FF3B30` (alert red)
- Orange: `#FF9500` (warning orange)
- Green: `#34C759` (success green)

**Accent Colors:**
- Indigo: `#5856D6`
- Purple: `#AF52DE`
- Teal: `#5AC8FA`
- Yellow: `#FFCC00`

---

## 🧑‍🚒 **FIREFIGHTER AVATAR THEMES**

### **1. Cartoon Characters** 🧑‍🚒
- Diverse firefighter characters
- Different ethnicities and genders
- Various expressions (smiling, serious, determined)
- Different poses (thumbs up, saluting, waving)

**Naming Examples:**
- `hero-male-1.png`
- `hero-female-2.png`
- `hero-action-3.png`
- `rookie-1.png`
- `veteran-1.png`

### **2. Fire Equipment** 🚒
- Fire truck (side view, front view)
- Firefighter helmet (various styles)
- Fire axe (Halligan bar, pulaski)
- Fire hydrant
- Hose nozzle
- Ladder
- Fire extinguisher

**Naming Examples:**
- `truck-engine.png`
- `helmet-red.png`
- `axe-halligan.png`
- `hydrant-yellow.png`

### **3. Badges & Emblems** 🎖️
- Fire department badges
- Maltese cross (various colors)
- Fire chief stars
- Unit numbers (Engine 1, Ladder 5, etc.)
- Rank insignias

**Naming Examples:**
- `badge-maltese-red.png`
- `badge-star-gold.png`
- `badge-unit-engine1.png`
- `badge-cross-silver.png`

### **4. Mascots** 🐶
- Dalmatian dog
- Fire phoenix
- Cartoon flame (friendly, not scary)
- Fire safety bear
- Hydrant mascot

**Naming Examples:**
- `dalmatian-spot.png`
- `phoenix-rising.png`
- `flame-friendly.png`
- `sparky-mascot.png`

### **5. Action Poses** 💪
- Firefighter rescuing (silhouette)
- Team huddle
- Victory pose (fist pump)
- Running with hose
- Climbing ladder

**Naming Examples:**
- `action-rescue.png`
- `action-victory.png`
- `action-teamwork.png`
- `action-hero.png`

---

## 📁 **FILE ORGANIZATION**

```
public/avatars/
├── cartoon/
│   ├── hero-male-1.png
│   ├── hero-female-1.png
│   ├── rookie-1.png
│   └── veteran-1.png
├── equipment/
│   ├── helmet-red.png
│   ├── truck-engine.png
│   ├── axe-halligan.png
│   └── hydrant-yellow.png
├── badges/
│   ├── maltese-red.png
│   ├── star-gold.png
│   └── cross-silver.png
├── mascots/
│   ├── dalmatian.png
│   ├── phoenix.png
│   └── flame-friendly.png
└── action/
    ├── rescue.png
    ├── victory.png
    └── teamwork.png
```

---

## 🔧 **PREPARATION CHECKLIST**

For each avatar image:

- [ ] Resize to 512x512px
- [ ] Ensure 1:1 aspect ratio (perfect square)
- [ ] Save as PNG with transparent background
- [ ] Optimize file size (under 100KB)
- [ ] Test visibility at 32x32px
- [ ] Check contrast and clarity
- [ ] Verify filename follows naming convention
- [ ] Place in correct category folder

---

## 🛠️ **RECOMMENDED TOOLS**

### **Image Editing**
- **Photoshop/Illustrator** (professional)
- **Figma** (free, browser-based)
- **GIMP** (free, desktop)
- **Canva** (free, easy-to-use)

### **Image Optimization**
- **TinyPNG** (https://tinypng.com)
- **ImageOptim** (Mac)
- **Squoosh** (https://squoosh.app)

### **AI Generation** (if creating from scratch)
- **Midjourney** (high quality)
- **DALL-E 3** (via ChatGPT)
- **Stable Diffusion** (open source)

**Prompt Example for AI:**
```
"Simple, flat design icon of a cartoon firefighter character, 
firefighter helmet, red uniform, friendly expression, 
white or transparent background, 512x512, 
suitable for profile picture, high contrast colors"
```

---

## 📊 **IMPLEMENTATION**

### **Step 1: Prepare Images**
1. Collect/create 20-30 avatar options
2. Resize all to 512x512px
3. Optimize file sizes
4. Organize into category folders
5. Name files consistently

### **Step 2: Update Code**
Update `components/avatar-picker.tsx`:
```typescript
export const FIREFIGHTER_AVATARS = [
  { id: "ff-hero-1", name: "Hero", category: "cartoon", path: "/avatars/cartoon/hero-male-1.png" },
  { id: "ff-truck", name: "Fire Truck", category: "equipment", path: "/avatars/equipment/truck-engine.png" },
  // ... add all avatars
];
```

### **Step 3: Test Display**
- Test at all size breakpoints (mobile, tablet, desktop)
- Verify visibility at smallest size (32x32px)
- Check loading performance
- Test avatar picker UI

---

## 🎯 **QUALITY CHECKLIST**

For the complete avatar collection:

- [ ] At least 20 unique avatars
- [ ] Covers all 5 categories
- [ ] Diverse representation (gender, ethnicity)
- [ ] Consistent visual style
- [ ] All images optimized
- [ ] Clear at 32x32px
- [ ] Loads quickly
- [ ] Matches app theme
- [ ] Fun and engaging
- [ ] Professional quality

---

## 📝 **NOTES**

### **Current Status**
- Avatar picker component created ✅
- File structure defined ✅
- Waiting for formatted avatars ⏳

### **Next Steps**
1. User sends formatted avatar images
2. Images placed in `/public/avatars/` folders
3. Update `FIREFIGHTER_AVATARS` array with actual paths
4. Test avatar picker functionality
5. Integrate into profile page

---

**Ready to add avatars!** Send the formatted images when ready, and I'll integrate them immediately.

