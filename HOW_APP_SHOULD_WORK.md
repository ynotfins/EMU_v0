# EMU Alerts - How The App Should Work

## Overview

EMU Alerts is a **dual-version fire alert and response system** with two distinct user experiences:

1. **Chaser App** - Field responders who respond to fire incidents
2. **Supe App** - Supervisors who monitor team and coordinate responses

Both versions interact through **live chat** and **shared incident data**.

---

## 🎯 **The Two Versions**

### **Chaser Version** (Field Responder)

**Primary Users**: First responders, field adjusters, chasers  
**Access**: angryfrogmusic@gmail.com, j.snap11@yahoo.com, kristina41788@gmail.com

**Purpose**: 
- Receive real-time fire alerts
- Respond to incidents quickly
- Document findings and photos
- Communicate with supervisors

**Bottom Navigation** (5 tabs):
1. 🔥 **Incidents** - Live fire alerts
2. 💬 **Chat** - Messaging
3. 🗺️ **Map** - Alert locations
4. ⭐ **Favorites** - Saved alerts
5. 👤 **Profile** - Settings

---

### **Supe Version** (Supervisor)

**Primary Users**: Supervisors, managers  
**Access**: ynotfins@gmail.com (THE ONLY SUPE)

**Purpose**:
- Monitor all field activity
- See team member locations in real-time
- Coordinate multiple responders
- Manage business operations (CRM)

**Bottom Navigation** (5 tabs):
1. 🔥 **Incidents** - ALL fire alerts (no filters)
2. 💬 **Chat** - Team communication
3. 🗺️ **Map** - Alert locations
4. ⭐ **Favorites** - Saved alerts  
5. 👤 **Profile** - Settings + **Live Team Map**

**Unique Features**:
- 📍 **Live Team Map on Profile** - Shows real-time GPS of all Chasers
- 👥 **CRM Access** - Employee, claims, leads, documents management
- 📢 **Group Chat Reception** - Receives group messages from Chasers
- 🔔 **Notifications** - Alerted when Chasers respond

---

## 📱 **Core User Flows**

### Chaser Flow: Responding to Alert

1. **Alert Arrives**
   - Push notification (if enabled)
   - High-alert sound (if configured)
   - Appears in Incidents list

2. **Chaser Views Alert**
   - Sees distance from current location
   - Sees incident type (Working Fire, Medical, etc.)
   - Sees initial message
   - Can filter by distance, type, keywords

3. **Chaser Opens Detail Page**
   - **Map**: Shows exact incident location on Google Maps
   - **Updates**: Shows initial alert + all subsequent updates (grouped by same ID)
   - **Info**: Address, city, state, county
   - **Actions**: "Respond to Alert" button

4. **Chaser Responds**
   - Clicks "Respond to Alert"
   - System records response
   - **Automatically notifies ALL Supes**
   - Supervisors see notification

5. **Chaser Documents**
   - Takes photos (Docs tab)
   - Fills homeowner form (Homeowner tab)
   - Adds notes (auto-saves)
   - Gets e-signature if needed

6. **Chaser Communicates**
   - Chat tab → Create incident chat
   - **Creates GROUP chat with ALL Supes automatically**
   - Supes all see the message
   - Real-time conversation

---

### Supe Flow: Monitoring & Coordination

1. **Supe Sees All Activity**
   - ALL incidents visible (no distance filtering)
   - Can see which Chasers responded
   - Receives notifications when responses happen

2. **Supe Checks Team Locations**
   - Goes to Profile
   - **Live Team Map** shows all active Chasers' GPS locations
   - Updates every 30 seconds (if Chasers have tracking enabled)
   - Shows who's online and where

3. **Supe Receives Group Chat**
   - Chaser creates incident chat
   - Supe automatically added
   - All Supes see the same conversation
   - Can coordinate response

4. **Supe Uses CRM** (Optional)
   - Access /crm for business management
   - Manage employee onboarding
   - Track insurance claims
   - Generate leads
   - Handle documents and e-signatures

---

## 🗺️ **Map System - Three Different Maps**

