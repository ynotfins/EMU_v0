# Firebase Authentication Setup Guide

## 🔐 Enable Google Sign-In in Firebase Console

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com/project/emu-incidents
2. Click **Authentication** in left sidebar
3. Click **Sign-in method** tab
4. Click **Google** in the providers list
5. Toggle **Enable** to ON
6. **Project support email**: Enter your email (required by Google)
7. Click **Save**

### Step 2: Get OAuth Client ID (Optional)
- Firebase will auto-generate this
- You can customize later if needed

---

## ✅ **Status After This Step:**
- ✅ Google Sign-In enabled
- ✅ Users can sign in with Google accounts
- ❌ Anonymous auth still enabled (disable after testing)

---

## 🧪 **Testing Accounts:**
- Your Google account
- Your wife's Google account
- Both will become "users" automatically

---

## 📝 **Next Steps (I'm handling these):**
1. Create login page
2. Update firebase.ts
3. Add route protection
4. Update security rules
5. Test everything

---

**Time to complete:** ~2 minutes in Firebase Console

