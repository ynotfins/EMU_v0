# 🔒 FIRESTORE BACKUP & SOFT DELETE STRATEGY

**Comprehensive backup system with soft deletes (deleted flag) for data recovery**

---

## 🎯 **STRATEGY OVERVIEW**

### **Soft Deletes (Logical Deletes)**

Instead of permanently removing documents, we mark them as deleted:

- Add `deleted: true` flag
- Add `deletedAt: timestamp`
- Add `deletedBy: userId`
- Document remains queryable but filtered out

### **Backup System**

- Automatic daily backups to separate collections
- Manual backup triggers for critical operations
- Version history tracking
- Point-in-time recovery capability

---

## 📊 **SOFT DELETE IMPLEMENTATION**

### **1. Add Deleted Fields to Schema**

All collections that need soft deletes should include:

```typescript
interface SoftDeletable {
  deleted: boolean; // false by default, true when "deleted"
  deletedAt?: Timestamp; // When was it deleted
  deletedBy?: string; // User ID who deleted it
  deletedReason?: string; // Optional: why it was deleted
}
```

### **2. Example: Users Collection**

```typescript
// Before deletion
{
  id: "user123",
  email: "user@example.com",
  name: "John Doe",
  role: "chaser",
  deleted: false,  // ← ADDED
  createdAt: Timestamp
}

// After "deletion"
{
  id: "user123",
  email: "user@example.com",
  name: "John Doe",
  role: "chaser",
  deleted: true,           // ← MARKED AS DELETED
  deletedAt: Timestamp,    // ← WHEN
  deletedBy: "admin_uid",  // ← WHO
  deletedReason: "User requested account closure",  // ← WHY
  createdAt: Timestamp
}
```

---

## 🔧 **IMPLEMENTATION CODE**

### **Soft Delete Function**

