# Product Context: User Experience & Features

## User Roles

### Chaser (Field Responder)
- **Primary Actions**: Respond to incidents, update status, chat with team
- **Key Features**: 
  - View assigned incidents with distance
  - Navigate to incident location
  - Update arrival/completion status
  - Chat with supervisors
  - Upload photos and documents
  - Collect homeowner signatures

### Supe (Supervisor)
- **Primary Actions**: Create incidents, assign chasers, monitor progress
- **Key Features**:
  - Create new incidents with location
  - View all active incidents on map
  - Assign/reassign chasers
  - Monitor real-time status
  - Communicate with field team
  - Generate reports

### Admin
- **Primary Actions**: System management, user management, analytics
- **Key Features**:
  - All Supe features
  - Manage user roles
  - View system analytics
  - Configure settings
  - Access all incidents

## Core User Flows

### Incident Creation (Supe)
1. Supe receives damage report
2. Creates incident with location/details
3. System notifies nearby chasers
4. Incident appears on map

### Incident Response (Chaser)
1. Chaser receives notification
2. Views incident details and distance
3. Accepts assignment
4. Navigates to location
5. Updates status on arrival
6. Completes work and documents
7. Marks incident complete

### Real-time Communication
1. Automatic chat thread per incident
2. All assigned users added
3. Real-time message sync
4. Push notifications
5. File/photo sharing

## UI/UX Principles

### Mobile-First Design
- Large touch targets
- Bottom navigation
- Swipe gestures
- Minimal scrolling
- Offline capability

### Information Hierarchy
1. **Critical**: Status, location, assignment
2. **Important**: Details, chat, updates
3. **Supporting**: History, documents, settings

### Visual Design
- **Colors**: Red theme (danger/urgency)
- **Typography**: Clear, readable fonts
- **Spacing**: Comfortable touch targets
- **Feedback**: Loading states, confirmations

## Key Features

### Maps Integration
- Real-time location tracking
- Incident pins with status colors
- Distance calculations
- Navigation integration
- Clustering for many incidents

### Chat System
- Per-incident threads
- Direct messaging
- Read receipts
- File attachments
- Notification badges

### Document Management
- Photo upload from camera/gallery
- E-signature capture
- PDF generation
- Cloud storage
- Offline sync

### Notifications
- New incident alerts
- Assignment notifications
- Status updates
- Chat messages
- System announcements

## Performance Requirements

### Speed
- < 3s initial load
- < 100ms interaction response
- Real-time updates < 1s
- Smooth 60fps animations

### Reliability
- Offline functionality
- Auto-retry failed operations
- Data persistence
- Graceful error handling

### Scalability
- Handle 1000+ active incidents
- Support 100+ concurrent users
- Efficient data loading
- Progressive enhancement

## Success Metrics

### User Efficiency
- Time to respond to incident
- Time to complete incident
- Number of clicks per task
- Error rate

### System Performance
- Uptime percentage
- Response time
- Real-time sync delay
- Mobile data usage

### Business Value
- Incidents handled per day
- Average response time
- Customer satisfaction
- Team utilization

### Update 2025-01-05T01:40:00Z
[status]: active
[id]: u_20250105_014000_prod1
[source]: action
[reason]: Adding specific implementation details and current state

**Current Implementation Details**:

**Bottom Navigation** (4 tabs, not 5):
- Home (Incidents list) - Landing page after login
- Favorites (4 sub-tabs: Favorites, Bookmarks, Notes, Responses)
- Chat (Incident chats + Direct messages)
- Profile (Settings + Live Team Map for Supes)

**Chat System Specifics**:
- Incident Chat: Automatically adds ALL Supes when Chaser opens chat
- Direct Messages: Chaser↔Supe and Chaser↔Chaser private messaging
- Uses Firebase Realtime Database for real-time sync

**Maps Implementation**:
- Map #1 (Detail): Google Maps Embed iframe, zoom 12, on incident detail page
- Map #2 (Live Alerts): GoogleMapLive component via @googlemaps/js-api-loader, shows last 10 incidents from past 4 hours
- Map #3 (Team): Supe profile page only, shows Chaser GPS locations updated < 5 minutes

**Current Deployment Status**:
- Production (4axe.com): Original architecture, stable
- Rebuild (rebuild.4axe.com): Clean Architecture, active development
- Both use same Firebase project
- TypeScript: 429 errors exist, ignoreBuildErrors enabled temporarily
