# 🚀 EMU Alerts (National Fire Alerts) - Agent Handoff Prompt

## Project Overview
You are taking over development of **EMU Alerts** (Emergency Management Unit), also known as **National Fire Alerts (NFA)** - a real-time emergency response coordination system for fire chasers, supervisors, and admins. This is a **production application** currently deployed at **https://4axe.com**.

**Current Status**: Production-ready, 0 TypeScript errors, 0 critical linting errors, fully deployed on Vercel with automatic deployments on push to main.

---

## 📋 Quick Start Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run typecheck        # TypeScript validation (must pass)
npm run lint             # ESLint check (0 critical errors)

# Deployment
git push origin main     # Auto-deploys to https://4axe.com via Vercel
```

---

## 🗂️ Critical Documents (Read These First)

### **Primary Handoff Document**
- **`HANDOFF.md`** - Complete project documentation (2,100+ lines)
  - Sections 1-3: Architecture, features, current state
  - Section 4: Firebase schema (Firestore + Realtime DB)
  - Section 9: Known issues & fixes (13 documented issues)
  - Section 10: Development workflow

### **Memory Bank** (`docs/memory-bank/`)
- **`activeContext.md`** - Current work focus, recent changes, next steps
- **`projectbrief.md`** - Product vision, goals, user personas
- **`techContext.md`** - Tech stack, constraints, implementation status
- **`systemPatterns.md`** - Architecture patterns, component relationships
- **`progress.md`** - Detailed task tracking, metrics, what's done vs remaining
- **`productContext.md`** - User experience goals, core workflows

### **Technical References**
- **`docs/WIRING.md`** - Firebase data contracts (Firestore + Realtime DB)
- **`docs/API_MAP.md`** - React hooks → Firebase collections mapping
- **`docs/ROUTES.md`** - Complete route tree with guards
- **`START_HERE.md`** - Quick setup guide

---

## 🏗️ Tech Stack (Current Versions)

**Frontend**:
- Next.js 16.0.0 (App Router)
- React 19.2.0
- TypeScript 5.x (strict mode)
- Tailwind CSS 4.1.9
- shadcn/ui (Radix primitives)

**Backend**:
- Firebase Firestore (real-time listeners, offline persistence)
- Firebase Realtime Database (chat system)
- Firebase Auth (triple-layer persistence)
- Firebase Storage (avatar uploads)
- Firebase Cloud Messaging (push notifications - not yet wired)

**APIs**:
- Google Maps API (geocoding, embed maps)
- Geolocation API (real-time distance calculation)

**Deployment**:
- Vercel (automatic on push to main)
- Custom domain: https://4axe.com

---

## ✅ What's Complete & Working

### Infrastructure
- ✅ Firebase fully integrated (Firestore, Realtime DB, Auth, Storage)
- ✅ Role-based access control (super_admin, admin, supe, chaser)
- ✅ Triple-layer auth persistence (localStorage + sessionStorage + cookies)
- ✅ Offline data persistence (IndexedDB for Firestore)
- ✅ Real-time data sync (onSnapshot, onValue)
- ✅ Vercel deployment with automatic GitHub integration

### Features
- ✅ Multi-step signup with camera ID capture (OCR mocked)
- ✅ God Mode for super admins (toggle views, switch roles)
- ✅ Incident list with real-time updates (4 filter modes)
- ✅ Distance calculation with Haversine formula
- ✅ Live chat system (incident group chats + 1-on-1 direct chats)
- ✅ CRM contractors page (desktop-first design)
- ✅ Avatar system (20% rounded corners, auto-processing)
- ✅ Google Maps integration (city-level zoom on incident details)
- ✅ Location permission persistence (ask once, save forever)

### Code Quality
- ✅ 0 TypeScript errors
- ✅ 0 critical ESLint errors (95 non-critical warnings remain)
- ✅ All React hooks follow official rules
- ✅ Performance optimized (useMemo for derived state)
- ✅ Modern ES6 imports throughout

### Custom Hooks (6/10 Wired)
- ✅ `useIncidents()` - Real-time incident list
- ✅ `useIncident(id)` - Single incident details
- ✅ `useProfile()` - User profile + settings
- ✅ `useLocationDistance()` - Geolocation + distance calc
- ✅ `useResponses(userId)` - User response history
- ✅ `useContractors()` - CRM contractors list
- ⚠️ **Stubbed**: `useThreads()`, `useMessages()`, `useAlerts()`, `useTeamMap()`

---

## ⚠️ What's In Progress / Not Yet Wired

### High Priority
- 🔄 Custom Alert Groups (user-defined filters with notifications)
- 🔄 CRM Database (properties, communications collections)
- 🔄 Firebase Cloud Messaging (push notifications)
- 🔄 Multi-language support (i18n infrastructure)

### Document Management (UI complete, backend not wired)
- 🔄 Homeowner forms → Firebase Storage
- 🔄 Document uploads → Firebase Storage
- 🔄 eSign integration

### Data Quality
- 🔄 Address normalization (inconsistent formats)
- 🔄 Duplicate detection (same address, different format)

---

## 🎯 Development Guidelines

### Code Standards
- **Type-First Development**: All functions must have explicit types
- **Zero TypeScript Errors**: Run `npm run typecheck` before every commit
- **React Best Practices**: Never call hooks conditionally
- **Performance**: Use `useMemo` for derived state, avoid setState in useEffect
- **Error Handling**: Always log errors in catch blocks

### Commit Conventions
Use conventional commits:
```bash
feat: add new feature
fix: resolve bug
refactor: improve code structure
docs: update documentation
chore: maintenance tasks
```

### Testing Before Deploy
1. TypeScript: `npm run typecheck` (must pass)
2. Lint: `npm run lint` (0 errors acceptable, warnings OK)
3. Local: Test on `localhost:3000`
4. Mobile: Test on production (HTTPS required for geolocation)

### Autonomous Mode (YOLO + Full Autonomy)
- ✅ Fix TypeScript/ESLint errors immediately (no permission needed)
- ✅ Refactor code for improvements (document changes)
- ✅ Install dependencies as needed
- ✅ Commit logical chunks automatically
- ⚠️ Ask permission for: data deletion, auth changes, payment logic

---

## 🔥 Known Issues (All Fixed, for Reference)

13 documented issues with fixes in **Section 9** of `HANDOFF.md`:
1. ✅ Admin role naming (admin vs super_admin)
2. ✅ Avatar rendering (20% rounded corners)
3. ✅ Firebase connection reliability (offline persistence)
4. ✅ Incident details page layout (mobile responsiveness)
5. ✅ Location permission prompt (localStorage persistence)
6. ✅ Users getting signed out (triple-layer auth)
7. ✅ Phone distance not showing (HTTPS requirement)
8. ✅ Sort by distance not working (filter order)
9. ✅ Chat unread badge (real-time updates)
10. ✅ Multi-step signup (Apple-style UI)
11. ✅ Duplicate routes (Vercel build error)
12. ✅ TypeScript errors in chat page (profile.uid vs profile.id)
13. ✅ Critical linting errors (React hooks, performance)

---

## 📁 Key File Locations

### Core Application Files
```
app/
├── chaser/          # Chaser role pages (incidents, profile, chat)
├── supe/            # Supervisor pages (incidents, profile, chat, team-map)
├── admin/           # Admin pages (incidents, profile)
├── crm/             # CRM pages (contractors, settings)
├── login/           # Login page
├── signup/          # Multi-step signup (new/, page.tsx)
└── role/            # Role selection page
```

### Hooks & Utilities
```
hooks/
├── use-incidents.ts               # Real-time incident list
├── use-incident.ts                # Single incident details
├── use-profile.ts                 # User profile + settings
├── use-location-distance.ts       # Geolocation + distance
├── use-responses.ts               # User response history
└── use-contractors.ts             # CRM contractors

