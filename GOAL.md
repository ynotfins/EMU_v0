# 🎯 EMU Alerts - Complete Product Goal & Feature Specification

## Product Vision

EMU Alerts is an emergency incident response system that connects field responders (Chasers) with supervisors (Supes) for fire and emergency incidents. The system provides real-time alerts, location tracking, communication, and documentation management.

---

## 📱 User Roles

### Chaser (Field Responder)
Independent contractors who respond to emergency incidents, document damage, and coordinate with supervisors.

### Supe (Supervisor)  
Manages team, monitors all incidents, tracks chaser locations, and handles business operations.

### Admin
System management, user verification, and oversight.

---

## 🗂️ Application Structure

### Bottom Navigation (4 Tabs)

```
┌─────────────────────────────────────────┐
│  Home  |  Favorites  |  Chat  | Profile │
│   🏠   |     ⭐      |   💬   |   👤    │
└─────────────────────────────────────────┘
```

**For Chasers:**
- Home, Favorites, Chat, Profile

**For Supes:**  
- Home, Favorites, Chat, Supe (profile shows "Supe" label)

---

## 📄 Page-by-Page Breakdown

---

## 1️⃣ **HOME PAGE** (`/chaser/incidents` or `/supe/incidents`)

### What It Is
The main incidents list showing all active fire alerts. This is the landing page after login.

### Header Elements

#### Left Side:
- **App Icon** (Helmet/EMU Logo)
- **Title**: "FIRE ALERTS"

#### Right Side (Top Row):
- **🤏 Collapse Button**: Hides/shows filter bar to save screen space
- **HIGH ALERT Button**: 
  - **When OFF** (gray): Shows all incidents
  - **When ON** (red with squiggly lines): Only shows high-priority incidents
  - Tap to toggle on/off
- **Live Map Button** (blue):
  - Opens `/chaser/map` or `/supe/map`
  - Shows last 10 incidents on interactive Google Map
  - User can pinch to zoom in/out

### Filter Bar (Collapsible)

**Row 1: Search & Distance**
- **Search Box**: Type keywords to filter by address, message, type
- **Distance Dropdown**: Filter by distance from your location
  - Options: 5mi, 10mi, 25mi, 50mi, 100mi, Any
  - Requires location permission
  - Shows actual distance on each incident

**Row 2: Type Filters**
- **Fire Button**: Toggle fire incidents
- **Accident Button**: Toggle accident incidents  
- **Hazard Button**: Toggle hazard incidents
- **Medical Button**: Toggle medical incidents
- **Other Button**: Toggle other incident types
- Can select multiple types

**Row 3: Advanced Filters**
- **Updates Dropdown**: Filter by number of updates
  - Options: Any, 1+, 2+, 3+, 5+
- **Sound Selector**: Choose high-alert sound effect
  - 8 different sounds available
- **Mute Toggle**: Mute all alert sounds

**Sort Button** (if location enabled):
- **Default**: Sort by time (newest first)
- **Distance Mode**: Sort by closest first
  - Shows only last 4 hours when sorting by distance
  - Button animates red/white when active

### Incidents List

Each incident shows:
- **Alert ID Badge** (top left): #NFA-1835458
- **Type Icon** (based on incident type)
- **Distance Badge** (if location enabled): "2.3 mi"
- **Title/Address**: "321 Lyons Ave"
- **Location**: "Newark, Essex, NJ"
- **Initial Message**: "Battalion 4 reports all visible fire knocked down..."
- **Timestamp**: "11/3/2025, 9:29:23 PM"
- **Updates Count** (if > 0): Shows number of additional updates
- **Action Buttons**:
  - ⭐ **Heart Icon** (top right): Add to favorites (turns red when favorited)
  - 🔖 **Bookmark Icon**: Bookmark for later (turns blue when bookmarked)
  - 🔇 **Bell Icon**: Silence this specific incident's notifications
  - 👁️ **Hide Icon**: Temporarily hide from list (can unhide via banner)

