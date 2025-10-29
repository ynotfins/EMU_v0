# EMU Alerts - Firebase Integration Log

## Overview
This document tracks all Firebase integration work, including wiring, extensions, and rule deployments.

---

## Integration Timeline

### Phase 1: Bootstrap (Pending)
**Date**: TBD  
**Author**: TBD  
**Status**: Not Started

**Files Created**:
- `lib/firebase.ts` - Firebase SDK initialization
- `lib/fcm.ts` - Firebase Cloud Messaging helpers
- `public/firebase-messaging-sw.js` - Service worker for background notifications

**Environment Variables Added**:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID_WEB`
- `NEXT_PUBLIC_FCM_VAPID_KEY`

---

### Phase 2: Hooks Conversion (Pending)
**Date**: TBD  
**Author**: TBD  
**Status**: Not Started

**Files Modified**:
- `hooks/use-incidents.ts` - Removed mock data, added Firestore TODOs
- `hooks/use-incident.ts` - Removed mock data, added Firestore TODOs
- `hooks/use-files.ts` - Removed mock data, added Storage TODOs
- `hooks/use-threads.ts` - Removed mock data, added Firestore TODOs
- `hooks/use-messages.ts` - Removed mock data, added Firestore TODOs
- `hooks/use-profile.ts` - Removed mock data, added Firestore TODOs
- `hooks/use-live-locations.ts` - Removed mock data, added Firestore TODOs

**Changes**:
- All mock imports removed
- Firebase imports added (commented out until wiring)
- Action stubs converted to console.debug with proper params
- TODO comments added for Firestore queries

---

### Phase 3: Firestore Wiring (Pending)
**Date**: TBD  
**Author**: TBD  
**Status**: Not Started

**Collections to Wire**:
- [ ] `incidents` - Main incident collection
- [ ] `incidents/{id}/files` - File subcollection
- [ ] `incidents/{id}/homeowner_forms` - Homeowner form subcollection
- [ ] `threads` - Chat threads
- [ ] `threads/{id}/messages` - Message subcollection
- [ ] `user_profiles` - User profiles
- [ ] `live_locations` - Real-time location tracking
- [ ] `esign_packets` - E-signature workflow
- [ ] `alerts` - System-wide alerts

**Real-time Listeners**:
- [ ] Incidents list (onSnapshot)
- [ ] Incident details (onSnapshot)
- [ ] Chat messages (onSnapshot)
- [ ] Live locations (onSnapshot)

---

### Phase 4: Firebase Extensions (Pending)
**Date**: TBD  
**Author**: TBD  
**Status**: Not Started

**Extensions Installed**:
- [ ] Incident Number Counter (auto-increment)
- [ ] Geocoding (address → lat/lng)
- [ ] Image Resize (thumbnails)
- [ ] FCM Notifications (trigger on events)

**Configuration**: See `docs/EXTENSIONS.md`

---

### Phase 5: Security Rules (Pending)
**Date**: TBD  
**Author**: TBD  
**Status**: Not Started

**Rules Deployed**:
- [ ] Firestore security rules (see `docs/WIRING.md`)
- [ ] Storage security rules

**Version**: TBD  
**Link**: TBD

---

## Known Issues

### Issue #1: Mock Data Still Present
**Status**: Resolved  
**Date**: TBD  
**Description**: All mock data imports have been removed from hooks. Hooks now return empty arrays/null until Firestore is wired.

---

## Next Steps

1. **Set up Firebase project** in Firebase Console
2. **Enable services**: Auth, Firestore, Storage, FCM
3. **Add environment variables** to Vercel project
4. **Wire Firestore queries** in all hooks (replace TODOs)
5. **Implement real-time listeners** for live updates
6. **Configure Firebase Extensions** per EXTENSIONS.md
7. **Deploy security rules** per WIRING.md
8. **Test end-to-end** with real data
9. **Deploy to production**

---

## Contact

For questions about Firebase integration, contact the development team.
