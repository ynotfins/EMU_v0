# 💬 Live Chat Testing Guide

**Status**: ✅ Implemented & Ready to Test  
**Last Updated**: October 30, 2025

---

## 🎯 What's Implemented

### **Incident Group Chat** (1 Chaser + ALL Supes)
- ✅ Real-time messaging via Firebase Realtime Database
- ✅ Auto-adds ALL supes when chaser initiates chat
- ✅ Visible on incident details page → "Chat" tab
- ✅ Shows sender name + role badge (CHASER/SUPE)
- ✅ Message timestamps
- ✅ Auto-scroll to latest message
- ✅ Enter to send, Shift+Enter for new line

### **Direct Chat** (1-on-1)
- ✅ Backend implemented (`lib/realtime-database.ts`)
- ⚠️ UI not wired yet (needs chat list page)
- Will be: Chaser-to-chaser or Supe-to-supe only

---

## 🔒 Security Rules (DEPLOYED)

### **File**: `database.rules.json`

```json
{
  "incident-chats": {
    ".read": "auth != null",
    ".write": "auth != null"
  },
  "direct-chats": {
    ".read": "auth != null && participants",
    ".write": "auth != null && participants"
  }
}
```

**Status**: ⚠️ **NOT YET DEPLOYED TO FIREBASE**

---

## 🚨 CRITICAL: Deploy Database Rules FIRST

### **Before Testing, You MUST**:

1. **Go to Firebase Console**:
   - https://console.firebase.google.com/project/emu-incidents/database

2. **Check if Realtime Database is Initialized**:
   - If you see "Get Started" → Click it
   - Choose location: `us-central1` (same as Firestore)
   - Start in **LOCKED MODE** (secure by default)

3. **Deploy Security Rules**:
   ```bash
   # Option A: Firebase CLI (if installed)
   cd D:\github\EMU_v0
   firebase deploy --only database
   
   # Option B: Manual (if no CLI)
   # 1. Open Firebase Console → Realtime Database → Rules tab
   # 2. Copy contents of database.rules.json
   # 3. Paste into Rules editor
   # 4. Click "Publish"
   ```

4. **Verify Rules Deployed**:
   - Go to Firebase Console → Realtime Database → Rules tab
   - Should see: `".read": "auth != null"`

---

## ✅ Testing Checklist

### **Prerequisites**:
- [ ] Firebase Realtime Database initialized
- [ ] Security rules deployed
- [ ] At least 2 test users created:
  - [ ] User 1: Chaser role
  - [ ] User 2: Supe role
  - [ ] User 3: Supe role (optional, for testing "ALL supes" feature)

### **Create Test Users** (if needed):

**Option A: Firebase Console** (Manual):
1. Go to Firebase Console → Authentication → Users → Add user
2. Create:
   - `chaser1@test.com` / password: `test123456`
   - `supe1@test.com` / password: `test123456`
   - `supe2@test.com` / password: `test123456`
3. Go to Firestore → `users` collection → Add documents:
   ```
   Document ID: <user-uid>
   Fields:
     email: chaser1@test.com
     name: Chaser One
     role: chaser
   ```

**Option B: Use Signup Page** (Easier):
1. Visit https://4axe.com/signup
2. Sign up as `chaser1@test.com` → Select "Chaser" role
3. Sign out
4. Sign up as `supe1@test.com` → Select "Supe" role
5. Sign out
6. Sign up as `supe2@test.com` → Select "Supe" role

---

## 🧪 Test Scenarios

### **Test 1: Basic Incident Chat (Single User)**

1. **Sign in as Chaser**:
   - Go to https://4axe.com/login
   - Sign in as `chaser1@test.com`

2. **Open an Incident**:
   - Go to `/chaser/incidents`
   - Click any incident (e.g., NFA-1834242)

3. **Open Chat Tab**:
   - Click "Chat" tab
   - Should see: "No messages yet"

4. **Send a Message**:
   - Type: "Test message 1"
   - Press Enter (or click Send button)
   - **Expected**: Message appears instantly with your name + "CHASER" badge