**Tap anywhere on incident card** → Opens detail page

### Special Features

**Hidden Incidents Banner** (if any hidden):
- Shows count: "3 alerts hidden"
- **Show All button**: Unhides all incidents

**Location Permission Banner** (if denied):
- Red banner at top
- Explains location needed for distance calculations
- Link to browser settings

---

## 2️⃣ **DETAIL PAGE** (`/chaser/incident/[id]` or `/supe/incident/[id]`)

### Header
- **← Back Button**: Returns to home page
- **Title**: "NFA Alert Details"
- **⋮ Menu**: (Future: more options)

### Tab Structure (5 Tabs)

```
┌────────────────────────────────────────────────┐
│ Details │ Homeowner │ Docs │ eSign │ Chat    │
└────────────────────────────────────────────────┘
```

---

### TAB 1: Details

#### Map Section (Top)
- **Interactive Google Maps Embed**
  - Shows incident location
  - Zoom level: 12 (city view)
  - Address: Encoded from incident data
  - Map is clickable (opens Google Maps navigation for Chasers)
  
**Chaser Version**:
- **"Respond to Alert" Button** (green, appears twice):
  - Top center of map
  - Bottom center of map
  - **Action**: Opens Google Maps navigation in new tab AND records response

**Supe Version**:
- No respond button (Supes don't respond to alerts)

- **Alert ID Badge** (bottom left): #NFA-1835458

#### Incident Information
- **Type**: "Working Fire" (large heading)
- **Heart Icon** (top right): Favorite this incident
- **Address**: "321 Lyons Ave" (bold)
- **Location**: "NY, Essex, Newark" (gray text)

#### Updates Section
**If updates exist:**
- **Heading**: "Updates (4)" (shows count)
- Each update shows:
  - **Stage Badge**: "🆕 Initial Alert" or "[DOC] Update"
  - **Update Number**: #4, #3, #2, #1 (reverse chronological)
  - **Timestamp**: "11/3/2025, 9:29:23 PM"
  - **Title** (if different from stage)
  - **Message**: Full update text
  - **Location** (if address in update): [LOC] address
  - **Color coding**: Blue for initial, gray for updates

**If no updates:**
- Shows initial alert message
- Gray box with timestamp and message
- Text: "No updates yet for this incident"

#### Employee Notes Section
- **Heading**: "Employee Notes (auto-saves)"
- **Text Area**:
  - Placeholder: "Add your notes about this alert... (saves automatically when you leave this field)"
  - **Auto-save behavior**: Saves when you click/tap outside the box (onBlur)
  - Clears text after successful save
  
**Saved Notes Display** (if any exist):
- **Heading**: "Saved Notes (2)"
- Each note shows:
  - **Timestamp**: "11/3/2025, 10:15 PM • Tony" (who created it)
  - **Note Text**: Full note content
  - **Blue box** with left border

**How Notes Tab Works**:
- When you save a note here, the incident appears in **Favorites → Notes tab**
- Notes tab shows ALL incidents that have at least one note

---

### TAB 2: Homeowner

#### What It Does
Collects property owner information for insurance claims and documentation.

#### Form Fields

**Section 1: Contact Information**
- **Homeowner Name**: Text input
- **Contact Person**: Text input (if different from owner)
- **Phone**: Text input with formatting
- **Email**: Text input

**Section 2: Property Information**
- **Property Address**: Text input (can differ from incident address)
- **Additional Location Info**: Text area

**Section 3: Insurance Information**
- **Insurance Company Name**: Text input
- **Policy Number**: Text input
- **Claim Number**: Text input (filled after claim filed)
- **Carrier Name**: Dropdown selector
- **Claims Phone**: Text input
- **Deductible Amount**: Currency input

**Section 4: Incident Details**
- **Incident Date**: Date picker
- **Damage Description**: Text area
- **Adjuster Name**: Text input (insurance adjuster)
- **Adjuster Phone**: Text input

**Section 5: Additional Notes**
- **Notes**: Large text area for extra information

**Save Button** (bottom):
- Saves to Firestore under incident
- Links to CRM contact for this address
- Shows success/error toast

#### Data Flow to CRM
When homeowner form is saved:
1. Data saved to incident document
2. CRM contact updated/created for this address
3. Homeowner info linked to property location
4. Future incidents at same address pre-populate this data

---

### TAB 3: Docs

#### What It Does
Manage photos and documents for this incident.

#### Features

**Upload Section**:
- **"Pick File" Button**: Opens file picker
  - Can select photos, PDFs, documents
  - Uploads to Firebase Storage
  - Stores metadata in Firestore

**File List**:
- Shows all uploaded files
- Each file displays:
  - **File Name**: "damage-photo-1.jpg"
  - **File Type Icon**: 📄 PDF, 📷 Photo, 📁 Document
  - **Upload Date**: "11/3/2025"
  - **Uploaded By**: User who uploaded
  - **File Size**: "2.4 MB"
  - **Delete Button** (Supe only): Remove file

**Actions**:
- **Tap file**: Preview or download
- **Long press**: Show options menu

---

### TAB 4: eSign

#### What It Does
Handle electronic signatures for documents (waivers, agreements, work orders).

#### Two Signature Methods

**Method 1: Send for E-Signature**
- **Document Selector**: Choose which documents need signing
- **Recipient Email**: Enter homeowner's email
- **"Send for E-Sign" Button**: 
  - Sends document via e-signature provider
  - Tracks signature status (Pending, Sent, Signed, Rejected)
  - Notifies when signed

**Method 2: Live Signature on Device**
- **Signature Pad**: Draw signature with finger/stylus
- **"Clear" Button**: Start over
- **"Save Signature" Button**: 
  - Saves signature as image
  - Attaches to incident
  - Creates signed document

**Signature Status**:
- Shows all documents awaiting signature
- Status badges: Pending, Sent, Signed, Rejected

---

### TAB 5: Chat

#### What It Does
**Incident-specific group chat** with ALL Supes.

#### Chat Behavior

**When Chaser Opens Chat Tab**:
1. System checks if incident chat exists
2. If NOT exists:
   - Creates new chat thread
   - **Automatically adds ALL Supes as participants**
   - Chaser and ALL Supes can now message
3. If exists:
   - Opens existing conversation

**Message Display**:
- **Chaser's messages**: Right side, blue bubbles
- **Supe's messages**: Left side, gray bubbles
- **Timestamp**: Small text under each message
- **Read receipts**: (Future feature)

**Message Input** (bottom):
- **Text Field**: Type message here
- **Send Button** (blue): Send message to group
- **Attachment Icon**: (Future) Add photos/files

**Real-time Updates**:
- New messages appear instantly
- Uses Firebase Realtime Database
- No refresh needed
- Notification sound when new message arrives

---

## 3️⃣ **FAVORITES PAGE** (`/chaser/favorites` or `/supe/favorites`)

### Header
- **Title**: "Favorites"
- **← Back**: (Handled by bottom nav, no back button)

### Tab Structure (4 Tabs)

```
┌────────────────────────────────────────────┐
│ Favorites │ Bookmarks │ Notes │ Responses │
└────────────────────────────────────────────┘
```

---

### TAB 1: Favorites ⭐
Shows all incidents you've favorited (clicked heart icon).

**What You See**:
- List of incident cards (same format as home page)
- All incidents with heart icon filled red
- Same action buttons (unfavorite, bookmark, silence, hide)
- Tap to open detail page

**Empty State**:
- Heart icon (large, gray)
- Text: "No Favorites Yet"
- Message: "Tap the heart icon on any NFA Alert to add it to your favorites"
- **"Browse NFA Alerts" Button**: Returns to home page

---

### TAB 2: Bookmarks 🔖
Shows all incidents you've bookmarked.

**What You See**:
- List of incident cards
- All incidents with bookmark icon filled blue
- Same action buttons
- Tap to open detail page

**Empty State**:
- Bookmark icon (large, gray)
- Text: "No Bookmarks Yet"
- Message: "Tap the bookmark icon to save alerts for later"
- **"Browse NFA Alerts" Button**: Returns to home page

---

### TAB 3: Notes 📝
Shows all incidents where you've added notes.

**What You See**:
- List of incident cards
- Only shows incidents that have at least one saved note
- Same action buttons
- Tap to open detail page

**How It Works**:
1. Go to any incident Detail page
2. Add note in "Employee Notes" section
3. Click/tap outside the text box (auto-saves)
4. Incident immediately appears in this Notes tab

**Empty State**:
- Notes icon (large, gray)
- Text: "No Incidents with Notes Yet"
- Message: "Add notes to any incident's detail page to see them here"

---

### TAB 4: Responses 🧭 (Chaser Only)
Shows all incidents you've responded to.

**What You See**:
- List of incident cards
- All incidents where you clicked "Respond to Alert"
- Shows count in tab: "Responses (5)"
- Same action buttons
- Tap to open detail page

**How It Works**:
1. Open incident detail page
2. Click "Respond to Alert" button
3. System records your response
4. **Notifies ALL Supes automatically**
5. Incident appears in your Responses tab

**Empty State**:
- Navigation icon (large, gray)
- Text: "No Responses Yet"
- Message: "Respond to alerts to track your activity"

**Supe Version**:
- Shows incidents where ANY chaser responded
- Can see who responded and when

---

## 4️⃣ **CHAT PAGE** (`/chaser/chat` or `/supe/chat`)

### What It Is
Central hub for all conversations - incident chats and direct messages.

### Chat List View

**Thread Types**:

**1. Incident Chats** (Badge: "Incident Thread"):
- Created from incident detail page Chat tab
- Includes Chaser + ALL Supes
- **Group chat** - everyone sees all messages
- Shows incident address as thread title
- Shows last message preview
- Shows unread count badge

**2. Direct Messages**:
- **Chaser-to-Supe**: Private one-on-one
- **Chaser-to-Chaser**: Coordinate with other responders
- **Supe-to-Anyone**: Supes can message anyone
- Shows participant name as title
- Shows last message preview
- Shows unread count badge

**Thread List Items Show**:
- **Icon**: Message bubble or incident icon
- **Thread Title**: Incident address or participant name
- **Last Message**: Preview of most recent message
- **Timestamp**: When last message was sent
- **Unread Badge** (red number): Count of unread messages
- **Tap to open** → Full conversation

**Empty State**:
- Message icon (large, gray)
- Text: "No conversations yet"
- Message: "Start a chat from an incident or contact a team member"

---

## 5️⃣ **PROFILE PAGE** (Chaser: `/chaser/profile`, Supe: `/supe/profile`)

### Header
- **Avatar**: Circle with user initials, blue background
- **Name**: Full display name
- **Role Badge**: "CHASER" (green) or "SUPE" (blue)
- **Email**: User's email address

### Sections

#### Preferences Card
- **Push Notifications Toggle**:
  - When ON: Receive push notifications for new incidents
  - When OFF: No push notifications
  
- **Location Tracking Toggle** (Chaser only):
  - When ON: Shares GPS location with Supes every 30 seconds
  - When OFF: Location not shared
  - **Privacy Note**: "Only visible to supervisors when tracking enabled"

#### Emergency Payment Info (Chaser only)
- **Cash App Username**: Text input, prefilled if set
- **Venmo Username**: Text input, prefilled if set
- **Purpose**: Quick payment for emergency work
- **Save Button**: Updates profile

#### **Sign Out Button** (bottom):
- Red button
- Signs user out
- Returns to login page

---

### SUPE PROFILE - UNIQUE FEATURE: Live Team Map

#### Live Team Map Card (Top of profile, Supe only)

**What It Shows**:
- **Interactive Google Map** with team member pins
- **Heading**: "Live Team Map - Real-time locations of all users"
- **Online Count Badge** (green): "3 Online"

**Map Pins**:
- Each pin shows a **team member's current GPS location**
- **Pin Label**: User's first initial (e.g., "T" for Tony, "K" for Kristina)
- **Pin Color**: Blue
- **Tap pin**: Shows user name and last updated time

**Team Member List** (below map):
- **Heading**: "Team Members - 4 total"
- Shows all team members:
  - **Avatar**: Circle with initial
  - **Name**: "Tony", "Kristina", etc.
  - **Role**: "Chaser", "Supe"
  - **Status**: 
    - **"Online"** (green badge): Location updated < 5 minutes ago
    - **"Offline"** (gray badge): No recent location

**How It Works**:
1. Chasers enable "Location Tracking" in their profile
2. Their device sends GPS coordinates to Firestore every 30 seconds
3. Supe's map queries for users with location updated < 5 minutes ago
4. Map updates automatically (real-time)
5. Shows live movement as Chasers move around

**Privacy**:
- Only shows Chasers who enabled tracking
- Only shows recent locations (< 5 minutes)
- Chasers can disable anytime
- Location not stored long-term

---

## 6️⃣ **LIVE MAP PAGE** (`/chaser/map` or `/supe/map`)

### What It Is
Full-screen map showing the last 10 fire incidents from the past 4 hours.

### Header
- **Title**: "Live Map"
- **Refresh Button**: Manually refresh incident data

### Map Display

**Interactive Google Map**:
- **Center**: Average of all incident locations
- **Zoom**: Auto-adjusts to show all pins
- **Max Zoom**: Won't zoom closer than street level (15)

**Incident Pins**:
- **Red Pin** for each incident with coordinates
- **Pin Label**: Could show incident number or type
- **Tap Pin**: Shows info window:
  - Incident type
  - Address
  - Timestamp

**Filter** (built-in):
- Only shows incidents from last 4 hours
- Only shows incidents with valid lat/lng coordinates
- Excludes incidents still being geocoded

**"4 Hours" Badge** (top right):
- Small label showing time window
- Gray text on white background

**Alert Count Badge** (top left):
- Shows number of incidents: "8 alerts"
- Updates as incidents come in

---

## 7️⃣ **CHAT DETAIL PAGE** (`/chaser/chat/[threadId]` or `/supe/chat/[threadId]`)

### Header
- **← Back Button**: Return to chat list
- **Thread Title**: 
  - Incident chats: Incident address
  - Direct messages: Participant name

### Message Display

**Messages**:
- **Your messages**: Right side, blue bubbles
- **Other person's messages**: Left side, gray bubbles
- **Format**: 
  - Message text (14px font)
  - Timestamp below (12px, lighter)
- **Auto-scroll**: Newest message at bottom
- **Real-time**: New messages appear instantly

### Message Input (Bottom)

**Text Input**:
- **Field**: "Type a message..."
- **Behavior**: Expands as you type multi-line

**Send Button** (blue):
- Sends message to Firebase Realtime Database
- Clears input field
- Message appears in conversation instantly
- Other participants see it in < 1 second

**Notification**:
- Recipient gets push notification (if enabled)
- Unread badge updates
- Sound plays (if not muted)

---

## 🗺️ **How The Three Maps Work**

### Map #1: Incident Detail Map
- **Location**: Detail page → Details tab → Top section
- **Shows**: SINGLE incident location
- **Zoom**: 12 (city level - see surrounding streets)
- **Source**: Incident's `lat` and `lng` fields (geocoded server-side)
- **Interactive**: Yes (Chaser can click to open navigation)

### Map #2: Live Alert Map  
- **Location**: Accessed via "Live Map" button on home page
- **Shows**: Last 10 incidents from past 4 hours
- **Zoom**: Auto-adjusts to show all pins
- **Source**: All incidents with valid coordinates
- **Interactive**: Yes (pinch to zoom, tap pins for info)
- **Updates**: Real-time as new incidents arrive

### Map #3: Live Team Map
- **Location**: Supe profile page ONLY
- **Shows**: Real-time GPS locations of all signed-in Chasers
- **Zoom**: City-wide view to see team spread
- **Source**: User collection, `location.lastUpdated` field
- **Updates**: Every 30 seconds automatically
- **Privacy**: Only shows users who enabled tracking, only recent (< 5 min)

---

## 💬 **How Chat/Messaging Works**

### Scenario 1: Chaser Creates Incident Chat

**Steps**:
1. Chaser opens incident detail page
2. Taps **Chat tab**
3. System:
   - Queries `/users` collection for ALL users with `role: 'supe'`
   - Creates chat thread: `/incident-chats/{incidentId}`
   - **Adds Chaser + ALL Supes as participants automatically**
4. Chaser types message, hits send
5. **ALL Supes** see message in their Chat tab instantly
6. Any Supe can respond
7. It's a **GROUP CHAT** - everyone sees everyone's messages

**Example**:
```
Incident Chat: "321 Lyons Ave, Newark"
Participants: Kristina (Chaser) + Tony (Supe) + [Any other Supes]

Kristina: "On scene, heavy smoke showing"
Tony: "Copy that, need backup?"
Kristina: "Negative, under control"
```

### Scenario 2: Direct Message (Chaser to Supe)

**Steps**:
1. Chaser goes to Chat page
2. Taps **"New Message" button** or existing DM
3. Selects recipient from list (Supes or other Chasers)
4. System creates direct message thread: `/direct-messages/{threadId}`
5. Only those 2 participants see messages

**Example**:
```
Direct Message: Tony
Participants: Kristina (Chaser) + Tony (Supe)

Kristina: "Question about reimbursement form"
Tony: "Send me the receipt, I'll process it"
```

### Scenario 3: Chaser to Chaser

**Steps**:
1. Chaser wants to coordinate with another Chaser
2. Goes to Chat page
3. Starts direct message with another Chaser
4. Private conversation between the two
5. Supes don't see this conversation (it's private)