lib/
├── firebase.ts                    # Firebase initialization
├── firestore.ts                   # Firestore actions
├── realtime-database.ts           # Chat functions
├── auth-persistence.ts            # Triple-layer auth
└── distance-calculator.ts         # Haversine formula
```

### Types
```
types/domain.ts                    # Core interfaces (Profile, Incident, etc.)
```

---

## 🔐 Environment Variables (Already Set in Vercel)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=***
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=emu-incidents.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=emu-incidents
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=emu-incidents.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=542892859092
NEXT_PUBLIC_FIREBASE_APP_ID_WEB=***
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=***
NEXT_PUBLIC_FCM_VAPID_KEY=***
```

**Note**: Check `.env.local` for local development (not committed to git).

---

## 🎬 First Steps as New Agent

1. **Read these documents** (in order):
   - `HANDOFF.md` (sections 1-4, 9-10)
   - `docs/memory-bank/activeContext.md`
   - `docs/memory-bank/progress.md`

2. **Run the application**:
   ```bash
   npm install --legacy-peer-deps
   npm run dev
   ```

3. **Verify current state**:
   ```bash
   npm run typecheck   # Should show: "0 errors"
   npm run lint        # Should show: "0 errors, 95 warnings"
   ```

4. **Test live deployment**:
   - Visit https://4axe.com
   - Test login with existing account
   - Test incident list, filters, distance calculation
   - Test chat system