### Map #1: Incident Detail Map
**Where**: Incident detail page (both Chaser and Supe)  
**Shows**: Single incident location  
**Data Source**: Individual incident's `lat` and `lng` fields  
**Zoom Level**: 15 (street level, close-up)  
**Purpose**: Show exactly where this specific incident is located

**Example**:
```
Incident: "9 6th St, Lakewood, NJ"
Coordinates: lat: 40.0968725, lng: -74.2094814
Map: Google Maps centered on this address, zoomed to street level
```

---

### Map #2: Live Alert Map
**Where**: `/chaser/map` and `/supe/map` (Map tab)  
**Shows**: Last 10 recent fire alerts  
**Data Source**: Incidents from last 4 hours with valid coordinates  
**Zoom Level**: 10 (city view, see multiple locations)  
**Purpose**: Overview of current active incidents in the area

**Logic**:
```javascript
Incidents Collection
  → Filter: updatedAt > 4 hours ago
  → Filter: lat and lng exist (not null)
  → Sort: Most recent first
  → Limit: Top 10
  → Display: All 10 pins on one map
```

**Example**:
```
Shows 10 pins across city/region:
- Pin 1: "9 6th St, Lakewood" (5 min ago)
- Pin 2: "123 Main St, Toms River" (12 min ago)
- Pin 3: "456 Oak Ave, Brick" (23 min ago)
... (up to 10 most recent)

Map: Centered on average of all 10 locations
Zoom: City-wide view to see all pins
```

---

### Map #3: Live Team Map (**Supe Only**)
**Where**: `/supe/profile` (Profile page only)  
**Shows**: Real-time GPS locations of all active team members  
**Data Source**: Users with `location.lastUpdated` < 5 minutes ago  
**Zoom Level**: 10 (team overview)  
**Purpose**: Supervisor sees where all Chasers are right now

**Logic**:
```javascript
Users Collection
  → Filter: location.lastUpdated > 5 minutes ago
  → Filter: settings.trackingEnabled = true
  → Display: All active users as pins on map
```

**Example**:
```
Shows user locations:
- Pin 1: "Tony" (Supe) - 40.3692, -74.0135 (Updated 2 min ago)
- Pin 2: "angryfrogmusic" (Chaser) - 40.3693, -74.0134 (Updated 30 sec ago)
- Pin 3: "Kristina" (Chaser) - 40.3691, -74.0136 (Updated 1 min ago)

Map: Centered on team's average position
Updates: Every 30 seconds (automatic refresh)
Badge: "3 Online" (users with recent locations)
```

**Privacy**:
- ✅ Users must explicitly enable "Location Tracking" in preferences
- ✅ Only shows users who opted in
- ✅ Only shows recent locations (< 5 minutes old)

---

## 💬 **Chat System - How It Works**

### Scenario 1: Chaser → Supe (GROUP CHAT)

**Trigger**: Chaser clicks "Chat" button on incident detail page

**What Happens**:
1. System calls `createIncidentChat(incidentId, address)`
2. **Automatically adds ALL Supes** to participant list
3. Creates group chat at `/incident-chats/{incidentId}`
4. Chaser sends message
5. **ALL Supes receive message** in their Chat tab
6. All Supes can respond (group conversation)

**Database Path**: `/incident-chats/{incidentId}/messages`

**Example**:
```
Chaser clicks "Chat" on incident "9 6th St"
  → Group chat created: /incident-chats/1833348
  → Participants: 
      - angryfrogmusic (chaser)
      - ynotfins (supe) ← AUTO-ADDED
      - Any other Supes ← AUTO-ADDED
  → Chaser: "On site, heavy smoke visible"
  → ALL Supes see message
  → ynotfins responds: "Proceed with caution"
  → angryfrogmusic sees response
```

---

### Scenario 2: Chaser → Chaser (DIRECT MESSAGE / PM)

**Trigger**: Chaser goes to Chat tab, clicks on another Chaser's name