**Example**:
```
Direct Message: Joe
Participants: Kristina (Chaser) + Joe (Chaser)

Kristina: "I'm 10 min out, can you cover the incident on 5th?"
Joe: "Already on it, I got you"
```

### Chat Notifications

**When new message arrives**:
1. **Push Notification**: "New message from Tony"
2. **Unread Badge**: Red number on Chat tab
3. **Sound**: Notification sound (if not muted)
4. **Thread Preview**: Shows in chat list with bold text

---

## 🔔 **How Notifications Work**

### High Alert System

**Configuration** (Home page filter bar):
- **Sound Selector**: Choose from 8 alert sounds
- **Mute Toggle**: Silence all sounds

**Trigger**:
- New incident arrives with `highAlert: true`
- Sound plays immediately (if not muted)
- Push notification sent
- Visual badge on app icon

### Response Notifications (Supe Only)

**When Chaser responds to incident**:
1. Chaser clicks "Respond to Alert"
2. System records response in Firestore
3. **ALL Supes receive notification**:
   - Push notification: "Kristina responded to 321 Lyons Ave"
   - Shows in notifications panel
   - Includes incident address and chaser name

### Chat Notifications (Everyone)

**When new message in thread**:
- Push notification with preview
- Unread count on Chat tab
- Sound notification
- Thread marked unread in list

