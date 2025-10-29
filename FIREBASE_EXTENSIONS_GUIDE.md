# Firebase Extensions Guide for EMU Alerts

## 🔐 Anonymous Authentication Explained

### What It Is
Anonymous Authentication is a Firebase feature that creates temporary user accounts without requiring login credentials.

### Current Status in EMU Alerts
- ✅ **ENABLED** (required for favorites/bookmarks/notes to work)
- Creates temporary UIDs automatically
- No login screen shown to users
- Used in combination with `firestore.rules` that allow all access

### Security Risk
⚠️ **Current Setup = ZERO SECURITY**
- Anyone can read/write all data
- No user verification
- Not suitable for production

### When to Replace It
**Before production launch**, replace with proper authentication:

#### Option 1: Email/Password (Recommended)
```typescript
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Sign up
await createUserWithEmailAndPassword(auth, email, password);

// Sign in
await signInWithEmailAndPassword(auth, email, password);
```

**Pros:**
- Full control over user accounts
- Password reset functionality
- Email verification
- Professional

**Cons:**
- Need to build login UI
- Users must remember passwords

---

#### Option 2: Google Sign-In
```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
```

**Pros:**
- One-click login
- No password management
- Fast onboarding

**Cons:**
- Requires Google account
- Less control

---

#### Option 3: Phone Authentication
```typescript
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

const appVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
const result = await confirmationResult.confirm(code);
```

**Pros:**
- Perfect for field workers
- SMS verification
- No email needed

**Cons:**
- Costs per SMS
- Requires phone number

---

## 🔌 Recommended Firebase Extensions

### ✅ INSTALL NOW

#### 1. Delete User Data
**Extension ID:** `firebase/delete-user-data`

**What it does:** Automatically deletes user data when a user account is deleted.

**Why you need it:** 
- GDPR compliance
- Privacy protection
- Auto-cleanup when chasers leave team

**Installation:**
```bash
firebase ext:install firebase/delete-user-data
```

**Configuration:**
- Cloud Firestore paths: `users/{UID},incidents/{incidentId}/notes/{UID}`
- Cloud Storage paths: `users/{UID}`

**Cost:** Free (only pays for Firestore deletes)

---

### 🤔 INSTALL AFTER LAUNCH

#### 2. Trigger Email from Firestore
**Extension ID:** `firebase/firestore-send-email`

**What it does:** Sends emails when Firestore documents are created/updated.

**Use cases:**
- Email supe when chaser responds to incident
- Email chaser when new alert in their area
- Email admin when critical alert arrives

**Installation:**
```bash
firebase ext:install firebase/firestore-send-email
```

**Configuration:**
- Email collection: `mail`
- SMTP provider: SendGrid, Mailgun, or Gmail

**Cost:** Free extension, but email provider charges apply

---

#### 3. Resize Images
**Extension ID:** `firebase/storage-resize-images`

**What it does:** Auto-resizes images uploaded to Cloud Storage.

**Use cases:**
- Resize roof damage photos
- Compress property images
- Generate thumbnails for docs

**Installation:**
```bash
firebase ext:install firebase/storage-resize-images
```

**Configuration:**
- Cloud Storage bucket: `{your-project-id}.appspot.com`
- Sizes: `200x200,800x800`
- Delete original: No

**Cost:** Free (only pays for Storage writes)

**When to install:** After photo uploads are actively used (Docs tab)

---

#### 4. Export Collections to BigQuery
**Extension ID:** `firebase/firestore-bigquery-export`

**What it does:** Streams Firestore data to BigQuery for analytics.

**Use cases:**
- "How many incidents per county this month?"
- "Average chaser response time"
- "Incident trends over time"
- "Busiest days/hours for alerts"

**Installation:**
```bash
firebase ext:install firebase/firestore-bigquery-export
```

**Configuration:**
- Collection path: `incidents`
- Dataset ID: `emu_incidents`
- Table ID: `incidents`

**Cost:** 
- Extension: Free
- BigQuery storage: $0.02/GB/month (first 10GB free)
- BigQuery queries: $5 per TB processed (first 1TB/month free)

**When to install:** After 3-6 months of data collected

---

