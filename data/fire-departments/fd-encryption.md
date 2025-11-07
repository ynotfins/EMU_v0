# Fire Department Encryption Policy System

## Overview

The Fire Department Encryption Policy system tracks how each fire department broadcasts emergency alerts. This is critical for determining which alerts are accessible to users based on radio encryption policies.

## Encryption Policy Types

### `all_unencrypted`
- **Description**: All emergency calls broadcast on unencrypted channels
- **Accessibility**: Fully accessible via scanner apps
- **Use Case**: Most departments, traditional analog systems
- **Example**: "All calls on unencrypted channel"

### `first_unencrypted_then_encrypted`
- **Description**: Initial dispatch call unencrypted, subsequent updates encrypted
- **Accessibility**: First alert accessible, follow-ups encrypted
- **Use Case**: Hybrid systems transitioning to encryption
- **Example**: "First call unencrypted, rest encrypted"

### `all_encrypted`
- **Description**: All emergency calls broadcast on encrypted channels
- **Accessibility**: Not accessible via scanner apps
- **Use Case**: Modern P25 systems, privacy-focused departments
- **Example**: "All calls on encrypted P25 system"

### `unknown`
- **Description**: Encryption policy not yet determined
- **Accessibility**: Unknown
- **Use Case**: New departments, unverified information
- **Example**: Default for departments without policy data

## Data Model

### FireDepartment Schema
```typescript
export interface FireDepartment {
  id: string;
  fdid: string;                    // Fire Department ID
  name: string;
  state: string;
  county?: string;
  city?: string;
  address?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  encryptionPolicy: EncryptionPolicy;  // CRITICAL FIELD
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### FireDepartmentMapping Schema
```typescript
export interface FireDepartmentMapping {
  code: string;                    // BNN department code (e.g., "nj179")
  fdid?: string;                   // Linked to FireDepartment
  departmentName?: string;
  state?: string;
  confidence: 'confirmed' | 'likely' | 'unknown';
  source: 'manual' | 'crossref' | 'scraped';
  addressAssociations: Array<{
    address: string;
    city: string;
    state: string;
    incidentCount: number;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

## System Architecture

### Data Flow
```
BNN Alert → Webhook → Extract Department Codes → Track Codes → Cross-Reference → Link to FireDepartment → Encryption Policy Determined
```

### Components

1. **Webhook Service** (`functions/src/ingress.ts`)
   - Extracts `departmentCodes` from alert messages
   - Automatically tracks codes with addresses
   - Stores in `fireDepartmentMappings` collection

2. **Code Tracking** (`functions/src/utils/track-department-codes.ts`)
   - Tracks each code occurrence with address/city/state
   - Updates incident count per address
   - Links codes to potential departments

3. **Cross-Reference Script** (`scripts/crossref-fire-departments.ts`)
   - Matches codes to fire departments via address matching
   - Sets confidence levels based on match quality
   - Links codes to FDID for encryption policy lookup

4. **Management UI** (`emu-alerts-new/app/fire-departments/page.tsx`)
   - Supe users can view/edit fire department data
   - Set encryption policies manually
   - Import from Google Sheets
   - Real-time Firestore sync

5. **Google Sheets Integration**
   - Master spreadsheet with all fire departments
   - Columns A-AB: Protected USFA registry data
   - Columns AC-AH: Editable tracking fields
   - Google Apps Script for automation

## Usage

### Setting Encryption Policy

**Via UI:**
1. Navigate to `/fire-departments` (Supe users only)
2. Click "Add Department" or edit existing
3. Select encryption policy from dropdown
4. Save

**Via Google Sheets:**
1. Open master spreadsheet
2. Column AC: Select encryption policy
3. System imports automatically

**Via Import Script:**
```bash
pnpm run import:fire-departments path/to/file.csv
```

### Cross-Referencing Codes

```bash
pnpm run crossref:fire-departments
```

This script:
1. Loads fire departments from reference data
2. Finds all address-code associations from incidents
3. Matches codes to departments by location
4. Updates `fireDepartmentMappings` with confidence levels

### Determining Alert Accessibility

When an alert comes in:
1. Extract `departmentCodes` from alert
2. Look up code in `fireDepartmentMappings`
3. Get linked `fdid`
4. Query `fireDepartments` collection for `encryptionPolicy`
5. Display alert only if policy allows access

## Implementation Details

### Automatic Code Extraction

The webhook AI extracts department codes from alert messages:
- Pattern: `nj179/pas4795` or `nj179 pas4795`
- Extracted as array: `["nj179/pas4795", "nj179", "pas4795"]`
- Stored in `incident.departmentCodes`

### Code Tracking

Every alert automatically:
1. Extracts codes from message
2. Tracks code + address association
3. Updates `fireDepartmentMappings` collection
4. Increments incident count per address

### Address Matching Logic

Cross-reference uses fuzzy matching:
- Exact city match → `confirmed`
- County match → `likely`
- State only → `unknown`
- No match → `unknown`

## Google Sheets Structure

### Protected Columns (A-AB)
- Original USFA registry data
- Read-only, cannot be edited
- Contains: FDID, name, address, phone, etc.

### Editable Columns (AC-AH)
- **AC**: Encryption Policy (dropdown)
- **AD**: Encryption Notes (text)
- **AE**: Department Codes (comma-separated)
- **AF**: Code Confidence (dropdown)
- **AG**: Last Updated (date/time)
- **AH**: Updated By (email)

## Future Enhancements

1. **Service Area Scraping**
   - Automatically determine department service areas
   - Match codes to departments by geographic boundaries
   - Increase confidence levels

2. **Real-time Policy Updates**
   - Monitor department policy changes
   - Alert when encryption status changes
   - Historical policy tracking

3. **Alert Filtering**
   - Filter alerts by encryption policy
   - Show only accessible alerts
   - Warn users about encrypted departments

4. **Analytics Dashboard**
   - Track encryption policy distribution
   - Monitor code matching success rate
   - Identify departments needing verification

## Related Files

- `data/fire-departments/types.ts` - TypeScript type definitions
- `data/fire-departments/google-apps-script-setup.js` - Automation script
- `emu-alerts-new/app/fire-departments/page.tsx` - Management UI
- `emu-alerts-new/actions/fire-departments.ts` - Server actions
- `scripts/crossref-fire-departments.ts` - Cross-reference script
- `functions/src/utils/track-department-codes.ts` - Automatic tracking

## Critical Notes

- Encryption policy determines alert accessibility
- Must be accurate for proper alert filtering
- Cross-reference improves over time as more alerts come in
- Manual verification recommended for critical departments
- Google Sheets is master source of truth for department data