---

## 📊 **Data Flow & Real-Time Updates**

### How Incidents Arrive

**Source**: MacroDroid app on Android phone monitoring BNN (Breaking News Network)

**Flow**:
```
BNN Alert → MacroDroid → Firestore /incidents → Real-time to All Users
```

**Process**:
1. MacroDroid detects fire alert from BNN
2. Parses: address, city, state, type, message
3. Writes to Firestore `/incidents` collection
4. Cloud Function triggers automatically:
   - Geocodes address (Google Maps API)
   - Adds `lat` and `lng` to incident
   - Creates/updates CRM contact
5. All users see incident instantly via `onSnapshot` listener
6. Incident appears in everyone's home page

### How Updates Work

**Same Incident, New Information**:
```
Initial Alert: "Fire at 321 Lyons Ave"
  ↓
Update 1 (5 min later): "Battalion 4 on scene"
  ↓  
Update 2 (10 min later): "Fire under control"
```

**Logic**:
- Same `incidentId` for all updates
- MacroDroid adds new document with same ID
- App groups by `incidentId`
- Keeps most recent as main incident
- Shows all as "Updates" on detail page
- **Geocoding**: Uses lat/lng from FIRST alert (no re-geocoding)

---

## 🌐 **Geocoding & CRM System**

### Auto-Geocoding (Server-Side)

