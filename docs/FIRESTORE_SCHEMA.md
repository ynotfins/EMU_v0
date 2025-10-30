# 🗄️ NFA Alerts Firestore Database Structure

Complete reference for all Firestore collections and their schemas.

---

## 📊 **COLLECTIONS OVERVIEW**

### **Core Collections**
1. `users` - User profiles and authentication
2. `incidents` - Fire alerts and emergencies
3. `favorites` - User favorites metadata
4. `bookmarks` - User bookmarks metadata
5. `files` - Uploaded files and documents
6. `responses` - Alert response tracking
7. `notifications` - System notifications

### **CRM Collections**
8. `employee_docs` - Employee documents (IDs, certifications)
9. `signed_documents` - eSign completed documents
10. `signed_docs_backup` - Backup of signed documents

### **Chat Collections** (Firebase Realtime Database)
- `incident-chats` - Group chats for incidents
- `direct-chats` - 1-on-1 direct messages

---

## 📁 **COLLECTION SCHEMAS**

### 1. `users`
```typescript
{
  id: string;                    // Firebase Auth UID
  email: string;                 // User email
  name: string;                  // Display name
  role: 'super_admin' | 'admin' | 'supe' | 'chaser';
  createdAt: Timestamp;
  lastSeen?: Timestamp;
  fcmToken?: string;             // For push notifications
  location?: {                   // Last known location
    lat: number;
    lng: number;
    updatedAt: Timestamp;
  };
}
```

### 2. `incidents`
```typescript
{
  id: string;
  incidentNumber: number;        // Display ID (e.g., 1000001)
  type: string;                  // "Structure Fire", etc.
  address: string;
  city: string;
  county: string;
  state: string;
  message: string;
  lat?: number;
  lng?: number;
  highAlert?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Metadata
  updates?: Array<{
    id: string;
    ts: number;
    stage: string;
    message: string;
    title?: string;
    address?: string;
  }>;
  
  notes?: Array<{
    id: string;
    text: string;
    createdBy: string;
    createdAt: Timestamp;
  }>;
}
```

### 3. `favorites`
```typescript
{
  userId: string;
  incidentId: string;
  createdAt: Timestamp;
}
// Composite index: userId + incidentId
```

### 4. `bookmarks`
```typescript
{
  userId: string;
  incidentId: string;
  createdAt: Timestamp;
}
// Composite index: userId + incidentId
```

### 5. `files`
```typescript
{
  id: string;
  incidentId: string;
  fileName: string;
  fileUrl: string;               // Cloud Storage URL
  uploadedBy: string;            // User ID
  uploadedAt: Timestamp;
  fileSize?: number;
  mimeType?: string;
}
```

