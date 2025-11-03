# EMU Alerts - Manual Test Plan

## Overview

This test plan covers all 13 screenshots and ensures all features work correctly, including merged scrollable pages.

---

## Test Environment Setup

1. Run app in development mode: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Open browser console to check for errors
4. Test on both desktop and mobile viewports

---

## Test Cases

### 1. Login Page
**Screenshot**: `Profile.png` (shows login)
**Route**: `/login`

**Test Steps**:
1. Navigate to `/login`
2. Verify Emergency Alerts logo displays correctly
3. Verify login form is present
4. Enter credentials and submit
5. Verify redirect to `/role`

**Expected Results**:
- Logo renders at correct size
- Form fields are accessible
- Submit triggers navigation

---

### 2. Role Selection
**Route**: `/role`

**Test Steps**:
1. After login, verify redirect to `/role`
2. Verify role selection UI appears
3. Select "Chaser" role
4. Verify redirect to `/chaser/incidents`

**Expected Results**:
- Role selection works
- Redirect to correct dashboard

---

### 3. Incidents List (Home)
**Screenshot**: `Home.png`
**Route**: `/chaser/incidents` or `/supe/incidents`

**Test Steps**:
1. Verify filter bar displays at top
2. Test distance chips (5mi, 10mi, 25mi, 50mi, All)
3. Test type badges (Fire, Flood, Storm, Other)
4. Test keyword search input
5. Test high alert toggle and sound selection
6. Verify incident list displays below filters
7. Test favorite (star) icon on incident
8. Test bookmark icon on incident
9. Click incident to navigate to details

**Expected Results**:
- All filters work and update list
- High alert toggle shows sound dropdown
- Incident items show correct data (number, type, address, status, priority)
- Icons toggle state on click
- Bottom navigation shows correct active tab

---

### 4. Incident Details - Details Tab
**Screenshot**: `Details.png`
**Route**: `/chaser/incident/[id]?tab=details`

**Test Steps**:
1. Click incident from list
2. Verify Details tab is active by default
3. Verify map card displays with address
4. Verify "Respond" button is present
5. Verify updates timeline displays
6. Verify notes editor is present
7. Test adding a note
8. Test tab navigation (Details, Homeowner, Docs, Sign)

**Expected Results**:
- Map placeholder shows with correct address
- Respond button is clickable
- Updates show in chronological order
- Notes can be typed and saved
- Tabs switch content correctly

---

### 5. Incident Details - Homeowner Tab (Merged Page)
**Screenshots**: `Homeowner_tab.png`, `Homeowner2.png` (same page, scrollable)
**Route**: `/chaser/incident/[id]?tab=homeowner`

**Test Steps**:
1. Click "Homeowner" tab
2. Verify all three sections display:
   - Contact Information (homeowner name, contact person, phone, email, property address)
   - Insurance Information (incident date, policy number, carrier name, claims phone)
   - Incident Details (damage description, adjuster name, adjuster phone, additional notes)
3. Scroll down to verify all fields are present
4. Fill out form fields
5. Click "Save Homeowner Information"
6. Verify success feedback

**Expected Results**:
- All fields from both screenshots are present in one scrollable page
- Required field (homeowner name) shows validation
- Save button triggers action
- Form data persists

---

### 6. Incident Details - Docs Tab
**Screenshot**: `Docs.png`
**Route**: `/chaser/incident/[id]?tab=docs`

**Test Steps**:
1. Click "Docs" tab
2. Verify "Capture Photo" button
3. Verify "Upload Document" button
4. Test file upload (if possible in dev)
5. Verify file list displays
6. If supe role, verify delete button appears on files
7. If chaser role, verify no delete button

**Expected Results**:
- Upload buttons are present
- File list shows uploaded files with names, types, dates
- Delete button only visible for supes
- File actions trigger appropriate handlers

---

