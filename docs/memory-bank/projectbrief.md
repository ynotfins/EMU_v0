# Project Brief: EMU Alerts / EMU Incidents

## Overview
EMU Alerts is an AI-enhanced emergency alert management system that processes incoming alerts (primarily from MacroDroid/BNN), extracts structured data using AI, and displays incidents to emergency responders (Chasers) and supervisors (Supes).

## Core Purpose
- **AI-Enhanced Alert Processing**: Webhook receives alerts, AI extracts structured data
- **Real-time Incident Display**: Chasers see alerts with distance, location, details
- **Supervisor Management**: Supes manage incidents, view fire department data
- **Fire Department Tracking**: Cross-reference department codes with encryption policies
- **Geocoding**: Automatic address-to-coordinates conversion

## Architecture
Monorepo structure:
- **`emu-alerts-new/`**: Next.js 16 App Router frontend application
- **`functions/`**: Firebase Cloud Functions (ingress, geocoding)
- **`server_v2/`**: Standalone webhook service (Node.js/Express)
- **`data/fire-departments/`**: Fire department reference data and scripts

## Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Cloud Functions), Node.js/Express
- **AI**: OpenRouter API (Claude 3.5 Sonnet) for text extraction
- **Maps**: Google Maps API (geocoding + display)
- **Database**: Firestore (NoSQL)
- **Deployment**: Vercel (frontend), Google Cloud Run (webhook), Firebase Functions

## Key Features
1. **AI-Powered Alert Processing**: Extracts incident ID, location, type, department codes
2. **Role-based Access**: Chaser (field responder), Supe (supervisor), Admin roles
3. **Real-time Updates**: Firestore subscriptions for live data
4. **Fire Department Management**: Track encryption policies, cross-reference codes
5. **Geocoding**: Automatic lat/lng conversion for addresses
6. **Mobile-First**: Optimized for mobile field use

## Current Status
- ✅ Webhook service operational (server_v2)
- ✅ AI extraction working (OpenRouter/Claude)
- ✅ Frontend application deployed (Vercel)
- ✅ Fire department tracking system complete
- ✅ Google Sheets integration ready
- 🔄 Cross-reference automation in progress

## Success Criteria
- Accurate AI extraction from alert messages
- Real-time incident display
- Proper geocoding for all addresses
- Fire department code matching
- Encryption policy tracking
