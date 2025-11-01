# Product Context: EMU Alerts

## Why This Exists
Emergency responders need a fast, reliable way to coordinate during active incidents. Traditional communication methods (phone, radio) lack the context, documentation, and tracking capabilities needed for modern emergency management.

## Problems It Solves

### For Chasers (Emergency Responders)
- **Problem**: Missing critical incident updates while in the field
- **Solution**: Real-time push notifications with high-alert audio for urgent incidents
- **Problem**: Difficulty tracking which incidents they've responded to
- **Solution**: Favorites, bookmarks, and response tracking in profile stats
- **Problem**: Cumbersome document collection and signatures
- **Solution**: In-app photo upload, document management, and e-signature workflows

### For Supes (Supervisors)
- **Problem**: No visibility into responder locations during active incidents
- **Solution**: Live map showing all active responder GPS locations
- **Problem**: Difficulty coordinating multiple responders across incidents
- **Solution**: Team chat, incident chat, and ability to monitor all active incidents
- **Problem**: Managing document approval and file organization
- **Solution**: File management with delete permissions, document review workflows

### For Admins
- **Problem**: Manual user onboarding and permission management
- **Solution**: Admin dashboard to toggle roles and verification status
- **Problem**: No system oversight or user analytics
- **Solution**: Centralized user management interface

## How It Works

### Core User Flow (Chaser)
1. **Login** → Select "Chaser" role
2. **View Incidents** → Filtered list with distance, status, type
3. **Respond** → Open incident → View details, homeowner info, documents
4. **Document** → Upload photos, fill homeowner form, get e-signature
5. **Communicate** → Chat with team or supervisor about incident
6. **Track** → Favorites for quick access, bookmarks for important items

### Core User Flow (Supe)
1. **Login** → Select "Supe" role
2. **Monitor** → Live map view of all active responders
3. **Coordinate** → View all incidents, assign priorities, communicate via chat
4. **Review** → Check documents, manage files, verify completion
5. **Track** → Same chaser capabilities plus oversight tools

### Core User Flow (Admin)
1. **Login** → Select "Admin" role  
2. **Manage Users** → View all users in table format, one-click role changes
3. **Oversight** → System-wide monitoring, user verification status

### Core User Flow (Super Admin - God Mode)
1. **Login** → Select "Supe" role (default)
2. **Profile** → Toggle God Mode ON in profile settings
3. **Switch Views** → Toggle between Chaser and Supe views
4. **Full Access** → All features accessible with role override
5. **Admin Tools** → Access admin dashboard at /admin

## User Experience Goals

### Mobile-First
- Optimized for use in the field on smartphones
- Bottom navigation for thumb-friendly one-handed use
- Large touch targets, readable fonts, high contrast

### Real-Time
- Instant push notifications for new/updated incidents
- Live chat updates without refresh
- GPS tracking updates every few seconds

### Minimal Friction
- Quick login (eventually biometric)
- Incident list automatically filtered to relevant items
- One-tap actions (favorite, bookmark, mute)
- Offline-capable for poor connectivity areas

### Clear Visual Hierarchy
- High-priority incidents stand out (badges, colors)
- Status indicators easily scannable
- Navigation between incident details seamless (tabs)

### Accessibility
- Readable on bright sunlight (high contrast)
- Audio alerts for critical notifications
- Text labels on all icons
- Proper semantic HTML for screen readers

## Key Insights
- Emergency responders work in high-stress, fast-paced environments
- Mobile connectivity can be unreliable during emergencies
- Visual clarity and speed are more important than feature richness
- Trust and reliability are paramount (no bugs, no downtime)
- Documentation and compliance are critical for legal/insurance purposes

