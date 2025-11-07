# Google Sheets Column Mapping

## Original Columns (A-AB) - PROTECTED

These columns contain the original USFA registry data and should be protected:

- **A**: FDID
- **B**: Fire dept name
- **C**: HQ addr1
- **D**: HQ addr2
- **E**: HQ city
- **F**: HQ state
- **G**: HQ zip
- **H**: Mail addr1
- **I**: Mail addr2
- **J**: Mail PO box
- **K**: Mail city
- **L**: Mail state
- **M**: Mail zip
- **N**: HQ phone
- **O**: HQ fax
- **P**: County
- **Q**: Dept Type
- **R**: Organization Type
- **S**: Website
- **T**: Stations
- **U**: Active Career
- **V**: Active Volunteer
- **W**: Active Paid per Call
- **X**: Non-Firefighting - Civilian
- **Y**: Non-Firefighting - Volunteer
- **Z**: Primary agency for emergency mgmt (contains encryption notes)
- **AA**: (empty or additional notes)
- **AB**: (empty or additional notes)

## New Columns (AC-AH) - EDITABLE

Add these columns after AB for tracking encryption policies and department codes:

### Column AC: Encryption Policy
- **Header**: `Encryption Policy`
- **Type**: Dropdown (Data Validation)
- **Values**: 
  - `all_unencrypted`
  - `first_unencrypted_then_encrypted`
  - `all_encrypted`
  - `unknown`
- **Purpose**: Track how each department broadcasts alerts

### Column AD: Encryption Notes
- **Header**: `Encryption Notes`
- **Type**: Text
- **Purpose**: Additional details about encryption policy, extracted from column Z or manually added

### Column AE: Department Codes
- **Header**: `Department Codes`
- **Type**: Text (comma-separated)
- **Purpose**: BNN codes associated with this department (e.g., `nj179,pas4795`)

### Column AF: Code Confidence
- **Header**: `Code Confidence`
- **Type**: Dropdown (Data Validation)
- **Values**:
  - `confirmed`
  - `likely`
  - `unknown`
- **Purpose**: Confidence level in code-to-department mapping

### Column AG: Last Updated
- **Header**: `Last Updated`
- **Type**: Date/Time
- **Purpose**: Track when row was last modified

### Column AH: Updated By
- **Header**: `Updated By`
- **Type**: Text
- **Purpose**: Track who made the last update

## Import Script Mapping

The import script (`scripts/import-fire-departments.ts`) maps columns as follows:

```typescript
{
  fdid: row['FDID'],
  name: row['Fire dept name'],
  state: row['HQ state'],
  county: row['County'],
  city: row['HQ city'],
  address: row['HQ addr1'],
  zipCode: row['HQ zip'],
  phone: row['HQ phone'],
  website: row['Website'],
  encryptionPolicy: row['Encryption Policy'] || extractFromNotes(row['Primary agency for emergency mgmt']),
  notes: row['Encryption Notes'] || row['Primary agency for emergency mgmt']
}
```

## Encryption Policy Extraction Logic

The script automatically extracts encryption policy from column Z notes:

- **"all encrypted"** or **"fully encrypted"** → `all_encrypted`
- **"first call encrypted"** or **"dispatch encrypted"** → `first_unencrypted_then_encrypted`
- **"unencrypted"** or **"clear"** or **"analog"** → `all_unencrypted`
- Otherwise → `unknown`

