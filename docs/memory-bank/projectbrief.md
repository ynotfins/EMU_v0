# Project Brief: EMU Remote Alerts - Clean Architecture

## Overview
EMU Remote Alerts is an emergency incident management system built with Clean Architecture principles, Next.js 14+, and Firebase. The application enables real-time coordination between emergency supervisors (Supes) and field responders (Chasers) during storm damage incidents.

## Core Purpose
- **Real-time incident reporting**: Supervisors create and manage incidents
- **Field response coordination**: Chasers receive alerts and respond to incidents  
- **Live tracking**: GPS-based location tracking and distance calculations
- **Instant communication**: Real-time chat and updates per incident
- **Document management**: Photos, signatures, and homeowner information

## Architecture
The project follows Clean Architecture with four distinct layers:
1. **Domain Layer**: Business entities, value objects, and rules
2. **Application Layer**: Use cases and application-specific logic
3. **Infrastructure Layer**: External services (Firebase, Maps, etc.)
4. **Presentation Layer**: UI components, pages, and state management

## Technology Stack
- **Frontend**: Next.js 14+ (App Router), React 19, TypeScript
- **Backend**: Firebase (Auth, Firestore, Realtime DB, Storage, FCM)
- **State**: Zustand for client state, Server Actions for API
- **Styling**: Tailwind CSS, shadcn/ui components
- **Maps**: Google Maps API
- **Deployment**: Vercel

## Key Features
1. **Role-based access**: Chaser, Supe, Admin roles with different permissions
2. **Real-time updates**: Live incident status and location tracking
3. **Mobile-first**: Optimized for field use on mobile devices
4. **Offline support**: Works without constant connectivity
5. **Push notifications**: Instant alerts for new incidents

## Current Status
- Phase 1-3: Domain, Application, Infrastructure layers complete
- Phase 4: Presentation layer 60% complete
- Production URL: https://4axe.com
- Development URL: https://rebuild.4axe.com (to be configured)

## Success Criteria
- Zero TypeScript errors
- Clean Architecture compliance
- Real-time performance
- Mobile responsiveness
- Secure authentication
- Scalable infrastructure