**What Happens**:
1. System calls `createDirectChat(otherUserId, otherUserName, 'chaser')`
2. Creates 1-on-1 chat at `/direct-chats/{chatId}`
3. **Only two participants** (the two Chasers)
4. Private message between them

**Chat ID Generation**: `[userId1, userId2].sort().join('_')`  
(Ensures same chat ID regardless of who initiates)

**Database Path**: `/direct-chats/{userId1}_{userId2}/messages`

**Example**:
```
angryfrogmusic clicks on "j.snap11"
  → Direct chat: /direct-chats/Kfky1lZnisZ21SszzvVkR2w1h172_Wr1VvhnDhlfNB4RlSnIVfunJEyz1
  → Only participants: angryfrogmusic + j.snap11
  → Private 1-on-1 conversation
  → No one else can see messages
```

---

### Scenario 3: Supe → Supe (DIRECT MESSAGE / PM)

**Trigger**: Supe goes to Chat tab, clicks on another Supe (if multiple exist)

**What Happens**:
1. Same as Chaser → Chaser
2. Creates 1-on-1 PM
3. Private between two Supes

**Note**: Currently only 1 Supe (ynotfins), so this scenario doesn't apply yet.

---

### Scenario 4: Supe → Chaser (DIRECT MESSAGE / PM)

**Trigger**: Supe clicks on Chaser name in Chat tab

**What Happens**:
1. Creates 1-on-1 PM (not group)
2. Private between Supe and that specific Chaser
3. Other Supes cannot see (unlike incident group chats)

---

## 🔥 **Incident & Updates System**

### How Incident IDs Work

**Key Concept**: Each fire alert gets a **unique incident ID** (e.g., `1833348`)

**Initial Alert**:
```
Document: /incidents/1833348
{
  id: "1833348",
  incidentNumber: 1833348,
  address: "9 6th St",
  city: "Lakewood",
  state: "NJ",
  county: "Ocean",
  type: "Smoke Condition",
  message: "FD reports smoldering mattress inside",
  lat: 40.0968725,
  lng: -74.2094814,
  source: "BNN",
  updatedAt: "2025-11-03T12:20:25Z",
  firstSeenAt: "2025-11-03T12:20:24Z",
  updateCount: 4
}
```

**Subsequent Updates** (same incident ID):
```
Subcollection: /incidents/1833348/updates
  ├── {updateDoc1}
  │   ├── message: "FD reports smoldering mattress inside"
  │   ├── ts: "2025-11-03T12:20:25Z"
  │   └── (4 total update documents)
  └── ...
```

**On Detail Page**:
- ✅ Shows main incident as "INITIAL ALERT"
- ✅ Shows all updates in chronological order (newest first)
- ✅ Total: "Updates (4)" = initial + 4 update messages
- ✅ All updates are grouped under same incident ID

---

## 🌐 **Data Flow - How Information Moves**

### Fire Alert Arrives (BNN Source)

1. **Firebase Function `ingestBNN`** receives alert from BNN feed
2. Parses: address, city, state, type, message
3. Checks if incident already exists (by address/time)
4. **First alert** → Creates new incident document
5. **Additional info** → Adds to `/updates` subcollection
6. System geocodes address → adds lat/lng to main document
7. **Real-time sync** → All users see update instantly

---

### Location Tracking (Chasers → Supe)

1. **Chaser enables tracking** in Profile → Preferences
2. Browser requests GPS permission
3. Every 30 seconds: App updates Firestore
   ```
   /users/{userId}/location
   {
     lat: 40.3692201,
     lng: -74.0135116,
     lastUpdated: "2025-11-03T17:13:28Z",
     accuracy: 10
   }
   ```
4. **Supe's Live Team Map** queries Firestore
5. Filters users with `lastUpdated` < 5 minutes ago
6. Displays on map with pins
7. Updates automatically (real-time listener)

**Privacy**:
- Only users who enable tracking are shown
- Only recent locations (< 5 min) displayed
- Can disable anytime in preferences

---

### Chat Flow (Chaser → Supe)

1. **Chaser** on incident detail page clicks "Chat"
2. System:
   - Queries Firestore `/users` for all users with `role: 'supe'`
   - Creates incident chat: `/incident-chats/{incidentId}`
   - **Adds Chaser + ALL Supes as participants**
