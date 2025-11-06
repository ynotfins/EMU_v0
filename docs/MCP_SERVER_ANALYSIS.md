# MCP Server Analysis & SDK Work Plan

**Date**: 2025-01-05  
**Status**: Active Analysis  
**Purpose**: Determine MCP server availability and SDK work priorities

---

## ✅ Available MCP Servers

### 1. Firebase MCP Server ✅ **ACTIVE**
**Status**: Configured and available  
**Resources Found**: 6 initialization guides

**Available Tools**:
- ✅ Firestore query/modify operations
- ✅ Realtime Database operations
- ✅ Auth users/claims management
- ✅ FCM push notifications
- ✅ Security Rules validation
- ✅ Crashlytics/Functions logs
- ✅ Remote Config management
- ✅ Project/app management

**Resources**:
- `firebase://guides/init/backend`
- `firebase://guides/init/ai`
- `firebase://guides/init/firestore`
- `firebase://guides/init/firestore_rules`
- `firebase://guides/init/auth`
- `firebase://guides/init/hosting`

**Can Help With**:
1. ✅ **Firestore Schema Discovery** - Query collections, sample documents
2. ✅ **Rules Validation** - Validate Firestore/Storage/RTDB rules
3. ✅ **Auth Operations** - Manage users, custom claims, roles
4. ✅ **FCM Testing** - Send test notifications, manage topics
5. ✅ **Logs & Debugging** - Pull Functions/Crashlytics logs
6. ✅ **SDK Configuration** - Verify project/app configs

---

### 2. Context7 MCP Server ❓ **UNKNOWN**
**Status**: Need to verify availability  
**Expected Tools**:
- Library documentation fetching
- API documentation lookup
- Latest version checking

**Action Required**: Check if Context7 MCP server is configured in Cursor

---

### 3. Browser Automation / Chrome DevTools ❌ **DISABLED**
**Status**: Installed but currently disabled  
**Tools**:
- Browser navigation
- DOM inspection
- Screenshot capture
- Network monitoring
- Console access

**Action Required**: Enable if needed for E2E testing or debugging

---

## 🔧 SDK Work That Can Benefit from Firebase MCP

### **Priority 1: Schema Discovery & Type Generation**

**Use Firebase MCP To**:
1. Query Firestore collections (`incidents`, `users`, `independent_contractors`)
2. Sample document structures
3. Generate TypeScript types matching actual data
4. Create Zod validators
5. Generate Firestore converters

**Current State**:
- ✅ Firebase Client SDK initialized (`src/lib/firebase-client.ts`)
- ✅ Firebase Admin SDK initialized (`src/lib/firebase-admin.ts`)
- ⚠️ Types may not match actual Firestore schema
- ⚠️ Some fields may be missing from type definitions

**Action**:
```bash
# Use MCP to:
1. List all collections via Firebase MCP
2. Sample 5-10 documents from each collection
3. Generate TypeScript interfaces
4. Update src/types/extended-domain.d.ts
```

---

### **Priority 2: Security Rules Validation**

**Use Firebase MCP To**:
1. Fetch current Firestore rules
2. Validate rules syntax
3. Test read/write permissions
4. Identify security gaps
5. Propose least-privilege updates

**Current State**:
- ✅ `firebase-rules/firestore.rules` exists
- ✅ `firebase-rules/storage.rules` exists
- ✅ `firebase-rules/database.rules.json` exists
- ⚠️ Rules may not be fully tested
- ⚠️ Custom claims integration may be incomplete

**Files**:
- `firebase-rules/firestore.rules` (46 lines)
- `firebase-rules/storage.rules` (54 lines)
- `firebase-rules/database.rules.json` (46 lines)

**Action**:
```bash
# Use MCP firebase_validate_security_rules tool:
1. Validate firestore.rules
2. Validate storage.rules
3. Validate database.rules.json
4. Test with different user roles (chaser, supe, admin)
5. Verify custom claims work correctly
```

---

### **Priority 3: Auth Custom Claims Management**

**Use Firebase MCP To**:
1. List all users with custom claims
2. View current claim structure
3. Update claims for testing
4. Verify claim propagation

**Current State**:
- ✅ Custom claims used in middleware (`src/middleware.ts`)
- ✅ Claims set in `FirebaseAuthService.setCustomClaims()`
- ⚠️ May need to verify claims are properly set
- ⚠️ Need to test claim-based access control