### 7. Incident Details - Sign Tab (Merged Page)
**Screenshots**: `eSign.png`, `eSign2.png` (same page, scrollable)
**Route**: `/chaser/incident/[id]?tab=sign`

**Test Steps**:
1. Click "Sign" tab
2. Verify "Send for E-Sign" section at top:
   - Document checkboxes
   - Recipient email input
   - "Send for E-Sign" button
3. Verify "Sign Live" section:
   - Document checkboxes
   - "Sign Live" button
4. Scroll down to verify "Signature History" section:
   - List of sent packets
   - Status badges (Completed, Pending, Declined)
   - Timestamps
5. Test selecting documents and clicking buttons

**Expected Results**:
- All sections from both screenshots are present in one scrollable page
- Document selection works
- Email input validates
- Buttons trigger appropriate actions
- Signature history displays with correct status colors

---

### 8. Favorites Page
**Screenshot**: `Favorites.png`
**Route**: `/chaser/favorites` or `/supe/favorites`

**Test Steps**:
1. Navigate to Favorites via bottom nav
2. Verify three tabs: Starred, Bookmarks, Notes
3. Test tab switching
4. Verify starred incidents display in Starred tab
5. Verify bookmarked items display in Bookmarks tab
6. Verify saved notes display in Notes tab
7. Test empty states if no items

**Expected Results**:
- Tabs persist via query param `?tab=starred|bookmarks|notes`
- Each tab shows correct filtered content
- Empty states display when no items
- Bottom navigation shows Favorites as active

---

### 9. Chat - Thread List
**Screenshot**: `Chat_tab.png`
**Route**: `/chaser/chat` or `/supe/chat`

**Test Steps**:
1. Navigate to Chat via bottom nav
2. Verify thread list displays
3. Verify thread types show correct icons (team, incident, DM)
4. Verify last message preview
5. Verify timestamps
6. Click thread to open chat room

**Expected Results**:
- All threads display with correct metadata
- Icons match thread type
- Timestamps are formatted correctly
- Click navigates to `/chat/[threadId]`

---

### 10. Chat - Message Room
**Route**: `/chaser/chat/[threadId]` or `/supe/chat/[threadId]`

**Test Steps**:
1. Open a thread from list
2. Verify messages display in chronological order
3. Verify current user messages align right (blue)
4. Verify received messages align left (white/gray)
5. Verify message input bar at bottom
6. Type message and click send
7. Verify message appears in list

**Expected Results**:
- Messages display in iOS-style bubbles
- Alignment and colors match sender
- Input bar is fixed at bottom
- Send button triggers message send
- New message appears immediately

---

### 11. Profile Page (Merged Page)
**Screenshots**: `Profile1.png`, `Profile2.png`, `Profile_Emergency_Section.png` (same page, scrollable)
**Route**: `/chaser/profile` or `/supe/profile`

**Test Steps**:
1. Navigate to Profile via bottom nav
2. Verify all sections display in order:
   - Profile Header (avatar, name, role badges)
   - Stats Cards (responded, noted, days active)
   - ID Verification Card
   - Preferences Card (push notifications, location tracking toggles)
   - Emergency Payment Card (CashApp, Venmo inputs - collapsible)
   - Help & Legal Card (links)
   - Sign Out button
3. Scroll down to verify all sections are present
4. Test ID upload button
5. Test preference toggles
6. Test emergency payment section expand/collapse
7. Test sign out button

**Expected Results**:
- All sections from all three screenshots are present in one scrollable page
- Avatar displays correctly
- Stats show correct numbers
- ID verification shows appropriate message based on status
- Toggles work and trigger actions
- Emergency payment section is disabled until ID verified
- Sign out triggers logout

---

### 12. Supervisor Map
**Screenshot**: `Map.png`
**Route**: `/supe/map`

**Test Steps**:
1. Login as supe role
2. Navigate to Map via bottom nav
3. Verify map placeholder displays
4. Verify active responder list displays
5. Verify responder status badges (Active, Responding, Idle)
6. Verify last update timestamps

