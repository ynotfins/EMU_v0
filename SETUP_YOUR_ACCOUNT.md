# 🔥 SETUP YOUR ACCOUNT - QUICK GUIDE

**You have 3 users in Firebase Authentication. Now create their Firestore profiles!**

---

## 📝 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Open Firestore Console**
https://console.firebase.google.com/project/emu-incidents/firestore/data/~2Fusers

### **Step 2: Create Users Collection**

If the `users` collection doesn't exist yet, you'll see "Start collection". If it exists, click "+ Add document".

---

### **USER 1: ynotfins@gmail.com (YOU - SUPER ADMIN)**

1. **Document ID**: `oQMSwjt2PmeciUWLLKPypJsZf2h2`
   - Get the FULL UID from Authentication page → click on ynotfins@gmail.com → copy "User UID"

2. **Add these fields**:
   ```
   Field: id
   Type: string
   Value: oQMSwjt2PmeciUWLLKPypJsZf2h2 (same as document ID)
   
   Field: email
   Type: string
   Value: ynotfins@gmail.com
   
   Field: name
   Type: string
   Value: Yosef Fins (or your name)
   
   Field: role
   Type: string
   Value: super_admin ⭐ (THIS IS IMPORTANT!)
   
   Field: createdAt
   Type: timestamp
   Value: (click "auto-generate" or use current timestamp)
   ```

3. Click **"Save"**

---

### **USER 2: j.snap11@yahoo.com (CHASER)**

1. **Get UID**:
   - Go to Authentication page
   - Click on `j.snap11@yahoo.com`
   - Copy the FULL "User UID" (it starts with `KfbyTlZna...`)

2. **Document ID**: (paste the full UID)

3. **Add these fields**:
   ```
   Field: id
   Type: string
   Value: (paste the UID)
   
   Field: email
   Type: string
   Value: j.snap11@yahoo.com
   
   Field: name
   Type: string
   Value: J Snap (or their name)
   
   Field: role
   Type: string
   Value: chaser
   
   Field: createdAt
   Type: timestamp
   Value: (auto-generate)
   ```

4. Click **"Save"**

---

### **USER 3: kristina41788@gmail.com (CHASER)**

1. **Get UID**:
   - Go to Authentication page
   - Click on `kristina41788@gmail.com`
   - Copy the FULL "User UID" (it starts with `PoeF0lGcaH...`)

2. **Document ID**: (paste the full UID)

3. **Add these fields**:
   ```
   Field: id
   Type: string
   Value: (paste the UID)
   
   Field: email
   Type: string
   Value: kristina41788@gmail.com
   
   Field: name
   Type: string
   Value: Kristina (or their name)
   
   Field: role
   Type: string
   Value: chaser
   
   Field: createdAt
   Type: timestamp
   Value: (auto-generate)
   ```

4. Click **"Save"**

---

## ✅ **VERIFY IT WORKED**

1. Go to: https://4axe.com/login
2. Sign in with `ynotfins@gmail.com`
3. Go to: https://4axe.com/admin
4. ✅ **You should see the Admin Panel!**
5. ✅ **You should see all 3 users listed!**

---

## 🎯 **WHAT YOU'LL BE ABLE TO DO**

### **As Super Admin (ynotfins@gmail.com)**:
- ✅ Access `/admin` panel
- ✅ Manage all user roles
- ✅ Create new admins/supes
- ✅ View all incidents
- ✅ See live map (coming soon)
- ✅ Full god mode access

### **Bottom Nav**:
- Shows "Supe" (not "Profile") because super_admin = supe + admin

### **Other Users**:
- j.snap11 and kristina = chasers
- They see incident list, can respond, chat, etc.
- No admin access

---

## 🚀 **AFTER SETUP**

Once your Firestore profiles are created, I'll continue building:
- ✅ Create users from admin panel
- ✅ ID verification upload
- ✅ Contacts section
- ✅ eSign features
- ✅ Live map
- ✅ Finish remaining 7 tasks!

---

## 🆘 **NEED HELP?**

If you get stuck, just tell me:
1. What step you're on
2. What error you see (if any)
3. Screenshot of the Firestore console

I'll help you fix it immediately!

---

**Status**: Waiting for you to create Firestore profiles  
**ETA**: 5 minutes to create all 3 profiles  
**Then**: I'll continue building! 🔥