3. Chaser sends message
4. Realtime Database syncs instantly
5. **ALL Supes** see message in their Chat tab
6. Any Supe can respond
7. All participants see all messages (group chat)

---

## 📍 **How Maps Should Display**

### Incident Detail Page (Both Versions)

**URL**: `/chaser/incident/1833348` or `/supe/incident/1833348`

**Map Display**:
- Shows: Single location (the incident address)
- Center: `{ lat: 40.0968725, lng: -74.2094814 }`
- Zoom: 15 (street level)
- Pin: Single red marker at exact location
- Label: "9 6th St, Lakewood, NJ"

**Below Map**:
- ✅ "Respond to Alert" button (green)
- ✅ Incident info (type, address, city, state)
- ✅ Updates card showing:
  - "INITIAL ALERT" (the main incident)
  - "UPDATE #1", "UPDATE #2", etc. (from subcollection)
  - All in chronological order (newest first)

**Example Console Logs** (when working):
```
[useIncident] Loading incident: 1833348
[useIncident] Found incident document
[useIncident] Found 4 update docs in subcollection
[IncidentDetail] Map data: { hasCoords: true, lat: 40.0968725, lng: -74.2094814 }
[GoogleMap] Created map URL for 1 incident
```

---

### Live Alert Map Page (Both Versions)

**URL**: `/chaser/map` or `/supe/map`

**Map Display**:
- Shows: Multiple locations (last 10 recent alerts)
- Filter: Incidents from last 4 hours
- Filter: Only incidents with valid lat/lng
- Sort: Most recent first
- Limit: Top 10
- Zoom: 10 (city view to see multiple pins)
- Pins: Red markers at each incident location

**Header**:
- Title: "Live Alert Map"
- Badge: "10 Alerts" (or however many found)

**Legend Overlay**:
- "Alert Locations"
- "Showing top 10 most recent alerts (last 4 hours)"

**Example**:
```
Map shows 10 pins across the region:
1. "9 6th St, Lakewood" - 5 minutes ago
2. "123 Main St, Toms River" - 12 minutes ago
3. "456 Oak Ave, Brick" - 45 minutes ago
... (up to 10)

Center: Average lat/lng of all 10 incidents
Zoom: Wide enough to see all pins
```

---

### Live Team Map (Supe Profile ONLY)

**URL**: `/supe/profile` (in profile page, not a separate route)

**Map Display**:
- Shows: Real-time GPS of all team members
- Filter: `location.lastUpdated` < 5 minutes ago
- Filter: `settings.trackingEnabled = true`
- Updates: Every 30 seconds (automatic)
- Zoom: 10 (team overview)
- Pins: Different colors per role (blue=Supe, green=Chaser)

**Header**:
- Title: "Live Team Map"
- Description: "Real-time locations of all users"
- Badge: "3 Online" (users with recent locations)

**Team Member List** (below map):
- Shows all team members with recent locations
- Name, role, last update time
- Color-coded status (green=active, gray=inactive)

**Example**:
```
Map shows 3 team members:
- Tony (Supe) - Blue pin at 40.3692, -74.0135
- angryfrogmusic (Chaser) - Green pin at 40.3693, -74.0134  
- Kristina (Chaser) - Green pin at 40.3691, -74.0136

Badge shows: "3 Online"
List below shows:
  ✅ Tony - Supe - 2 min ago
  ✅ angryfrogmusic - Chaser - 30 sec ago
  ✅ Kristina - Chaser - 1 min ago
```

---

## 🔔 **Notification System**

### When Notifications Fire

**Trigger**: Chaser clicks "Respond to Alert"

**What Happens**:
1. Creates response record:
   ```
   /responses/{responseId}
   {
     incidentId: "1833348",
     userId: "Wr1VvhnDhlfNB4RlSnIVfunJEyz1",
     userName: "angryfrogmusic",
     incidentAddress: "9 6th St",
     respondedAt: timestamp
   }
   ```