5. **Check Console Logs**:
   - Open DevTools → Console
   - Should see:
     ```
     [IncidentChat] 🚀 Initializing incident chat for NFA-1834242
     [IncidentChat] Found 2 supes to add to chat
     [IncidentChat] ✅ Chat initialized with 2 supes
     [IncidentChat] ✅ Message sent to incident NFA-1834242
     ```

---

### **Test 2: Real-Time Messaging (Two Users)**

1. **Device 1 (Chaser)**:
   - Sign in as `chaser1@test.com`
   - Open incident NFA-1834242 → Chat tab
   - Keep tab open

2. **Device 2 (Supe)** (another browser window/incognito/phone):
   - Sign in as `supe1@test.com`
   - Open SAME incident (NFA-1834242) → Chat tab
   - Should see chaser's previous message

3. **Test Real-Time**:
   - **Device 1 (Chaser)**: Type "Hello from chaser"
   - **Device 2 (Supe)**: Should see message appear INSTANTLY
   - **Device 2 (Supe)**: Reply "Hello from supe"
   - **Device 1 (Chaser)**: Should see reply INSTANTLY

4. **Check Message Display**:
   - Own messages: Blue background, right-aligned
   - Other messages: Gray background, left-aligned, shows name + role badge

---

### **Test 3: Multiple Supes in Chat**

1. **Device 1 (Chaser)**:
   - Sign in as `chaser1@test.com`
   - Open incident → Chat tab

2. **Device 2 (Supe 1)**:
   - Sign in as `supe1@test.com`
   - Open SAME incident → Chat tab

3. **Device 3 (Supe 2)** (if you have 3rd device/browser):
   - Sign in as `supe2@test.com`
   - Open SAME incident → Chat tab

4. **Test Group Chat**:
   - All 3 users should see ALL messages in real-time
   - Supes should see "SUPE" badge on their messages
   - Chaser should see "CHASER" badge

---

### **Test 4: Chat Persistence (Refresh Test)**

1. **Send some messages** in incident chat
2. **Refresh the page** (F5)
3. **Expected**: All previous messages still visible
4. **Check**: Message order preserved (oldest → newest)

---

### **Test 5: Multiple Incidents (Isolation Test)**

1. **Open Incident A** (e.g., NFA-1834242):
   - Send message: "This is incident A"

2. **Open Incident B** (e.g., NFA-1834237):
   - Click Chat tab
   - **Expected**: Empty chat (no messages from Incident A)
   - Send message: "This is incident B"

3. **Go Back to Incident A**:
   - **Expected**: Only Incident A messages visible
   - Incident B messages should NOT appear

---

### **Test 6: Auto-Scroll (UX Test)**

1. Send 20+ messages to fill chat area
2. New message arrives
3. **Expected**: Chat auto-scrolls to show latest message at bottom

---

### **Test 7: Offline → Online (Network Test)**

1. Open incident chat
2. Send a message (works)
3. **Turn off WiFi / Enable airplane mode**
4. Try to send message
5. **Expected**: Error or message pending
6. **Turn WiFi back on**
7. **Expected**: Message sends automatically

---

## 🐛 Troubleshooting

### **Issue 1: "Permission Denied" Error**

**Symptoms**:
- Console error: `PERMISSION_DENIED: Permission denied`
- Messages don't send

**Causes**:
- Database rules not deployed
- User not authenticated
- Realtime Database not initialized

**Fix**:
1. Check Firebase Console → Realtime Database → Rules
2. Ensure rules are deployed (see "Deploy Database Rules" section above)
3. Verify user is signed in (`auth.currentUser` not null)

---

### **Issue 2: Messages Not Appearing in Real-Time**

**Symptoms**:
- Need to refresh to see new messages
- Other user's messages don't appear automatically

**Causes**:
- Realtime Database listener not working
- Network issues
- Browser blocking WebSocket connections

**Fix**:
1. Check browser console for errors
2. Check Network tab → WS (WebSocket) connections
3. Disable ad blockers / firewall temporarily
4. Try different browser (Chrome recommended)

---

### **Issue 3: Chat Not Initializing (No Supes Found)**

**Symptoms**:
- Console: `Found 0 supes to add to chat`
- Chat seems empty or broken

**Causes**:
- No users with `role: 'supe'` in Firestore `/users` collection