```typescript
// lib/actions/soft-delete.ts
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function softDelete(
  collection: string,
  documentId: string,
  userId: string,
  reason?: string
) {
  try {
    const docRef = doc(db, collection, documentId);

    await updateDoc(docRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: userId,
      deletedReason: reason || "No reason provided",
    });

    console.log(`✅ Soft deleted: ${collection}/${documentId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Soft delete failed:`, error);
    return { success: false, error };
  }
}
```

### **Restore Function**

```typescript
export async function restore(
  collection: string,
  documentId: string,
  userId: string
) {
  try {
    const docRef = doc(db, collection, documentId);

    await updateDoc(docRef, {
      deleted: false,
      restoredAt: serverTimestamp(),
      restoredBy: userId,
      // Keep deletedAt/deletedBy for audit trail
    });

    console.log(`✅ Restored: ${collection}/${documentId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Restore failed:`, error);
    return { success: false, error };
  }
}
```

### **Query Filtering (Hide Deleted)**

```typescript
// Normal queries - exclude deleted
const q = query(
  collection(db, "users"),
  where("deleted", "==", false), // ← FILTER OUT DELETED
  orderBy("createdAt", "desc")
);

// Admin view - show only deleted
const deletedQuery = query(
  collection(db, "users"),
  where("deleted", "==", true), // ← SHOW ONLY DELETED
  orderBy("deletedAt", "desc")
);

// Show all (admin recovery tool)
const allQuery = query(
  collection(db, "users"),
  orderBy("createdAt", "desc") // ← NO FILTER
);
```

---

## 💾 **BACKUP COLLECTIONS**

### **1. Automatic Backup Structure**

```
incidents                    ← LIVE DATA
incidents_backup_2025_10_30  ← DAILY BACKUP
incidents_backup_2025_10_29  ← PREVIOUS DAY
incidents_backup_2025_10_28  ← 2 DAYS AGO
```

### **2. Backup Collection Schema**

```typescript
interface BackupDocument {
  originalId: string; // Original document ID
  backupDate: Timestamp; // When backup was created
  collectionName: string; // Source collection
  data: any; // Full document data snapshot
  version: number; // Backup version number
}
```

### **3. Cloud Function: Daily Backup**

```typescript
// functions/src/backup-firestore.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const dailyBackup = functions.pubsub
  .schedule("every day 00:00") // Midnight UTC
  .onRun(async (context) => {
    const db = admin.firestore();
    const today = new Date().toISOString().split("T")[0];

    // Collections to backup
    const collections = [
      "users",
      "incidents",
      "responses",
      "signed_documents",
      "employee_docs",
    ];

    for (const collectionName of collections) {
      const backupCollectionName = `${collectionName}_backup_${today}`;

      console.log(`📦 Backing up ${collectionName} → ${backupCollectionName}`);

      // Get all documents
      const snapshot = await db.collection(collectionName).get();

      // Batch write to backup collection
      const batch = db.batch();

      snapshot.docs.forEach((doc) => {
        const backupDoc = db.collection(backupCollectionName).doc(doc.id);
        batch.set(backupDoc, {
          originalId: doc.id,
          backupDate: admin.firestore.FieldValue.serverTimestamp(),
          collectionName: collectionName,
          data: doc.data(),
          version: 1,
        });
      });

      await batch.commit();
      console.log(
        `✅ Backed up ${snapshot.size} documents from ${collectionName}`
      );
    }

    return null;
  });
```

---

## 🔄 **FIRESTORE SECURITY RULES FOR SOFT DELETES**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }

    function isSuperAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }

    // Users collection
    match /users/{userId} {
      // Read: authenticated users can read non-deleted users
      allow read: if isAuthenticated() &&
        (resource.data.deleted == false || isAdmin());

      // Create: authenticated users can create
      allow create: if isAuthenticated();

      // Update: user can update own profile, or admin can update
      allow update: if isAuthenticated() &&
        (request.auth.uid == userId || isAdmin());

      // Delete: only super_admin can hard delete
      // Soft delete handled via update
      allow delete: if isSuperAdmin();
    }

    // Backup collections - read-only for admins
    match /{collectionName}_backup_{date}/{docId} {
      allow read: if isAdmin();
      allow write: if false;  // Only Cloud Functions can write
    }
  }
}
```

---

## 📋 **COLLECTIONS TO IMPLEMENT SOFT DELETES**

### **Critical Collections (Must Have)**

1. ✅ `users` - User profiles
2. ✅ `signed_documents` - Legal documents
3. ✅ `employee_docs` - Employee documents
4. ✅ `responses` - Alert responses

### **Standard Collections (Recommended)**

5. ✅ `incidents` - Fire alerts (auto-expire after 30 days)
6. ✅ `favorites` - User favorites
7. ✅ `bookmarks` - User bookmarks
8. ✅ `notifications` - System notifications

### **Chat Collections (Optional)**

9. ⏳ Firebase Realtime Database chats (different strategy)

---

## 🛠️ **ADMIN RECOVERY TOOL**

Create an admin page to:

1. View deleted documents
2. Restore deleted documents
3. Permanently delete (hard delete)
4. View backup history

```typescript
// app/admin/recovery/page.tsx
export default function RecoveryPage() {
  const [deletedUsers, setDeletedUsers] = useState([]);

  useEffect(() => {
    // Query deleted users
    const q = query(
      collection(db, "users"),
      where("deleted", "==", true),
      orderBy("deletedAt", "desc")
    );

    onSnapshot(q, (snapshot) => {
      const deleted = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDeletedUsers(deleted);
    });
  }, []);

  const handleRestore = async (userId: string) => {
    await restore("users", userId, auth.currentUser.uid);
  };

  const handlePermanentDelete = async (userId: string) => {
    if (confirm("PERMANENTLY delete? This cannot be undone!")) {
      await deleteDoc(doc(db, "users", userId));
    }
  };

  return (
    <div>
      <h1>Recovery Tool</h1>
      {deletedUsers.map((user) => (
        <div key={user.id}>
          <p>
            {user.name} ({user.email})
          </p>
          <p>Deleted: {user.deletedAt.toDate().toLocaleString()}</p>
          <Button onClick={() => handleRestore(user.id)}>Restore</Button>
          <Button onClick={() => handlePermanentDelete(user.id)}>
            Permanent Delete
          </Button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 **BACKUP RETENTION POLICY**

### **Daily Backups**

- Keep 30 days of daily backups
- Auto-delete backups older than 30 days
- Cloud Function runs nightly

### **Monthly Archives**

- Keep 1st of month backups indefinitely
- Stored in separate collection: `{collection}_archive_{YYYY_MM}`

### **Critical Document Backups**

- Signed documents: **7 years** (legal requirement)
- Employee docs: **3 years** (after termination)
- User data: **30 days** (GDPR compliance)

---

## ✅ **IMPLEMENTATION CHECKLIST**

- [ ] Add `deleted`, `deletedAt`, `deletedBy` fields to schemas
- [ ] Update all queries to filter `where('deleted', '==', false)`
- [ ] Create soft delete functions
- [ ] Create restore functions
- [ ] Update Firestore security rules
- [ ] Deploy Cloud Function for daily backups
- [ ] Create admin recovery tool
- [ ] Set up backup retention policy
- [ ] Test soft delete → restore flow
- [ ] Document for team

---

**Status**: Ready to implement  
**Next Step**: Add soft delete support to user management  
**Priority**: HIGH (data safety critical)
