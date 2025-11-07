# Active Context: Current Development State

## Current Focus
Fire Department Encryption Policy Tracking System - Complete implementation of fire department code cross-referencing and encryption policy management.

## Recent Work Completed

### Fire Department Tracking System (✅ Complete)
- **Schema**: Added `FireDepartment` and `FireDepartmentMapping` collections to Firestore
- **Encryption Policy Types**: `all_unencrypted`, `first_unencrypted_then_encrypted`, `all_encrypted`, `unknown`
- **Management UI**: `/fire-departments` page for Supe users with full CRUD operations
- **Server Actions**: Create, update, delete, import fire departments
- **Google Sheets Integration**: Direct URL import and CSV import support
- **Cross-Reference Script**: Matches BNN codes to departments via address matching
- **Automatic Code Tracking**: Webhook automatically tracks codes with addresses

### Webhook Service (✅ Operational)
- **AI Extraction**: OpenRouter/Claude 3.5 Sonnet extracts structured data from alerts
- **Department Codes**: Automatically extracted and tracked
- **Message Appending**: Updates append new messages with bullet separator
- **Alert Fields**: Tracks `alertType`, `alertDate`, `alertTime` per update
- **Geocoding**: Cloud Function auto-geocodes addresses on incident creation

### Frontend Application (✅ Deployed)
- **Home Page**: Groups incidents by `incidentId`, shows most recent, 6-line format
- **Detail Page**: Shows all alerts for incident ID, fire department info for Supe users
- **Navigation**: Fixed bottom nav with proper event handling
- **Profile Page**: Added fire department management link for Supe users
- **Mobile Viewport**: Fixed Google sign-in page scaling issue

## Architecture Decisions

### Fire Department Data Model
- **Master Source**: Google Sheets (columns A-AB protected, AC-AH editable)
- **Firestore Storage**: `fireDepartments` collection for app access
- **Code Mapping**: `fireDepartmentMappings` collection tracks code-to-department links
- **Encryption Policy**: Critical field determining alert accessibility

### Webhook Processing Flow
1. MacroDroid sends alert to `/webhook` endpoint
2. AI extracts structured data (incident ID, location, codes, etc.)
3. System checks for existing incident by `incidentId`
4. If exists: Append message, update alert fields
5. If new: Create incident, trigger geocoding
6. Track department codes automatically

### Display Format Rules
- **Home Page**: One alert per `incidentId`, most recent, 6-line format
  - Line 1: Date, Time, Distance (right-justified for chasers)
  - Line 2: State | County | City | Address
  - Lines 3-6: Alert Type | Alert (bullet-separated messages)
- **Detail Page**: All alerts for incident ID
  - Line 1: Date of Alert, Time of Alert
  - Line 2: Alert type, alert message
  - Supe only: Fire department codes

## Next Steps

### Immediate
1. Run Google Apps Script to set up data validation in Google Sheets
2. Import fire department data from Google Sheets
3. Populate encryption policies based on notes in column Z
4. Run cross-reference script to match codes to departments

### Upcoming
1. Service area scraping for automatic department identification
2. Alert filtering based on encryption policy
3. Analytics dashboard for encryption policy distribution
4. Real-time policy update monitoring

## Important Notes
- Google Sheets URL: https://docs.google.com/spreadsheets/d/1Dp563w_Z5GLno3UY5IYLeKVTzpAMcZVvljOz1ZsboKo/edit
- Columns A-AB are protected (read-only USFA registry data)
- Columns AC-AH are editable (encryption policy, codes, tracking)
- Encryption policy determines which alerts are accessible
- Cross-reference improves over time as more alerts come in

### Update 2025-01-07T00:00:00Z
[status]: active
[id]: u_20250107_000000_fd_system
[source]: action
[reason]: Fire department tracking system complete

**System Components:**
- Fire department management UI at `/fire-departments`
- Google Sheets integration (import URL and CSV)
- Cross-reference script for code matching
- Automatic code tracking in webhook
- Encryption policy tracking (4 types)
- Google Apps Script for automation

**Data Flow:**
- BNN Alert → Webhook → Extract Codes → Track → Cross-Reference → Link to Department → Encryption Policy

**Files Created:**
- `data/fire-departments/` - Reference data and documentation
- `emu-alerts-new/app/fire-departments/page.tsx` - Management UI
- `emu-alerts-new/actions/fire-departments.ts` - Server actions
- `scripts/crossref-fire-departments.ts` - Cross-reference script
- `functions/src/utils/track-department-codes.ts` - Automatic tracking