**Action**:
```bash
# Use MCP firebase_auth_get_users tool:
1. List users with custom claims
2. Verify role claims are set correctly
3. Test claim-based rules
4. Update claims for testing scenarios
```

---

### **Priority 4: FCM Configuration & Testing**

**Use Firebase MCP To**:
1. Verify FCM is configured
2. List FCM topics
3. Send test notifications
4. Verify device tokens

**Current State**:
- ✅ Messaging initialized in `firebase-client.ts`
- ✅ Notification service exists (`src/infrastructure/services/notification.service.ts`)
- ⚠️ FCM topics may not be configured
- ⚠️ Push notifications may need testing

**Action**:
```bash
# Use MCP firebase_messaging_send_message tool:
1. Send test notification to a token
2. Create topics for incidents
3. Test notification routing
4. Verify notification delivery
```

---

### **Priority 5: Firestore Indexes**

**Use Firebase MCP To**:
1. List current indexes
2. Identify missing indexes
3. Verify query performance

**Current State**:
- ✅ Queries use `limit()` to prevent high costs
- ⚠️ May need composite indexes for:
  - `incidents` collection (status + createdAt)
  - `incidents` collection (location.geohash + createdAt)
  - `users` collection (role + isActive)

**Action**:
```bash
# Use Firebase MCP to:
1. List all indexes
2. Identify queries that need indexes
3. Generate index creation commands
```

---

## 🎯 Immediate Actions Plan

### **Step 1: Fix Build Error** (5 min)
- ✅ Remove unused `interfaces` import from `container.ts`
- ✅ Verify build succeeds

### **Step 2: Use Firebase MCP for Schema Discovery** (30 min)
1. Query Firestore collections via MCP
2. Sample documents
3. Generate updated TypeScript types
4. Update `src/types/extended-domain.d.ts`

### **Step 3: Validate Security Rules** (20 min)
1. Use `firebase_validate_security_rules` tool
2. Test with different roles
3. Fix any validation errors
4. Document rule coverage

### **Step 4: Verify Auth Claims** (15 min)
1. List users with claims
2. Verify role claims
3. Test claim-based access

### **Step 5: Test FCM** (15 min)
1. Send test notification
2. Verify delivery
3. Test topics

---

## 📋 SDK Work Checklist

### **Firebase Client SDK** ✅
- [x] Initialize Firebase app
- [x] Configure Auth with persistence
- [x] Configure Firestore with offline cache
- [x] Configure Storage
- [x] Configure Realtime Database (conditional)
- [x] Configure Messaging (conditional)
- [ ] Verify all services work correctly
- [ ] Test offline persistence
- [ ] Test multi-tab sync

### **Firebase Admin SDK** ✅
- [x] Initialize Admin app
- [x] Configure Auth
- [x] Configure Firestore
- [x] Configure Storage
- [x] Configure Realtime Database
- [x] Configure Messaging
- [ ] Verify all services work correctly
- [ ] Test custom claims
- [ ] Test server-side operations

### **Security Rules** ⚠️
- [x] Firestore rules defined
- [x] Storage rules defined
- [x] RTDB rules defined
- [ ] Rules validated via MCP
- [ ] Rules tested with different roles
- [ ] Custom claims tested in rules

### **Type Safety** ⚠️
- [x] Basic types defined
- [x] Extended domain types
- [x] TypeScript strict mode enabled
- [ ] Types match actual Firestore schema
- [ ] Types generated from live data

### **Testing** ❌
- [ ] Unit tests for SDK init
- [ ] Integration tests for queries
- [ ] E2E tests for auth flow
- [ ] E2E tests for real-time subscriptions

---

## 🚀 Recommended Next Steps

1. **Immediate**: Fix inversify import error
2. **Next**: Use Firebase MCP to discover Firestore schema
3. **Then**: Validate security rules via MCP
4. **Follow**: Test Auth claims and FCM
5. **Finally**: Generate types from live schema

---

## 📝 Notes

- Firebase MCP server is **fully configured** and ready to use
- Context7 MCP status needs verification
- Browser automation is available but disabled
- Priority should be on schema discovery and rules validation
- SDK work can be significantly accelerated using MCP tools