**When**: New incident created in Firestore

**Process**:
1. Cloud Function `autoGeocodeIncident` triggers
2. Checks if lat/lng already exist (skip if yes)
3. Builds full address: `{address}, {city}, {state}`
4. Calls Google Maps Geocoding API
5. Updates incident with coordinates
6. **Geocodes ONCE per incident** - updates reuse these coordinates

**Fallback**:
- Scheduled function runs every 15 minutes
- Catches any incidents that weren't geocoded
- Geocodes up to 20 incidents per run

### CRM Contact Creation

**When**: Incident geocoded successfully

**Process**:
1. Cloud Function creates/updates contact in `/contacts` collection
2. **Deduplication**: Uses address hash as document ID
3. **Contact Record Contains**:
   - Address, city, state, county
   - Coordinates (lat, lng)
   - Homeowner info (filled later via Homeowner tab)
   - List of all incidents at this address
   - First incident date, last incident date
   - Total incident count

**Benefits**:
- Track incident history per property
- Pre-populate homeowner info for repeat incidents
- Build database of properties
- Generate reports by location
- Identify problem properties

**CRM Usage**:
1. Chaser fills Homeowner tab on incident
2. Data saves to incident AND contact
3. Next incident at same address:
   - Homeowner info pre-populated
   - Shows incident history
   - Faster documentation

