# Fire Department Code Tracking System

## Purpose
Track and cross-reference BNN alert department codes with fire department information to identify which department is sending alerts for each location.

## File Structure

```
data/fire-departments/
├── README.md (this file)
├── fire-departments-reference.json (imported from spreadsheet)
├── code-mappings.json (tracked code-to-department mappings)
├── address-code-associations.json (address/city to code associations)
└── types.ts (TypeScript type definitions)
```

## Data Flow

1. **Reference Data**: Import your spreadsheet as `fire-departments-reference.json`
2. **Code Tracking**: System automatically tracks codes from alerts with addresses, counties, and alert types
3. **Pattern Building**: As data accumulates, patterns emerge showing code-to-department relationships
4. **Cross-Reference**: Utility scripts help match codes to departments
5. **Mapping Storage**: Mappings stored in Firestore `fireDepartmentMappings` collection
6. **Analysis**: After collecting data, identify which codes belong to which departments
7. **Future**: Scrape service areas to auto-identify departments

## Usage

### Step 1: Import Spreadsheet
Convert your spreadsheet to JSON format:
- Save as CSV first
- Run: `pnpm run import:fire-departments data/fire-departments/fire-departments-reference.csv`

### Step 2: Track Codes from Alerts
Codes are automatically tracked when alerts come in via webhook. Each alert records:
- Department codes
- Full address (street, city, state, county)
- Alert type
- Incident count
- First seen and last seen timestamps

After collecting data over a few days or thousands of alerts, patterns will emerge showing which codes belong to which departments.

### Step 3: Cross-Reference
Run: `pnpm run crossref:fire-departments` to match codes with departments.

### Step 4: View Mappings
Check Firestore `fireDepartmentMappings` collection for all tracked associations.

