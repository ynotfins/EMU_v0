# Firebase Extension Configuration Guide

## Delete User Data Extension Setup

### Configuration Values for EMU Alerts

Copy these exact values into the Firebase Console when installing the extension:

---

### **Step 4: Configure Extension**

#### Cloud Functions location
```
Northern Virginia (us-east4)
```
✅ Already selected in your screenshot

---

#### Firestore Database ID
```
(default)
```
✅ Already filled in your screenshot

---

#### Cloud Firestore paths (Optional)
```
users/{UID},incidents/{incidentId}/notes/{UID}
```

**Explanation:**
- `users/{UID}` - Deletes the user's profile document
- `incidents/{incidentId}/notes/{UID}` - Deletes all notes created by this user

**What gets deleted when user account is removed:**
- ✅ User profile (name, email, role, etc.)
- ✅ All notes they created on incidents
- ❌ Favorites/bookmarks remain (by design, for data integrity)

---

#### Cloud Firestore delete mode
```
Shallow
```
✅ Correct - only deletes specified documents, not entire collections

---

#### Realtime Database instance (Optional)
```
my-instance
```
or leave blank if you don't use Realtime Database

**Note:** You're using Firestore, not Realtime Database, so this is optional.

---

#### Realtime Database location (Optional)
```
United States
```
✅ Already selected

---

#### Realtime Database paths (Optional)
```
users/{UID},admins/{UID}
```

**Note:** Only needed if you switch to Realtime Database later.

---

#### Cloud Storage bucket
```
emu-incidents.firebasestorage.app
```

**How to find it:**
1. Go to Firebase Console
2. Storage section
3. Copy the bucket name at the top

Alternative format:
```
emu-incidents.appspot.com
```
(Both work, use whichever appears in your Storage console)

---

#### Cloud Storage paths (Optional)
```
users/{UID}/profile-pic.png,users/{UID}/docs/{fileName}
```

**Explanation:**
- `users/{UID}/profile-pic.png` - Deletes user profile photo
- `users/{UID}/docs/{fileName}` - Deletes all docs uploaded by user

**More flexible (recommended):**
```
users/{UID}
```
This deletes everything in the user's folder.

---

#### Enable auto discovery
```
No
```

**Why?** 
- Manual paths are more explicit and safer
- You know exactly what gets deleted
- Prevents accidental deletions

---

#### Auto discovery search depth
```
3
```
Leave as default (only used if auto discovery is enabled)

---

#### Auto discovery search fields (Optional)
```
id,uid,userId
```
Leave as default (only used if auto discovery is enabled)

---

#### Search function URL (Optional)
```
(leave blank)
```

**When to use:** Only if you have a custom Cloud Function to find user data. Not needed for standard setup.

---

## Cloud Storage Security Rules

### For Development (Next 30 days)
Choose **"Start in test mode"**

This creates:
```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.time < timestamp.date(2024, 12, 1);
    }
  }
}
```

**Pros:**
- Easy testing
- Matches your open Firestore rules
- 30-day deadline reminds you to secure it

**Cons:**
- ⚠️ Anyone can upload/download files
- ⚠️ Auto-expires in 30 days

---

### For Production (Before Launch)
Choose **"Start in production mode"** and use these rules:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // User profile photos - only owner can write, all can read
    match /users/{userId}/profile-pic.png {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User documents - only owner can read/write
    match /users/{userId}/docs/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Incident documents - chasers can write, all can read
    match /incidents/{incidentId}/docs/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Incident photos - chasers can write, all can read
    match /incidents/{incidentId}/photos/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.resource.size < 10 * 1024 * 1024 && // Max 10MB
        request.resource.contentType.matches('image/.*'); // Only images
    }
    
    // Deny all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**Features:**
- ✅ Size limit (10MB) for images
- ✅ Content type validation (only images)
- ✅ User-specific access control
- ✅ Incident files accessible to all authenticated users

---

## Quick Reference

### Extension Installation Command
```bash
firebase ext:install firebase/delete-user-data
```

### What Gets Deleted When User Account Removed

| Data Type | Location | Deleted? |
|-----------|----------|----------|
| User profile | `users/{UID}` | ✅ Yes |
| User notes | `incidents/{incidentId}/notes/{UID}` | ✅ Yes |
| User photos | `users/{UID}/*` | ✅ Yes (if Storage configured) |
| Favorites | `incidents/{id}.favoritedBy` array | ❌ No (preserves data) |
| Bookmarks | `incidents/{id}.bookmarkedBy` array | ❌ No (preserves data) |
| Incident data | `incidents/{id}` | ❌ No (shared data) |

---

## After Installation

### Verify Extension is Running
```bash
firebase ext:list
```

### Test User Deletion
1. Create test user account
2. Add some notes
3. Delete user account in Firebase Console
4. Verify data is deleted automatically

### Monitor Extension Logs
1. Firebase Console → Functions
2. Find `ext-delete-user-data-*` functions
3. Check logs for any errors

---

## Cost Estimate

### Delete User Data Extension
- **Extension:** Free
- **Firestore Deletes:** $0.02 per 100,000 deletes
- **Storage Deletes:** Free
- **Cloud Functions:** Free tier covers most usage

**Example:**
- Delete 10 user accounts/month
- Each user has ~100 notes
- Cost: ~$0.00002/month (essentially free)

---

## Troubleshooting

### "Extension failed to deploy"
- Check billing is enabled
- Verify you have owner/editor permissions
- Try different region

### "Cannot find bucket"
- Go to Storage in Firebase Console
- Initialize Storage if not already done
- Copy exact bucket name

### "Paths not working"
- Use `{UID}` exactly (case-sensitive)
- No spaces in paths
- Comma-separated, no quotes

---

## Summary

### ✅ Recommended Settings for EMU Alerts

**Cloud Storage:**
- Start in **test mode** (change later)

**Delete User Data Extension:**
- Cloud Firestore paths: `users/{UID},incidents/{incidentId}/notes/{UID}`
- Cloud Storage bucket: `emu-incidents.firebasestorage.app`
- Cloud Storage paths: `users/{UID}`
- Enable auto discovery: `No`
- Delete mode: `Shallow`

**Click "Install extension"** button when ready!

---

**Created:** October 29, 2025  
**Project:** EMU Incidents  
**Status:** Extension not yet installed, awaiting configuration