2. Calls `notifySupervisors()` function
3. Creates notification for ALL users with `role: 'supe'`:
   ```
   /notifications/{notificationId}
   {
     type: 'response',
     title: 'New Response to Alert',
     message: 'angryfrogmusic has responded to alert at 9 6th St',
     from: { uid, name, role: 'chaser' },
     to: { uid: supeUid, role: 'supe' },
     createdAt: timestamp,
     read: false
   }
   ```

4. **All Supes** see notification
5. Can click to view details

---

## 📊 **Database Structure - Complete Picture**

### Firestore Collections

```
/incidents/{incidentId}  ← Main incident document
  ├── Core Fields:
  │   ├── id: string (e.g., "1833348")
  │   ├── incidentNumber: number (e.g., 1833348)
  │   ├── address: string
  │   ├── city: string
  │   ├── state: string
  │   ├── county: string
  │   ├── type: string (e.g., "Smoke Condition")
  │   ├── message: string (initial alert text)
  │   ├── source: "BNN"
  │   ├── lat: number ✅ GEOCODED
  │   ├── lng: number ✅ GEOCODED
  │   ├── geocodedAt: timestamp
  │   ├── firstSeenAt: timestamp
  │   ├── lastTs: timestamp
  │   ├── updatedAt: timestamp
  │   └── updateCount: number
  │
  └── /updates/{updateId}  ← Subcollection of updates
      ├── message: string
      ├── ts: timestamp
      ├── address: string (may differ from main)
      ├── lat: null (updates don't get geocoded)
      └── lng: null

/users/{userId}
  ├── email: string
  ├── role: "chaser" | "supe"
  ├── displayName: string
  ├── location: {
  │   lat: number,
  │   lng: number,
  │   lastUpdated: timestamp,
  │   accuracy: number
  │ }
  ├── settings: {
  │   trackingEnabled: boolean,
  │   pushEnabled: boolean,
  │   muted: boolean
  │ }
  └── stats: {
      responded: number,
      noted: number,
      daysActive: number
    }

/favorites/{favoriteId}
/bookmarks/{bookmarkId}
/notes/{noteId}
/responses/{responseId}
/notifications/{notificationId}

CRM Collections (Supe access only):
/claims
/leads
/documents
/esignatures
/form_templates
/employees (extended user profiles)
```

### Realtime Database Paths

```
/incident-chats/{incidentId}
  ├── participants: { userId: role, ... }
  ├── createdBy: userId
  ├── incidentAddress: string
  └── /messages/{messageId}
      ├── userId: string
      ├── userName: string
      ├── message: string
      ├── timestamp: number
      └── read: boolean

/direct-chats/{chatId}
  ├── participants: { userId: role, ... }
  ├── lastMessage: string
  ├── lastMessageTime: timestamp
  └── /messages/{messageId}
      (same structure as incident chats)
```

---

## 🎨 **UI Components - What to Keep**

### Keep These (You Love Them):
- ✅ `components/ui/*` - All shadcn/ui components
- ✅ Bottom navigation component
- ✅ Incident list item design
- ✅ Filter bar design
- ✅ Profile cards (stats, preferences, payment)
- ✅ Mobile-responsive layouts
- ✅ Color scheme (blue primary, red for high alerts)

### Keep This Behavior:
- ✅ Collapsible filters (pinching hand emoji)
- ✅ HIGH ALERT button (red, animated)
- ✅ Distance sorting toggle
- ✅ Tab-based navigation
- ✅ Card-based incident design
- ✅ Auto-save notes

---

## 🚨 **What Broke & Why**

### Root Causes (Post-Mortem):

1. **Architecture Mismatch**:
   - Used Client Components for everything
   - Should have used Server Components for data fetching
   - Caused slow loads, race conditions

2. **Auth Implementation**:
   - Client-side cookies (not httpOnly)
   - No Server Action for login
   - Middleware timing issues
   - **Fix**: Server Actions + httpOnly cookies

3. **Map Component Confusion**:
   - GoogleMap component tried to handle 3 different use cases
   - Mixing markers/incidents/center logic
   - **Fix**: Separate concerns, use proper React Google Maps