#### 5. Search with Algolia
**Extension ID:** `algolia/firestore-algolia-search`

**What it does:** Enables full-text search of Firestore data.

**Use cases:**
- Search incidents by address
- Filter by alert type + county + date range
- Typo-tolerant search ("Brooklin" → "Brooklyn")
- Sort by distance, time, severity

**Installation:**
```bash
firebase ext:install algolia/firestore-algolia-search
```

**Configuration:**
- Collection path: `incidents`
- Algolia App ID: (sign up at algolia.com)
- Algolia API Key: (admin key)
- Index name: `incidents`

**Cost:**
- Free tier: Up to 10,000 records, 10,000 searches/month
- Paid: $1/month per 1,000 records

**When to install:** After 1,000+ incidents (when search becomes slow)

---

### ❌ DON'T INSTALL (Not Relevant)

- **Stripe Payments** - Not selling anything
- **Translate Text** - English-only app
- **Shorten URLs** - Not needed
- **Distribute Android App** - Web app, not Android

---

## 🚀 Installation Steps

### Step 1: Install Firebase Tools (if not already)
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Navigate to Project Directory
```bash
cd D:\github\EMU_v0
```

### Step 3: Install Extension
```bash
firebase ext:install firebase/delete-user-data
```

### Step 4: Follow Prompts
- Select your Firebase project: `emu-incidents`
- Grant necessary permissions
- Configure extension settings
- Deploy

### Step 5: Verify Installation
```bash
firebase ext:list
```

---

## 📊 Cost Estimate

### Current Setup (No Extensions)
- **Firestore:** ~$0.50/month (estimated for 1,000 incidents)
- **Storage:** ~$0.10/month (minimal usage)
- **Hosting:** Free (up to 10GB/month)
- **Authentication:** Free (all plans)

**Total:** ~$0.60/month

---

### With Recommended Extensions
- **Delete User Data:** $0 (only deletes)
- **Trigger Email:** $0 (SendGrid free tier: 100 emails/day)
- **Resize Images:** ~$0.05/month (100 images)

**Total:** ~$0.65/month

---

### With ALL Extensions
- **BigQuery Export:** ~$2/month (storage + queries)
- **Algolia Search:** $0 (free tier up to 10k records)

**Total:** ~$2.65/month

**Conclusion:** Extensions are very affordable for your use case.

---

## 🔒 Fixing Anonymous Auth

### Update Firestore Rules (After Implementing Real Auth)

Replace your current wide-open rules:

```javascript
// ❌ CURRENT (INSECURE)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

With proper authentication checks:

```javascript
// ✅ SECURE (After Real Auth)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Incidents: Anyone authenticated can read, only supes can write
    match /incidents/{incidentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'supe';
      
      // Updates subcollection: same rules
      match /updates/{updateId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'supe';
      }
    }
    
    // Users: Can only read/write own document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Notes: Only owner can write, all can read
    match /incidents/{incidentId}/notes/{noteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               resource.data.createdBy == request.auth.uid;
    }
  }
}
```

### Deploy New Rules
```bash
firebase deploy --only firestore:rules
```

---

## 🎯 Recommended Timeline

### Week 1 (NOW)
- [ ] Keep anonymous auth (for testing)
- [ ] Install Delete User Data extension
- [ ] Document security plan

### Week 2-4 (Before Launch)
- [ ] Implement email/password or Google auth
- [ ] Update Firestore rules
- [ ] Test with real users
- [ ] Disable anonymous auth

### Month 2-3 (Post-Launch)
- [ ] Install Trigger Email extension
- [ ] Install Resize Images extension (when Docs tab is used)
- [ ] Monitor costs

### Month 6+ (Scaling)
- [ ] Install BigQuery Export for analytics
- [ ] Install Algolia Search (if needed)
- [ ] Consider Firebase Performance Monitoring

---

## 📞 Need Help?

### Firebase Extensions Documentation
https://firebase.google.com/products/extensions

### Firebase Authentication Guide
https://firebase.google.com/docs/auth

### Firebase Console
https://console.firebase.google.com/project/emu-incidents

---

**Last Updated:** October 29, 2025
**Status:** Anonymous Auth enabled (temporary), extensions not yet installed