---

## 🎨 **Visual Design & UX**

### Color System
- **Primary Red**: #FF3B30 (Apple-style destructive red)
  - Used for: Favorites (hearts), HIGH ALERT button, alerts, warnings
- **Primary Blue**: #007AFF (iOS blue)
  - Used for: Headers, active tabs, links, Send buttons
- **Success Green**: #34C759
  - Used for: "Respond to Alert" button, online status, success states
- **Gray Scale**: #6B7280 (neutral gray)
  - Used for: Inactive states, secondary text, backgrounds

### Typography
- **Headers**: 2xl, bold (24px)
- **Subheadings**: lg, semibold (18px)
- **Body**: base (16px)
- **Labels**: sm (14px)
- **Captions**: xs (12px)

### Touch Targets
- **Minimum**: 44px x 44px (Apple guidelines)
- **Buttons**: 48px+ height for easy tapping
- **List Items**: 60px+ height
- **Spacing**: 16px between elements

### Fixed Elements
- **Header**: Fixed at top, doesn't scroll
- **Tab Bar**: Fixed below header
- **Bottom Nav**: Fixed at bottom
- **Content**: Scrolls between fixed elements

---

## 🔐 **Authentication & Security**

### Login Flow

**Login Page**:
1. **Email input**: Enter email address
2. **Password input**: Enter password
3. **Sign In button**: Authenticate with Firebase
4. **Google Sign-In button**: OAuth with Google
5. **Forgot Password link**: Reset via email
6. **Sign Up link**: Create new account

