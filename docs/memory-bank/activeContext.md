# Active Context: Current Development State

## Current Focus
Fire Department Encryption Policy Tracking System - Complete implementation of fire department code cross-referencing and encryption policy management.

## Recent Work Completed

### Fire Department Code Tracking System (✅ Enhanced)
- **Comprehensive Tracking**: Records every address associated with every department code
- **Data Captured**: Address, city, state, county, alert type, incident count, timestamps
- **Automatic Processing**: Both Cloud Function and server_v2 webhook track codes automatically
- **Address Associations**: Each code document contains array of all addresses it's been seen with
- **Pattern Analysis**: After collecting data, can identify which codes belong to which departments
- **Alert Type Tracking**: Records what types of incidents each code responds to
- **County Information**: Includes county in address matching for better geographic precision

### Webhook Service (✅ Operational)
- **AI Extraction**: OpenRouter/Claude 3.5 Sonnet extracts structured data from alerts
- **Department Codes**: Automatically extracted and tracked with full address details
- **Message Appending**: Updates append new messages with bullet separator
- **Alert Fields**: Tracks `alertType`, `alertDate`, `alertTime` per update
- **Geocoding**: Cloud Function auto-geocodes addresses on incident creation
- **Comprehensive Tracking**: Records county and alert type with each code-address association
- **Dual Implementation**: Both Cloud Function (`ingress`) and standalone (`server_v2`) track codes

### Frontend Application (✅ Deployed)
- **Home Page**: Groups incidents by `incidentId`, shows most recent, 6-line format
- **Detail Page**: Shows all alerts for incident ID, fire department info for Supe users
- **Navigation**: Fixed bottom nav with proper event handling
- **Profile Page**: Added fire department management link for Supe users
- **Mobile Viewport**: Fixed Google sign-in page scaling issue
- **Type Guard Fix**: Fixed incident filtering to handle address at root or in location object
- **Data Display**: Incidents now display correctly with all fields (date, time, location, alerts)

## Architecture Decisions

### Fire Department Data Model
- **Master Source**: Google Sheets (columns A-AB protected, AC-AH editable)
- **Firestore Storage**: `fireDepartments` collection for app access
- **Code Mapping**: `fireDepartmentMappings` collection tracks code-to-department links
- **Encryption Policy**: Critical field determining alert accessibility

### Webhook Processing Flow
1. MacroDroid sends alert to `/webhook` endpoint
2. AI extracts structured data (incident ID, location, codes, county, alert type)
3. System checks for existing incident by `incidentId`
4. If exists: Append message, update alert fields
5. If new: Create incident, trigger geocoding
6. Track department codes automatically with address, county, and alert type
7. Store in `fireDepartmentMappings` collection for pattern analysis

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
1. Collect data over next few days/thousands of alerts
2. Analyze patterns in `fireDepartmentMappings` collection
3. Identify which codes belong to which departments based on address patterns
4. Cross-reference with Google Sheets fire department data
5. Build confidence levels for code-to-department matches

### Upcoming
1. Service area scraping for automatic department identification
2. Alert filtering based on encryption policy
3. Analytics dashboard for encryption policy distribution
4. Real-time policy update monitoring
5. Pattern visualization for code-address associations

## Important Notes
- Google Sheets URL: https://docs.google.com/spreadsheets/d/1Dp563w_Z5GLno3UY5IYLeKVTzpAMcZVvljOz1ZsboKo/edit
- Columns A-AB are protected (read-only USFA registry data)
- Columns AC-AH are editable (encryption policy, codes, tracking)
- Encryption policy determines which alerts are accessible
- Cross-reference improves over time as more alerts come in

### Update 2025-01-07T18:00:00Z
[status]: active
[id]: u_20250107_180000_tracking_enhancement
[source]: action
[reason]: Enhanced code tracking system with county and alert type

**Enhanced Tracking System:**
- Now tracks county and alert type with every address-code association
- Records firstSeen and lastSeen timestamps for each address
- Accumulates alert types when multiple types occur at same address
- Both Cloud Function and server_v2 webhook implement tracking
- Data structure supports comprehensive pattern analysis

**Recent Fixes:**
- Fixed type guard to handle address at root level or in location object
- Fixed viewport issue for Google sign-in popup
- Ensured location object always created with lat/lng defaults
- Fixed type narrowing issues in ingress function

**Tracking Data Structure:**
- Collection: `fireDepartmentMappings`
- Document ID: Department code (e.g., "nj179")
- Fields: code, state, addressAssociations[], confidence, source
- Address Association: address, city, state, county, alertType, incidentCount, firstSeen, lastSeen
