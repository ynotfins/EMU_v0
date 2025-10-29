# 🚀 Quick Start - Testing in 10 Minutes

## ⚡ **Get Testing FAST!**

Follow these 3 steps to start testing your app right now.

---

## Step 1: Enable Google Sign-In (2 minutes)

1. **Open**: https://console.firebase.google.com/project/emu-incidents/authentication/providers

2. **Click**: "Google" provider

3. **Toggle**: Enable to ON

4. **Enter**: Your email in "Project support email"

5. **Click**: "Save"

✅ **DONE!**

---

## Step 2: Initialize Firebase Storage (2 minutes)

1. **Open**: https://console.firebase.google.com/project/emu-incidents/storage

2. **Click**: "Get Started"

3. **Select**: "Start in production mode"

4. **Choose**: `us-east4 (Northern Virginia)`

5. **Click**: "Done"

6. **In terminal, run**:
   ```bash
   cd D:\github\EMU_v0
   firebase deploy --only storage
   ```

✅ **DONE!**

---

## Step 3: Start Testing (1 minute)

1. **In terminal, run**:

   ```bash
   cd D:\github\EMU_v0
   npm run dev
   ```

2. **Open**: http://localhost:3000

3. **Click**: "Sign in with Google"

4. **Select**: Your Google account

5. **START TESTING!** 🎉

---

## ✅ **What to Test:**

### Must Test:

- [ ] Sign in with Google
- [ ] See live alerts
- [ ] Click alert → details page loads
- [ ] Add a note → note saves
- [ ] Favorite an alert → heart turns red
- [ ] Go to Favorites page → see favorited alert
- [ ] Profile → Click Sign Out → redirects to login

### Nice to Test:

- [ ] Sign in with your wife's account (different browser)
- [ ] Both see same alerts
- [ ] Favorites are separate
- [ ] Bookmarks work
- [ ] All tabs on details page (Homeowner, Docs, eSign)
- [ ] Chat page shows "Coming Soon"

---

## 🐛 **If Something Breaks:**

### "Missing permissions" error?

→ Make sure you're signed in with Google

### "Popup blocked"?

→ Allow popups for localhost

### Can't see alerts?

→ Check browser console (F12) for errors

---

## 📞 **After Testing:**

### Worked perfectly? ✅

1. **Disable anonymous auth** in Firebase Console (Authentication → Anonymous → Disable)
2. **You're production-ready!**

### Found bugs? 🐛

1. **Note what went wrong**
2. **Check browser console (F12)**
3. **Continue testing other features**

---

## 🎯 **The Goal:**

**Test for 30 minutes with you and your wife**

Find any bugs, test all features, make sure everything works.

---

**Time to complete:** ~10 minutes setup + 30 minutes testing

**Total time:** 40 minutes

**Result:** Production-ready app! 🚀

---

See `TESTING_GUIDE.md` for detailed testing checklist and troubleshooting.