**After Login**:
- Session cookie created (httpOnly, secure)
- Redirected based on role:
  - Chaser → `/chaser/incidents`
  - Supe → `/supe/incidents`
  - Admin → `/admin`

### Role-Based Access

**Middleware Protection**:
- All `/chaser/*` pages require authentication
- All `/supe/*` pages require authentication + supe role
- All `/admin/*` pages require admin role
- Unauthenticated users → Redirected to `/login`
- Wrong role → Redirected to `/unauthorized`

### Security Rules

**Firestore**:
- Users can only read/write their own data
- Chasers can read assigned incidents
- Supes can read all incidents
- Notes require authentication
- Favorites/bookmarks require ownership

**Realtime Database** (Chat):
- Can only read threads you're a participant in
- Can only write messages as yourself
- Thread creation restricted to authenticated users

---

## 📈 **Performance & Offline**

### Offline Support

**What Works Offline**:
- View previously loaded incidents
- Read cached chat messages
- View saved favorites/bookmarks
- View profile information

**What Requires Connection**:
- New incidents
- New messages
- Responding to alerts
- Uploading files
- Sending e-signatures

### Data Optimization

**Firestore**:
- Offline persistence enabled (IndexedDB)
- Query limit: 500 most recent incidents
- Real-time listeners with `onSnapshot`
- Automatic reconnection on network restore

