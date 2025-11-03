# Fix for Existing Users with Wrong "Supe" Role

## The Problem
Some existing users were incorrectly assigned "supe" role and are experiencing:
- No distance calculations on home page
- Maps showing "no location data"
- Profile page hanging on "Loading profile..."

## The Fix for Existing Users

### Option 1: Firebase Console (Easiest)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select `emu-incidents` project
3. Go to Firestore Database
4. Navigate to `users` collection
5. Find users with `role: "supe"`
6. Click on each document
7. Edit the `role` field from `"supe"` to `"chaser"`
8. Save the changes

### Option 2: Admin Page (If Available)
1. Log in as super_admin (ynotfins@gmail.com)
2. Go to https://4axe.com/admin
3. Find the affected users
4. Change their role from Supe to Chaser
5. Save changes

## Which Users to Fix?

Change role from "supe" to "chaser" for everyone EXCEPT:
- ynotfins@gmail.com (should be "super_admin")
- Any other designated admin emails

## After the Fix

Users will need to:
1. Log out (if logged in)
2. Log back in
3. They'll now see distance calculations
4. Maps will work properly
5. Profile will load immediately

## Going Forward

All new accounts will correctly default to "chaser" role. Only promote users to "supe" role through the admin panel when needed.
