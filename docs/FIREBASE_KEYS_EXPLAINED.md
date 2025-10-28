# Firebase Keys Explained

## 🔑 Two Different Keys for Two Different Purposes

### 1️⃣ Firebase Admin SDK Service Account Key (Backend/MCP)

**What it is**:

- JSON file with private key
- Full admin access to your Firebase project
- Used for **server-side** operations

**Where you get it**:

- Firebase Console → Project Settings → Service Accounts
- https://console.firebase.google.com/project/emu-incidents/settings/serviceaccounts/adminsdk
- Click "Generate new private key"

**File format**:

```json
{
  "type": "service_account",
  "project_id": "emu-incidents",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxxx@emu-incidents.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**Used for**:

- ✅ Firebase MCP (Cursor integration)
- ✅ Node.js backend scripts
- ✅ Firebase Admin SDK operations
- ✅ Bypassing security rules (admin access)
- ✅ Server-side Firestore operations

**Security**:

- 🔒 **NEVER expose to client**
- 🔒 **NEVER commit to Git**
- 🔒 Add to `.gitignore` immediately
- 🔒 Has full admin access to everything

**File location in our project**:

```
D:\github\EMU_v0\firebase-admin-key.json
```

**Added to .gitignore**: ✅ Yes

---

### 2️⃣ FCM VAPID Key (Frontend Push Notifications)

**What it is**:

- Base64-encoded public key
- Used for browser push notifications
- Safe to expose in client-side code

**Where you get it**:

- Firebase Console → Project Settings → Cloud Messaging
- https://console.firebase.google.com/project/emu-incidents/settings/cloudmessaging
- Under "Web Push certificates" → "Key pair"

**Format**:

```
BN2x-3gT8K9... (starts with B, ~88 characters long)
```

**Used for**:

- ✅ Browser push notification registration
- ✅ Client-side Firebase Messaging
- ✅ Foreground notifications in web app
- ✅ Background notifications via service worker

**Security**:

- ✅ **Safe to expose** (it's a public key)
- ✅ **Can be in client-side code**
- ✅ **Already in your .env.local**

**In our project**:

```bash
# .env.local
NEXT_PUBLIC_FCM_VAPID_KEY=BN2x-3gT8K9...  # This one!
```

**Note**: `NEXT_PUBLIC_` prefix means it's exposed to the browser (intentional and safe).

---

## 📊 Quick Comparison

| Feature           | Admin SDK Key             | FCM VAPID Key           |
| ----------------- | ------------------------- | ----------------------- |
| **Type**          | Private key (secret)      | Public key              |
| **Format**        | JSON file                 | Base64 string           |
| **Used on**       | Server/Backend            | Client/Browser          |
| **Used for**      | Full Firestore access     | Push notifications only |
| **Security**      | ❌ NEVER expose           | ✅ Safe to expose       |
| **In .gitignore** | ✅ Yes                    | ❌ No (it's public)     |
| **In .env.local** | ❌ No (file path instead) | ✅ Yes                  |
| **Prefix**        | None                      | `NEXT_PUBLIC_`          |

---

## 🎯 Your Current Setup

### ✅ Already Have (in .env.local):

```bash
NEXT_PUBLIC_FCM_VAPID_KEY=BXxxx...
```

This is your **browser push notification key** (already configured).

### 🔄 Need to Generate (for Firebase MCP):

**Admin SDK Service Account Key** (JSON file)

- Go to: https://console.firebase.google.com/project/emu-incidents/settings/serviceaccounts/adminsdk
- Click "Generate new private key"
- Download as `firebase-admin-key.json`
- Move to project root
- Add to `.gitignore` ✅ (already done)

---

## 🧪 What Each Key Does in Our App

### FCM VAPID Key (already working):

```typescript
// lib/fcm.ts
import { getMessaging, getToken } from "firebase/messaging";

const messaging = getMessaging();
const token = await getToken(messaging, {
  vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY, // ← This one!
});
```

**Purpose**: Lets users subscribe to push notifications in the browser.

---

### Admin SDK Key (for Firebase MCP):

```json
// MCP settings
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-firebase"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "D:\\github\\EMU_v0\\firebase-admin-key.json" // ← This one!
      }
    }
  }
}
```

**Purpose**: Lets Cursor AI read/write Firestore data directly from chat (bypassing security rules).

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T: Expose Admin SDK Key to Client

```typescript
// BAD - NEVER DO THIS
const serviceAccount = require("./firebase-admin-key.json");
export const adminKey = serviceAccount.private_key; // ❌ Exposed to browser!
```

### ❌ DON'T: Commit Admin SDK Key to Git

```bash
git add firebase-admin-key.json  # ❌ NEVER!
```

### ✅ DO: Keep Admin SDK Key Server-Side Only

```typescript
// GOOD - Server-side only
// scripts/seed-data.ts (runs in Node.js, not browser)
import admin from "firebase-admin";
import serviceAccount from "../firebase-admin-key.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
```

### ✅ DO: Use VAPID Key in Client Code

```typescript
// GOOD - Client-side push notifications
const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY; // ✅ Safe!
```

---

## 📝 Summary

**For Firebase MCP setup**: Generate **Admin SDK Service Account Key** (JSON file)
**For Push Notifications**: Use **FCM VAPID Key** (already in `.env.local`)

**Two different keys, two different purposes, never mix them up!**

---

## ✅ Next Steps for Firebase MCP

1. Go to: https://console.firebase.google.com/project/emu-incidents/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Download JSON file
4. Rename to `firebase-admin-key.json`
5. Move to project root
6. Verify `.gitignore` has `firebase-admin-key.json` ✅
7. Configure Cursor MCP settings (see `docs/FIREBASE_MCP_SETUP.md`)

**Your VAPID key is already configured and working!** ✅
