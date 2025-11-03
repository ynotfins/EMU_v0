# Supe Version Bug Fix - Root Cause Analysis

## The Problem
- Chaser version works perfectly (distance, maps, profile)
- Supe version has multiple issues (no distance, maps say "no location data", profile hangs)
- New accounts were defaulting to "supe" instead of "chaser"

## Root Cause Found

### 1. Default Role Issue
In `app/login/page.tsx`, line 45 was setting default role to "supe":
```typescript
let userRole = "supe"; // Default to supe  ❌ WRONG
```

This caused:
- Existing users without a role to become Supes
- New users to be created as Supes during Google sign-in

### 2. Auth State Race Condition
In `components/role-layout.tsx`:
```typescript
const { data: profile } = useProfile(auth.currentUser?.uid);  // ❌ Can be null initially
```

This caused:
- Profile not loading properly for Supe pages
- Distance calculation failing because auth wasn't ready

## The Fixes Applied

### 1. Fixed Default Role (MAIN FIX)
```typescript
let userRole = "chaser"; // Default to chaser  ✅ CORRECT
```
Now all new users default to Chaser role

### 2. Fixed Auth State Handling
```typescript
const { data: profile } = useProfile();  // ✅ Let hook handle auth internally
```
The useProfile hook now properly waits for auth state

### 3. Centralized Config
Created `lib/config.ts` to ensure environment variables (like Google Maps API key) are properly available in the browser

## Manual Fix Required

For users who were incorrectly assigned "supe" role:

### Option 1: Firebase Console (Recommended)
1. Go to Firebase Console → Firestore → users collection
2. Find users with role: "supe" (except actual admins)
3. Change their role to "chaser"

### Option 2: Use Admin Page
1. Log in as super_admin (ynotfins@gmail.com)
2. Go to /admin
3. Change affected users from Supe to Chaser

## Why Chaser Worked But Supe Didn't

The Chaser version worked because:
- It's the default expected role
- Auth state initialization worked correctly
- No special permission checks blocking functionality

The Supe version failed because:
- Auth race condition prevented proper initialization
- Profile loading hung waiting for auth.currentUser
- Distance calculation never started because profile never loaded

## Verification Steps

1. Create a new account - should default to Chaser ✅
2. Chaser account - distance/maps/profile work ✅
3. Supe account - distance/maps/profile now work ✅
4. Super admin can switch between views ✅

The core issue was the incorrect default role combined with auth state race conditions specific to how Supe pages were loading.
