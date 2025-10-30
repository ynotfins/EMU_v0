# 🚨 URGENT FIXES NEEDED

## ❌ BROKEN ITEMS:

### 1. Email/Password Sign-In Not Working on PC
**User Report**: Google works, email/password doesn't
**Need**: Browser console error message to diagnose
**Possible causes**:
- Wrong Firebase env var (`NEXT_PUBLIC_FIREBASE_APP_ID_WEB` vs `NEXT_PUBLIC_FIREBASE_APP_ID`)
- Firebase Auth not initialized correctly
- Email/password auth not enabled in Firebase Console

**ACTION**: Need user to check browser console for exact error

### 2. Location Permission Asked Every Time
**Current**: Browser requests permission on every load
**Need**: Save permission status to localStorage, never ask again after first approval
**Fix**: Add permission status cache

### 3. Red Color Still Wrong
**User says**: Red still doesn't match
**Check**: Need to verify all components using red

### 4. High Alert Button - Hardware Control Impossible
**User wants**: Change ringer, boost volume, flash flashlight
**Reality**: Web browsers CANNOT control:
- Phone ringer/volume (OS restriction)
- Flashlight (no standard API)

**CAN DO**:
- Play loud train horn sound
- Vibrate phone
- Flash screen red/white
- Show fullscreen alert

**DECISION NEEDED**: Implement browser version OR build native apps?

---

## ✅ TONIGHT'S PRIORITIES:

1. **Live Chat** (Firebase Realtime Database) - 1-2 hours
2. **CRM + Geocoding Storage** (Firestore) - 1 hour
3. **Quick UI fixes** (search, filters) - 30 min

---

## 🎯 USER LOCATION STRATEGY:

**Google's Location Services**:
- YES, Google constantly pings devices with location on
- BUT we can't access Google's pings directly
- We CAN use browser's Geolocation API which:
  - Uses hardware GPS
  - Updates when device moves
  - Battery-efficient (hardware handles it)

**Our 30-min strategy**:
```javascript
// Pseudo-code
setInterval(() => {
  if (hasMovementDetected() || isStale()) {
    getCurrentPosition();
    saveToCache();
  }
}, 30 * 60 * 1000); // 30 minutes
```

**Movement detection**: Browser's watchPosition() handles this automatically!

---

## 📋 IMPLEMENTATION ORDER:

1. ✅ Check email/password error (need user input)
2. ✅ Fix location permission caching
3. ✅ Verify red color consistency
4. 🚀 Build live chat (START NOW)
5. 🚀 Build CRM structure (WITH geocoding)
6. ✅ UI tweaks (search, filters)

