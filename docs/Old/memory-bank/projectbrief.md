# Project Brief: EMU Alerts

🔗 **Anchored Docs**: docs/README.md, docs/WIRING.md, BUILD_REPORT.md, docs/ROUTES.md, docs/COMPONENTS.md, docs/TESTPLAN.md, docs/API_MAP.md, docs/AVATAR_GUIDE.md, docs/FIRESTORE_BACKUP_STRATEGY.md, docs/ANDROID_APP_GUIDE.md

## Project Name

**EMU Alerts** (Emergency Management Unit) - Also known as National Fire Alerts (NFA) System

## Core Purpose

A comprehensive emergency management system that enables real-time coordination between emergency responders (chasers), supervisors (supes), and administrators during emergency incidents.

## Primary Goals

1. **Rapid Response**: Enable emergency responders to quickly view, respond to, and manage incidents
2. **Real-Time Communication**: Provide team chat, incident-specific chat, and direct messaging
3. **Live Tracking**: Allow supervisors to monitor active responder locations on a live map
4. **Document Management**: Handle photos, documents, e-signatures, and homeowner forms
5. **Role-Based Access**: Three distinct user experiences (chaser, supe, admin) with appropriate permissions

## Target Users

- **Chasers (Emergency Responders)**: Front-line workers responding to incidents
- **Supes (Supervisors)**: Team leaders who coordinate and monitor responders
- **Admins**: System administrators managing user accounts and permissions
- **Super Admins**: God Mode users with full system access and role-switching capabilities

## Key Features

- Incident management with real-time updates and high-alert notifications
- Multi-channel chat system (team chat, incident group chat, 1-on-1 direct messages)
- Live GPS tracking and team map for supervisors
- Alert response tracking with Google Maps navigation integration
- Document upload and e-signature workflows
- Favorites, bookmarks, notes, and responses tabs
- Profile management with ID verification, avatars, and payment info
- Configurable audio alerts for high-priority incidents (train horn + flash)
- Mobile-first PWA with offline capabilities
- Multi-step onboarding with camera ID capture and OCR
- CRM integration for independent contractors & employees management
- God Mode for super admins (role switching, full access)

## Success Criteria

- Responders can view and respond to incidents within seconds
- Real-time location tracking works reliably
- Push notifications deliver instantly for high-priority incidents
- Document and signature workflows are intuitive
- System is accessible on mobile devices in the field

## Technical Constraints

- Must work on mobile devices (primary use case)
- Must support offline-capable PWA features
- Firebase-based backend for real-time capabilities
- Vercel deployment for global edge distribution