5. **Ask user for priorities**:
   - "What feature should I work on first?"
   - Check `docs/memory-bank/progress.md` → "What's Left to Build"

---

## 📊 Project Metrics (Current State)

- **Total Files**: 150+ TypeScript/React files
- **Lines of Code**: ~15,000 LOC
- **Components**: 40+ UI components
- **Pages**: 20+ route pages
- **Custom Hooks**: 10 hooks (6 wired, 4 stubbed)
- **Firestore Collections**: 4 collections (incidents, users, responses, independent_contractors)
- **Realtime DB Paths**: 2 paths (incident-chats, direct-chats)
- **Commits**: 200+ commits
- **Last Updated**: November 1, 2025

---

## 🚨 Critical Reminders

1. **Never break TypeScript**: Run `npm run typecheck` before every commit
2. **Firebase is LIVE**: You're working with production data (emu-incidents project)
3. **Auto-Deploy**: Every push to main deploys to https://4axe.com (within 60 seconds)
4. **Triple-Check Auth Changes**: Auth persistence is critical for first responders
5. **Location Permission**: Only ask once per device (localStorage: `emu_location_permission`)
6. **Chat Uses Realtime DB**: Not Firestore (see `lib/realtime-database.ts`)

---

## 💬 Need Help?

- **Firestore Schema**: `docs/WIRING.md` (section: "Firestore Collections")
- **Realtime DB Schema**: `docs/WIRING.md` (section: "Firebase Realtime Database Structure")
- **Hook Contracts**: `docs/API_MAP.md`
- **Route Guards**: `docs/ROUTES.md`
- **Architecture Patterns**: `docs/memory-bank/systemPatterns.md`

---

## ✅ Handoff Checklist

Before continuing development, confirm you understand:
- [ ] The role-based access control system (4 roles)
- [ ] Firebase Firestore vs Realtime Database usage
- [ ] Custom hooks pattern (wired vs stubbed)
- [ ] God Mode functionality for super admins
- [ ] Triple-layer authentication persistence
- [ ] Distance calculation with Haversine formula
- [ ] Chat system architecture (incident groups + direct chats)
- [ ] Vercel deployment workflow (auto on push)

---

**Status**: PRODUCTION-READY ✅  
**Your Mission**: Continue building features, maintain code quality, keep docs updated  
**Good luck!** 🚀