4. **Role Complexity**:
   - View mode switching
   - God Mode toggle
   - Shared profile between roles
   - **Fix**: ONE Supe user, clean separation

5. **Data Structure Assumptions**:
   - Incident as marker conversion
   - Type mismatches (string vs number)
   - **Fix**: Pass data as-is, let components handle conversion

---

## ✅ **Recommended Rebuild Approach**

### **DO NOT** start with original frontend zip because:
1. Current UI is what you love (keep it!)
2. Original might have different structure
3. We'd have to re-wire anyway
4. Current components work visually

### **DO** this instead:
1. ✅ Rollback to `b8f0754` (working maps/updates)
2. ✅ Keep all UI components as-is
3. ✅ Refactor ONLY the backend wiring:
   - Move to `src/` structure
   - Add Server Components
   - Fix auth with Server Actions
   - Proper Firebase Client/Admin separation
4. ✅ Test Chaser thoroughly
5. ✅ Clone Chaser → Supe with modifications
6. ✅ Re-add CRM from backup

**Timeline**: 2-3 days  
**Risk**: Low (you have backup zip)  
**Outcome**: Same beloved UI, properly architected backend

---

## 🎯 **Success Criteria**

### After Rebuild, App Must:

**Chaser**:
- [ ] Login works (PC, mobile, PWA) - no race conditions
- [ ] Incidents list loads instantly (server-rendered)
- [ ] Real-time updates work
- [ ] Click incident → detail page loads
- [ ] **Map shows incident location** on detail page
- [ ] **All updates display** (initial + subcollection)
- [ ] Distance calculation works
- [ ] Chat with Supe creates group chat
- [ ] No app freezes on filters
- [ ] Location tracking updates every 30 seconds

**Supe**:
- [ ] Login works on all platforms
- [ ] See ALL incidents (no distance filter)
- [ ] Detail page shows map and updates
- [ ] **Profile has Live Team Map** with all user locations
- [ ] `/supe/map` shows alert locations (not team)
- [ ] Receive group chats from Chasers
- [ ] Notifications when Chasers respond
- [ ] Access CRM at `/crm`

**Maps**:
- [ ] Detail map: Single incident, zoom 15
- [ ] Alert map: Last 10 recent, zoom 10, 4 hours
- [ ] Team map: Active users, zoom 10, < 5 min

---

## 💾 **What Gets Saved Before Rollback**

Create backup branch with:
- ✅ All CRM code (`app/crm/**/*`)
- ✅ CRM components (employee, forms, docs, esign)
- ✅ Lead generation system
- ✅ Design tokens
- ✅ Append-only memory bank rule
- ✅ Best practices file
- ✅ All type definitions

**You also have**: Zip file of current state

---

## 🤔 **Should We Use Original Frontend Zip?**

**My Answer**: **NO - Don't need it**

**Reasons**:
1. ✅ Current UI is already what you love
2. ✅ Current components work visually
3. ✅ Original might be outdated or different
4. ✅ Backend wiring is the problem, not UI
5. ✅ Easier to refactor current code than start over

**Use Zip For**: Reference only, if we need to check original design intent

---

## 📋 **Final Recommendation**

### The Plan:
1. **Rollback** to `b8f0754` (working baseline)
2. **Keep** all UI components (you love them)
3. **Refactor** backend following best practices
4. **Test** Chaser thoroughly
5. **Clone** to Supe with modifications
6. **Re-add** CRM from backup

### Why This Works:
- ✅ Keeps what you love (UI)
- ✅ Fixes what's broken (backend)
- ✅ Follows all best practices
- ✅ Low risk (you have backups)
- ✅ Faster than complete rewrite

**Timeline**: 2-3 focused days  
**Confidence**: 95% success rate

---

**Do you want me to**:
- **A)** Proceed with this rebuild plan?
- **B)** Modify the plan first?
- **C)** Extract and examine the original frontend zip?
- **D)** Something else?

**Waiting for your approval to begin!** 🚀

