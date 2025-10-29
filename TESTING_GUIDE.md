# EMU Alerts - Testing Guide

## 🎯 **Ready for Testing!**

Your app is now secure and ready for you and your wife to test. Follow these steps exactly.

---

## 📋 **Step 1: Enable Google Sign-In (5 minutes)**

### In Firebase Console:

1. **Go to**: https://console.firebase.google.com/project/emu-incidents/authentication/providers

2. **Click "Get started"** (if Authentication not initialized)

3. **Click "Google"** in the Sign-in providers list

4. **Toggle "Enable"** to ON

5. **Project support email**: Enter your email (required)

6. **Click "Save"**

✅ **Done!** Google Sign-In is now enabled.

---

## 📋 **Step 2: Initialize Firebase Storage (2 minutes)**

### In Firebase Console:

1. **Go to**: https://console.firebase.google.com/project/emu-incidents/storage

2. **Click "Get Started"**

3. **Choose "Start in production mode"** (our rules are already secure)

4. **Select location**: `us-east4 (Northern Virginia)` (match your Firestore)

5. **Click "Done"**

### Deploy Storage Rules:

```bash
cd D:\github\EMU_v0
firebase deploy --only storage
```

✅ **Done!** Storage is now initialized and secured.

---

## 📋 **Step 3: Start the Dev Server**

```bash
cd D:\github\EMU_v0
npm run dev
```

Open: http://localhost:3000

---

## 🧪 **Step 4: Test Authentication Flow**

### Test 1: Login Page

1. **Go to**: http://localhost:3000
2. **Expected**: Redirects to http://localhost:3000/login
3. **See**: Beautiful login page with Google button
4. **Click**: "Sign in with Google"
5. **Select**: Your Google account
6. **Expected**: Redirects to http://localhost:3000/chaser/incidents

✅ **Pass**: You're now signed in!

---

### Test 2: Route Protection

