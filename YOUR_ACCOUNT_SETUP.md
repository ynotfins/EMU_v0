# 🔐 YOUR ACCOUNT SETUP - ynotfins@gmail.com

**Email**: `ynotfins@gmail.com`  
**Recommended Role**: `super_admin`  
**Access Level**: EVERYTHING (God Mode)

---

## ✅ WHAT YOU GET AS SUPER_ADMIN:

### **1. Super Admin Panel** (`/admin`)
- Manage all users
- Change anyone's role (including other admins)
- Create new admins
- Full control over system

### **2. Incident Access** (Like Supe + Chaser)
- View all incidents (`/chaser/incidents` or `/supe/incidents`)
- Respond to alerts
- Chat with team
- Manage favorites, bookmarks, notes

### **3. Profile/Supe Page**
- All supe features
- Live map (when implemented)
- ID verification
- Emergency payment
- All preferences

### **4. Admin Features**
- Create users from admin panel (when implemented)
- Access all CRM data
- Manage eSign documents
- Full system control

---

## 🎯 SETUP INSTRUCTIONS (DO THIS NOW):

### **Step 1: Find Your User in Firestore**

1. Go to: https://console.firebase.google.com/project/emu-incidents/firestore/data

2. Click `users` collection

3. Find the document with:
   - `email: "ynotfins@gmail.com"`

4. If you DON'T see your user:
   - Go to Firebase Authentication first
   - Create user with email/password
   - Then come back to Firestore

### **Step 2: Update Your Role**

1. Click on your user document

2. Find the `role` field

3. Click the pencil icon (✏️)

4. Change value to: `super_admin`

5. Click **Update**

### **Step 3: Verify**

1. Sign in to https://4axe.com/login with `ynotfins@gmail.com`

2. Try these URLs:
   - `/admin` → Should see Super Admin panel
   - `/chaser/incidents` → Should see incidents
   - `/supe/incidents` → Should see incidents
   - `/chaser/profile` → Should see profile

3. All should work! You have access to EVERYTHING.

---

## 🔄 ALTERNATIVE: Use Admin Panel (After First Setup)

Once you're a Super Admin, you can manage users from the admin panel:

1. Visit: https://4axe.com/admin

2. You'll see all users in a table

3. Click role buttons to change anyone's role:
   - `→ Chaser`
   - `→ Supe`
   - `→ Admin`
   - `→ Super Admin` (only you see this button)

---

## ⚠️ IMPORTANT NOTES:

### **You CANNOT Have Two Roles**
- Role is a single field: `super_admin` | `admin` | `supe` | `chaser`
- You can't be both "supe" AND "super_admin"
- **BUT**: `super_admin` can do EVERYTHING a supe can do + MORE

### **Navigation**
- Bottom nav shows based on role
- As `super_admin`, you'll see "Profile" (not "Supe")
- You can access both `/chaser/*` and `/supe/*` routes
- All features work for you

### **Recommended Setup**
- **Your main account**: `ynotfins@gmail.com` → `super_admin`
- **For testing**: Create separate test accounts:
  - `test-chaser@example.com` → `chaser`
  - `test-supe@example.com` → `supe`

---

## 🛠️ TROUBLESHOOTING:

### **Issue: Can't find user in Firestore**

**Solution**: User doesn't exist yet. Create it:

1. Go to: https://console.firebase.google.com/project/emu-incidents/authentication/users

2. Click "Add user"

3. Enter:
   - Email: `ynotfins@gmail.com`
   - Password: (your password)

4. Click "Add user"

5. Copy the UID (long string)

6. Go to Firestore: https://console.firebase.google.com/project/emu-incidents/firestore/data

7. Click `users` collection → "Add document"

8. Document ID: (paste the UID)

9. Add fields:
   ```
   id: (the UID)
   email: ynotfins@gmail.com
   name: Your Name
   role: super_admin
   ```

10. Click "Save"

### **Issue: Getting "Access Denied" at `/admin`**

**Causes**:
- Role is not `super_admin` or `admin`
- User profile doesn't exist in Firestore
- Signed in with wrong account

**Solution**:
1. Sign out: https://4axe.com/chaser/profile → "Sign Out"
2. Verify role in Firestore (must be `super_admin`)
3. Sign back in
4. Try `/admin` again

### **Issue: Bottom nav says "Profile" not "Supe"**

**This is CORRECT!**
- Super Admin sees "Profile"
- Regular Supe sees "Supe"
- This is intentional (we can change if you want)

---

## 🎯 WHAT I RECOMMEND:

### **Your Setup** (ynotfins@gmail.com):
```
role: super_admin
```

**Why?**
- You get EVERYTHING
- Full admin panel access
- Can view incidents like a supe
- Can respond like a chaser
- Can manage all users
- God mode enabled

### **If You Want "Supe" Label**:
I can update the bottom nav to show "Supe" for super_admin users instead of "Profile". Just say the word!

---

## 🚀 QUICK START:

1. **Right now**: Open Firebase Console
2. **Find**: ynotfins@gmail.com in Firestore `users` collection
3. **Change**: `role` field to `super_admin`
4. **Save**: Click Update
5. **Test**: Visit https://4axe.com/admin
6. **Done**: You're now God Mode! 🔥

---

*Last Updated: October 30, 2025*  
*Status: READY TO GO!*