**Expected Results**:
- Map placeholder shows with correct dimensions
- Responder list displays with names and statuses
- Status badges have correct colors
- Bottom navigation shows Map as active (supe only)

---

### 13. Admin Dashboard
**Route**: `/admin`

**Test Steps**:
1. Login as admin role
2. Verify redirect to `/admin`
3. Verify user management table displays
4. Verify columns: Name, Email, Role, Verified, Actions
5. Test role badge colors
6. Test verification toggle (if interactive)

**Expected Results**:
- Table displays all users
- Role badges show correct colors
- Verified status shows checkmark or toggle
- Admin has no bottom navigation

---

### 14. Search Page
**Screenshot**: `Search.png`
**Route**: Not yet implemented

**Test Steps**:
1. If search route exists, navigate to it
2. Verify search input
3. Test search functionality

**Expected Results**:
- Search input is present
- Search filters incidents/content
- Results display correctly

**Note**: If not implemented, add to TODO list.

---

### 15. Notifications Page
**Screenshot**: `Notifications.png`
**Route**: Not yet implemented

**Test Steps**:
1. If notifications route exists, navigate to it
2. Verify notification list displays
3. Test notification types (alert, message, incident update)
4. Test mark as read

**Expected Results**:
- Notifications display in chronological order
- Unread notifications are highlighted
- Click marks as read

**Note**: If not implemented, add to TODO list.

---

## High Alert Audio Test

**Feature**: High alert toggle with sound selection
**Location**: Filter bar on incidents list

**Test Steps**:
1. Navigate to `/chaser/incidents`
2. Click high alert toggle
3. Verify sound dropdown appears
4. Select a sound (Siren, Bell, Chime)
5. Verify selection persists
6. Toggle off and verify sound stops

**Expected Results**:
- Toggle shows sound dropdown when enabled
- Sound selection works
- Audio plays when high priority incident arrives (mock)
- Mute button appears when audio is playing

---

## Responsive Design Tests

**Test on Multiple Viewports**:
1. Mobile (375px width)
2. Tablet (768px width)
3. Desktop (1440px width)

**Verify**:
- Bottom navigation is fixed at bottom on mobile
- Layouts adapt to screen size
- Text is readable at all sizes
- Touch targets are at least 44px on mobile
- No horizontal scrolling

---

## Accessibility Tests

**Keyboard Navigation**:
1. Tab through all interactive elements
2. Verify focus states are visible
3. Verify Enter/Space activate buttons
4. Verify Escape closes modals

**Screen Reader**:
1. Test with screen reader (VoiceOver, NVDA, JAWS)
2. Verify all images have alt text
3. Verify form labels are associated
4. Verify ARIA roles are correct

**Color Contrast**:
1. Verify text meets WCAG AA standards (4.5:1 for normal text)
2. Test in dark mode if implemented

---

## Performance Tests

1. Check Lighthouse score (aim for 90+ on all metrics)
2. Verify no console errors
3. Verify no memory leaks (check DevTools Memory tab)
4. Test with slow 3G network throttling

---

## Cross-Browser Tests

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

---

## Test Completion Checklist

- [ ] All 13 screenshots mapped to routes
- [ ] All merged pages verified (Profile, Homeowner, E-Sign)
- [ ] All filters and toggles work
- [ ] All forms submit correctly
- [ ] All navigation works
- [ ] High alert audio tested
- [ ] Responsive design verified
- [ ] Accessibility checks passed
- [ ] No console errors
- [ ] All roles tested (chaser, supe, admin)

---

## Known Issues / TODOs

Document any issues found during testing:

1. Search page not yet implemented
2. Notifications page not yet implemented
3. Google Maps integration pending (showing placeholders)
4. Firebase integration pending (using mock data)
5. Push notifications not yet functional
6. E-signature provider integration pending