1. **While signed in**, go to: http://localhost:3000/chaser/favorites
2. **Expected**: Page loads normally (you're authenticated)

3. **Open new incognito window**
4. **Go to**: http://localhost:3000/chaser/incidents
5. **Expected**: Redirects to /login (not authenticated)

✅ **Pass**: Routes are protected!

---

### Test 3: Sign Out

1. **Navigate to**: Profile page (bottom nav)
2. **Scroll down** to red "Sign Out" button
3. **Click "Sign Out"**
4. **Expected**: Redirects to /login

5. **Try to visit**: http://localhost:3000/chaser/incidents
6. **Expected**: Redirects to /login

✅ **Pass**: Sign-out works!

---

### Test 4: Multiple Users

1. **You sign in** with your Google account
2. **Your wife signs in** with her Google account (different browser/device)
3. **Both see the same alerts** (shared data)
4. **Each favorite different alerts**
5. **Expected**: Favorites are separate per user

✅ **Pass**: Multi-user works!

---

## 🔍 **Step 5: Test App Features**

### Test Incidents Page

- [ ] See live alerts from Firestore
- [ ] Alerts are in order (newest first)
- [ ] Can click alert to open details page
- [ ] Can favorite alert (heart icon)
- [ ] Can bookmark alert (bookmark icon)
- [ ] Can silence alert (bell icon)

---

### Test Details Page

- [ ] See incident address, type, county
- [ ] See map with location
- [ ] See all updates (numbered)
- [ ] Can add notes
- [ ] Notes save automatically (on blur)
- [ ] Notes persist when returning to page
- [ ] Can see Homeowner tab
- [ ] Can see Docs tab
- [ ] Can see eSign tab

---

### Test Favorites Page

- [ ] See only favorited alerts
- [ ] Can unfavorite from this page
- [ ] Empty state shows when no favorites
- [ ] Bookmarks tab shows bookmarked alerts
- [ ] Notes tab shows alerts with notes

---

### Test Chat Page

- [ ] See "Coming Soon" message
- [ ] See emergency call buttons
- [ ] Click "Emergency Call" → opens phone dialer

---

### Test Profile Page

- [ ] See your name (from Google account)
- [ ] See your email
- [ ] Stats cards show (placeholder data)
- [ ] Can toggle push notifications
- [ ] Can toggle location tracking
- [ ] Can sign out

---

## 🐛 **Known Issues (Expected)**

### During Testing:

1. **"Missing profile picture"** - Normal, user profiles aren't created yet
2. **"Stats show 0"** - Normal, no tracking implemented yet
3. **"Cash App/Venmo fields empty"** - Normal, no payout setup yet
4. **"Some duplicates in updates"** - Known, Cloud Function issue (not fixable from frontend)

---

## 🚨 **If Something Breaks**

### Error: "Missing or insufficient permissions"

**Cause**: Firestore rules deployed correctly.

**Fix**: Make sure you're signed in with Google account.

---

### Error: "Cannot read incidents"

**Cause**: User not authenticated.

**Fix**:
1. Sign out
2. Sign in again
3. Clear browser cache

---

### Error: "Popup blocked"

**Cause**: Browser blocked Google sign-in popup.

**Fix**: Allow popups for localhost:3000

---

### Error: "auth/unauthorized-domain"

**Cause**: localhost not authorized in Firebase.

**Fix**:
1. Firebase Console → Authentication → Settings
2. Authorized domains → Add `localhost`

---

## 📊 **Testing Checklist**

### ✅ Authentication & Security

- [ ] Can sign in with Google
- [ ] Can sign out
- [ ] Routes redirect to login when not authenticated
- [ ] Can't access app without signing in
- [ ] Multiple users can sign in simultaneously

### ✅ Incidents

- [ ] See live alerts
- [ ] Can favorite/unfavorite
- [ ] Can bookmark/unbookmark
- [ ] Can silence alerts
- [ ] Details page loads
- [ ] Map shows location
- [ ] Updates display correctly

### ✅ Notes

- [ ] Can add notes
- [ ] Notes save automatically
- [ ] Notes persist across page loads
- [ ] Notes show on details page
- [ ] Notes tab shows alerts with notes

### ✅ Favorites & Bookmarks

- [ ] Favorites page shows only favorited
- [ ] Bookmarks tab shows only bookmarked
- [ ] Can toggle from list view
- [ ] Can toggle from details page

### ✅ Profile

- [ ] Shows Google account info
- [ ] Toggles work (push, tracking)
- [ ] Sign out button works

### ✅ UI/UX

- [ ] App is responsive (mobile/desktop)
- [ ] Navigation works (bottom nav)
- [ ] Loading states show
- [ ] Error messages display
- [ ] Colors match screenshots

---

## 📝 **Feedback Template**

As you test, note any issues:

### Bug Report Format:
```
**Page**: (e.g., Details page)
**Action**: (e.g., Clicked favorite button)
**Expected**: (e.g., Heart turns red)
**Actual**: (e.g., Nothing happened)
**Browser**: (e.g., Chrome)
**Logged in as**: (e.g., your.email@gmail.com)
```

---

## 🎉 **After Testing**

### Step 6: Disable Anonymous Auth

1. **Go to**: https://console.firebase.google.com/project/emu-incidents/authentication/providers

2. **Click "Anonymous"**

3. **Toggle "Enable"** to OFF

4. **Click "Save"**

✅ **Done!** App is now 100% secure.

---

## 💡 **Tips for Testing**

1. **Use two devices/browsers** - Test multiple users simultaneously
2. **Test on mobile** - Open http://YOUR_IP:3000 on phone (same WiFi)
3. **Check console logs** - Open browser DevTools (F12) for debugging
4. **Test edge cases** - Try clicking buttons rapidly, refreshing pages, etc.
5. **Note everything** - Even small UX issues are worth fixing

---

## 🚀 **Next Steps After Testing**

1. **Deploy to Firebase Hosting** (production)
2. **Set up custom domain**
3. **Invite more testers**
4. **Add more features based on feedback**
5. **Implement payment system**
6. **Add push notifications**
7. **Build Supe app**

---

## 📞 **Need Help?**

If you encounter issues during testing:

1. **Check browser console** (F12 → Console tab)
2. **Check terminal** (where `npm run dev` is running)
3. **Check Firebase Console** (logs, rules, authentication)
4. **Review** `SETUP_AUTH.md` for Firebase Console steps

---

**Testing Period**: October 29 - November 5, 2025 (1 week)

**Testers**: You + Your Wife

**Goal**: Find bugs, test all features, verify security

---

**Last Updated**: October 29, 2025  
**Status**: Ready for testing! 🎉  
**Security**: ✅ Fully secured with Google Auth