**Fix**:
1. Go to Firestore → `users` collection
2. Check if any users have `role: 'supe'`
3. If not, create supe accounts (see "Create Test Users" above)
4. Or change existing user's role: Update `role` field to `'supe'`

---

### **Issue 4: "Loading..." Never Stops**

**Symptoms**:
- Chat tab stuck on "Loading..."

**Causes**:
- `useProfile()` hook not returning data
- User profile doesn't exist in Firestore

**Fix**:
1. Check Firestore → `users` collection
2. Ensure document exists for current user's UID
3. Document must have: `{ id, email, name, role }`

---

### **Issue 5: Can't See Chat Tab**

**Symptoms**:
- No "Chat" tab on incident details page

**Causes**:
- Using supe version of incident page (not implemented yet)
- Different page layout

**Fix**:
- Ensure you're on `/chaser/incident/[id]` (not `/supe/incident/[id]`)
- Supe chat tab is TODO (copy from chaser page)

---

## 📊 Success Criteria

Chat is working if:

- ✅ Chaser can send messages
- ✅ Supe receives messages in real-time (< 1 second)
- ✅ Messages show sender name + role badge
- ✅ Timestamps display correctly
- ✅ Messages persist after refresh
- ✅ Multiple incidents have isolated chats
- ✅ Auto-scroll works
- ✅ No permission errors in console

---

## 🔮 Next Steps (After Chat Working)

### **Phase 1: UI Improvements**
- [ ] Add "typing..." indicator
- [ ] Add message read receipts
- [ ] Add emoji picker
- [ ] Add file attachment support

### **Phase 2: Direct Chats**
- [ ] Create chat list page (`/chaser/chat`)
- [ ] Show all users to start 1-on-1 chats
- [ ] Implement chaser-chaser direct messages
- [ ] Implement supe-supe direct messages

### **Phase 3: Push Notifications**
- [ ] Send push notification when new chat message arrives
- [ ] Play notification sound
- [ ] Show unread message count

### **Phase 4: Advanced Features**
- [ ] Voice messages
- [ ] Location sharing
- [ ] Image/video sharing
- [ ] Message reactions (👍, ❤️, etc.)

---

## 🚀 Quick Test Commands

### **Firebase CLI (if installed)**:

```bash
# Deploy database rules
firebase deploy --only database

# View real-time data
firebase database:get / --project emu-incidents

# Clear all chat data (DANGER!)
firebase database:remove /incident-chats --project emu-incidents

# Check rules
firebase database:rules:get --project emu-incidents
```

### **Browser Console (for debugging)**:

```javascript
// Check current user
console.log(firebase.auth().currentUser);

// Check Realtime Database connection
firebase.database().ref('.info/connected').on('value', snap => {
  console.log('Connected:', snap.val());
});

// Manually send test message
firebase.database()
  .ref('incident-chats/NFA-1834242/messages')
  .push({
    userId: 'test',
    userName: 'Test User',
    userRole: 'chaser',
    message: 'Manual test message',
    timestamp: Date.now(),
    read: false
  });
```

---

## 📝 Testing Log Template

Use this to track your testing:

```
Date: ___________
Tester: ___________

✅ Test 1: Basic Chat (Single User)
   - Result: PASS / FAIL
   - Notes: _____________________

✅ Test 2: Real-Time Messaging (Two Users)
   - Result: PASS / FAIL
   - Notes: _____________________

✅ Test 3: Multiple Supes in Chat
   - Result: PASS / FAIL
   - Notes: _____________________

✅ Test 4: Chat Persistence
   - Result: PASS / FAIL
   - Notes: _____________________

✅ Test 5: Multiple Incidents (Isolation)
   - Result: PASS / FAIL
   - Notes: _____________________

✅ Test 6: Auto-Scroll
   - Result: PASS / FAIL
   - Notes: _____________________

✅ Test 7: Offline → Online
   - Result: PASS / FAIL
   - Notes: _____________________

Overall Status: WORKING / BROKEN
Issues Found: _____________________
```

---

**Need Help?** Check console logs first! Every chat action logs to console with emoji prefixes:
- 🚀 = Initialization
- ✅ = Success
- ❌ = Error
- 💬 = Message event
- 👋 = Cleanup

---

*Last Updated: October 30, 2025*  
*Version: 1.0*