### 6. `responses`
```typescript
{
  id: string;
  incidentId: string;
  userId: string;
  userName: string;
  userRole: string;
  incidentAddress: string;
  respondedAt: Timestamp;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### 7. `notifications`
```typescript
{
  id: string;
  userId: string;                // Recipient
  type: 'alert_response' | 'new_incident' | 'system';
  title: string;
  message: string;
  incidentId?: string;
  responderName?: string;
  read: boolean;
  createdAt: Timestamp;
}
```

### 8. `employee_docs` ⭐ NEW
```typescript
{
  id: string;
  userId: string;                // Employee ID
  userName: string;
  documentType: 'id_front' | 'id_back' | 'certification' | 'other';
  fileName: string;
  fileUrl: string;               // Cloud Storage URL
  uploadedBy: string;            // Admin who uploaded
  uploadedAt: Timestamp;
  expiresAt?: Timestamp;         // For certifications
  verified: boolean;             // Admin verification status
  verifiedBy?: string;
  verifiedAt?: Timestamp;
  notes?: string;
}
```

### 9. `signed_documents` ⭐ NEW
```typescript
{
  id: string;
  documentName: string;
  documentType: 'customer_esign' | 'employee_esign' | 'contract';
  originalFileUrl: string;       // Template/original doc
  signedFileUrl: string;         // Signed PDF
  
  // Signers
  signers: Array<{
    name: string;
    email: string;
    role: 'customer' | 'employee' | 'witness';
    signedAt?: Timestamp;
    ipAddress?: string;
    signature?: string;          // Base64 signature image
  }>;
  
  // Metadata
  sentBy: string;                // User ID who sent
  sentAt: Timestamp;
  completedAt?: Timestamp;
  status: 'pending' | 'partially_signed' | 'completed' | 'cancelled';
  
  // Related entities
  incidentId?: string;           // If related to incident
  customerId?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 10. `signed_docs_backup` ⭐ NEW
```typescript
{
  id: string;                    // Same as signed_documents ID
  backupDate: Timestamp;
  originalDocId: string;
  
  // Full copy of signed document data
  ...all fields from signed_documents...
  
  backupVersion: number;         // Incremental backup number
  backupReason: 'auto' | 'manual' | 'scheduled';
}
```

---

## 🔒 **SECURITY RULES**

### **Current Rules**
- All collections require authentication (`auth != null`)
- Users can only access their own data
- Admins/Supes have elevated access

### **Recommended Rules for New Collections**

```javascript
// employee_docs
match /employee_docs/{docId} {
  // Employees can read their own docs
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid ||
     isAdmin() || isSupe());
  
  // Only admins/supes can upload employee docs
  allow create, update: if isAdmin() || isSupe();
  
  // Only super_admins can delete
  allow delete: if isSuperAdmin();
}

// signed_documents
match /signed_documents/{docId} {
  // Users can read docs they're involved in
  allow read: if request.auth != null && 
    (resource.data.sentBy == request.auth.uid ||
     userIsSignerInDoc(resource.data) ||
     isAdmin());
  
  // Admins and supes can create/send docs
  allow create: if isAdmin() || isSupe();
  
  // System can update (for signatures)
  allow update: if request.auth != null;
  
  // Only super_admins can delete
  allow delete: if isSuperAdmin();
}

// signed_docs_backup
match /signed_docs_backup/{backupId} {
  // Read-only for admins/supes
  allow read: if isAdmin() || isSupe();
  
  // System-only writes (automated backups)
  allow write: if isSuperAdmin();
}
```

---

## 📊 **INDEXES NEEDED**

### **Existing Indexes**
- `incidents`: `createdAt` (desc)
- `favorites`: `userId`, `incidentId`
- `bookmarks`: `userId`, `incidentId`
- `responses`: `userId`, `respondedAt` (desc)
- `notifications`: `userId`, `read`, `createdAt` (desc)

### **New Indexes Needed**
```json
{
  "indexes": [
    {
      "collectionGroup": "employee_docs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "uploadedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "signed_documents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "sentAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "signed_documents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "incidentId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🔄 **BACKUP STRATEGY**

### **Automatic Backups**
- `signed_documents` → `signed_docs_backup` (on every completion)
- Triggered by Cloud Function when `status` changes to `completed`
- Backup includes full document data + timestamp

### **Backup Function (Pseudocode)**
```typescript
// Cloud Function trigger
export const backupSignedDocument = functions.firestore
  .document('signed_documents/{docId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    
    // Backup when document is completed
    if (newData.status === 'completed' && oldData.status !== 'completed') {
      const backupData = {
        ...newData,
        id: context.params.docId,
        originalDocId: context.params.docId,
        backupDate: admin.firestore.FieldValue.serverTimestamp(),
        backupVersion: await getNextBackupVersion(context.params.docId),
        backupReason: 'auto',
      };
      
      await admin.firestore()
        .collection('signed_docs_backup')
        .add(backupData);
      
      console.log(`✅ Backed up signed document: ${context.params.docId}`);
    }
  });
```

---

## 📝 **USAGE EXAMPLES**

### **Employee Docs**
```typescript
// Upload employee ID (front)
await addDoc(collection(db, 'employee_docs'), {
  userId: employee.id,
  userName: employee.name,
  documentType: 'id_front',
  fileName: 'drivers_license_front.jpg',
  fileUrl: storageUrl,
  uploadedBy: currentUser.id,
  uploadedAt: serverTimestamp(),
  verified: false,
});

// Query employee's docs
const q = query(
  collection(db, 'employee_docs'),
  where('userId', '==', employeeId),
  orderBy('uploadedAt', 'desc')
);
```

### **Signed Documents**
```typescript
// Create eSign request
await addDoc(collection(db, 'signed_documents'), {
  documentName: 'Service Agreement',
  documentType: 'customer_esign',
  originalFileUrl: templateUrl,
  signers: [
    { name: 'John Customer', email: 'john@example.com', role: 'customer' },
    { name: 'Jane Supe', email: 'jane@nfa.com', role: 'employee' },
  ],
  sentBy: currentUser.id,
  sentAt: serverTimestamp(),
  status: 'pending',
  incidentId: incident.id,
  createdAt: serverTimestamp(),
});

// Query pending signatures
const q = query(
  collection(db, 'signed_documents'),
  where('status', '==', 'pending'),
  orderBy('sentAt', 'desc')
);
```

---

**Last Updated**: October 30, 2025  
**Status**: Production Ready ✅  
**Collections**: 10 total (7 existing + 3 new CRM collections)