**Caching**:
- Geocode results cached in localStorage
- User location cached (60-second freshness)
- Incident data cached locally
- Images lazy-loaded

### Performance Targets
- ✅ Initial load: < 3 seconds
- ✅ Page transition: < 100ms
- ✅ Real-time update: < 1 second
- ✅ Smooth animations: 60fps

---

## 🚀 **Deployment & Environments**

### Production
- **URL**: https://4axe.com
- **Branch**: `main`
- **Users**: All real users
- **Data**: Production Firestore
- **Status**: Stable (old architecture)

### Rebuild (Staging/Preview)
- **URL**: https://rebuild.4axe.com
- **Branch**: `rebuild-proper-architecture`
- **Users**: Testing only
- **Data**: Same production Firestore
- **Status**: Active development (Clean Architecture)
- **Purpose**: Test new features before production release

---

## 🎯 **Product Goals & Success Criteria**

### Primary Goal
Enable emergency responders to quickly find, respond to, and document fire incidents while maintaining real-time communication with supervisors.

### Success Metrics

**Speed**:
- Chaser sees new alert within 5 seconds
- Chaser can respond in < 30 seconds
- Supervisor sees response notification instantly

**Usability**:
- < 3 taps to respond to alert
- < 2 taps to add note
- Zero training needed (intuitive design)

**Reliability**:
- 99.9% uptime
- No data loss
- Works on poor network
- Recovers gracefully from errors

### User Satisfaction

**Chasers Love**:
- Seeing distance to incidents
- Quick respond button
- Auto-save notes (no "Submit" needed)
- Simple, fast interface

**Supes Love**:
- Seeing all team activity
- Live team location map
- Getting notified of responses
- CRM for business management

---

## 🔮 **Future Features (Planned)**

### Coming Soon
- [ ] Push notifications (FCM wired, flow pending)
- [ ] File upload to Storage (UI done, backend pending)
- [ ] E-signature provider integration
- [ ] Advanced filtering on map
- [ ] Incident history reports
- [ ] Team performance analytics
- [ ] Automated claim filing

### Under Consideration
- [ ] Voice messages in chat
- [ ] Video calls
- [ ] Automated routing/assignment
- [ ] Integration with insurance APIs
- [ ] Mobile app (React Native)

---

## 📱 **Technical Requirements**

### Supported Devices
- **iOS**: Safari 14+
- **Android**: Chrome 90+
- **Desktop**: Chrome, Edge, Firefox latest

### Browser Requirements
- **JavaScript**: ES2020+
- **LocalStorage**: Required
- **IndexedDB**: Required for offline
- **Geolocation API**: Optional (for distance)
- **Notifications API**: Optional (for push)

### Network
- **Minimum**: 3G connection
- **Recommended**: 4G/LTE or WiFi
- **Offline**: Read-only access to cached data

---

This is the **complete product vision** for EMU Alerts! Every page, every button, every interaction explained in plain English. 🎯
