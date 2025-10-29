# 🚀 Starting a New Chat Session - EMU Alerts

**Date**: 2025-10-28  
**Project**: EMU v0 - Emergency Alert System  
**Status**: ✅ Fully Functional (Development Mode)

---

## 📋 Quick Status Check

Before starting a new chat, verify these are working:

```bash
# 1. Server running?
http://localhost:3000/chaser/incidents

# 2. See live alerts?
Should show BNN feed with real incidents

# 3. Can click alerts?
Should open details page (if index is built)

# 4. Check console
Press F12 → Any errors besides Anonymous Auth warning?
```

---

## 🎯 What to Tell the AI in New Session

Copy and paste this into your new chat:

```
I'm continuing work on EMU v0 emergency alert system.

CURRENT STATE:
- App is running at http://localhost:3000
- Live BNN data flowing from Firestore
- Home page groups alerts by incidentId (shows latest per ID)
- Details page has tabs, map, notes, respond button
- Favorites/bookmarks working
- Security rules COMPLETELY OPEN (dev mode)

WHAT I NEED:
[Describe your specific issue or feature request here]

IMPORTANT CONTEXT:
- Read ALL memory bank files in docs/memory-bank/
- Check docs/memory-bank/activeContext.md for current status
- Check docs/memory-bank/progress.md for what's working
- Live data uses incidentId for grouping, lastSeenAt for sorting
- updatesText field contains bullet-separated updates (split on "•")
```

---

## 📁 Key Files to Reference

When the AI asks "what were we working on?", point them to:

1. **`docs/memory-bank/activeContext.md`** - Current status, recent changes, next steps
2. **`docs/memory-bank/progress.md`** - What works, what doesn't, completion status
3. **`docs/memory-bank/systemPatterns.md`** - Architecture decisions, patterns
4. **`HANDOFF.md`** - Quick reference for current state

---

## 🔧 Current Critical Issues (If Any)

### Issue #1: Firestore Index Not Built
**Symptom**: Details page shows error about index  
**Fix**: 
1. Go to: https://console.firebase.google.com/project/emu-incidents/firestore/indexes
2. Create composite index: `incidentId` (Asc) + `lastSeenAt` (Desc)
3. Wait 5-10 minutes

### Issue #2: Security Rules Wide Open
**Risk**: Anyone can read/write your database  
**Status**: Intentional for development  
**Fix Before Production**: See `firestore.rules` for proper rules

### Issue #3: Anonymous Auth Warning
**Symptom**: Console shows auth error  
**Impact**: None (app works fine)  
**Fix**: Enable Anonymous Auth in Firebase Console

---

## 🎨 Current Architecture

### Data Flow:
```
BNN Feed → Firestore `incidents` collection
  ↓
Each alert = 1 document with incidentId
  ↓
Home page: Groups by incidentId, shows latest per ID
  ↓
Details page: Queries ALL docs with same incidentId
  ↓
Parses updatesText (splits on "•") for individual updates
```

### Key Fields:
- `incidentId`: Groups related alerts (e.g., "1833986")
- `lastSeenAt`: Timestamp for sorting
- `lastType`: Alert type (e.g., "Working Fire")
- `lastMessage`: Latest message
- `updatesText`: All updates as bullet points
- `favoritedBy`: Array of user IDs
- `bookmarkedBy`: Array of user IDs

---

## 🚨 Emergency Commands

If something breaks:

```bash
# Kill all node processes
Get-Process -Name node | Stop-Process -Force

# Remove lock file
Remove-Item -Path ".next\dev\lock" -Force

# Restart dev server
npm run dev

# Check Firebase rules
firebase deploy --only firestore:rules

# View Firestore data
npm run rules:open
```

---

## 📊 What's Working vs What Needs Work

### ✅ Fully Working:
- Live data from BNN feed
- Home page with grouped alerts
- Details page with complete UI
- Favorites/bookmarks persistence
- Silence button (local storage)
- Real-time updates
- Map display (placeholder)
- Notes section
- Respond to Alert button

### ⚠️ Partially Working:
- Google Maps (needs API key for real maps)
- Homeowner/Docs/Sign tabs (placeholders)
- File uploads (UI only, no storage)

### ❌ Not Started:
- Firebase Auth (using DEV_UID)
- Push notifications
- E-signatures
- Live location tracking
- Chat functionality

---

## 🎯 Common Next Tasks

### If working on Details Page:
- File: `app/chaser/incident/[id]/page.client.tsx`
- Hook: `hooks/use-incident.ts`
- Query: Uses `incidentId` to fetch all related docs

### If working on Home Page:
- File: `app/chaser/incidents/page.tsx`
- Hook: `hooks/use-incidents.ts`
- Logic: Groups by `incidentId`, keeps latest `lastSeenAt`

### If working on Data:
- Schema: Check live Firestore console
- Fields: `incidentId`, `lastSeenAt`, `lastType`, `lastMessage`, `updatesText`
- Query: Must have composite index built

---

## 💡 Pro Tips for AI

1. **Always read memory bank first**: `docs/memory-bank/activeContext.md`
2. **Check what's committed**: `git log --oneline -10`
3. **Look at recent changes**: `git diff HEAD~3`
4. **Test locally first**: Don't suggest production deploys
5. **Security rules are open**: Remember this when troubleshooting

---

## 📞 Quick Reference

| What | Where |
|------|-------|
| Dev Server | http://localhost:3000 |
| Firebase Console | https://console.firebase.google.com/project/emu-incidents |
| Firestore Data | https://console.firebase.google.com/project/emu-incidents/firestore |
| GitHub Repo | https://github.com/ynotfins/EMU_v0 |
| Memory Bank | `docs/memory-bank/` |
| Current Branch | `main` |

---

## ✅ Pre-Session Checklist

Before starting new chat:

- [ ] Dev server running?
- [ ] Firestore index built?
- [ ] Memory bank up to date?
- [ ] Git committed and pushed?
- [ ] Know what you want to work on?

---

**Ready to start? Copy the "What to Tell the AI" section above into your new chat!** 🚀

