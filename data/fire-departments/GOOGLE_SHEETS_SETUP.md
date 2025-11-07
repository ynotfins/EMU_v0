# Google Sheets Setup Guide: Protect Columns A-AB and Add New Columns

## Step 1: Make Columns A-AB Protected (Uneditable)

1. **Select columns A through AB:**
   - Click on column header "A"
   - Hold Shift and click on column header "AB"
   - All columns A through AB should now be selected

2. **Protect the range:**
   - Right-click on the selected columns
   - Choose **"Protect range"** from the context menu
   - OR go to **Data → Protect sheets and ranges**
   - Click **"Set permissions"**
   - Choose **"Restrict who can edit this range"**
   - Select **"Only you"** (or specific users who should be able to edit)
   - Click **"Done"**

## Step 2: Add New Columns After AB

After column AB, add these new columns:

| Column | Header | Description | Example Values |
|--------|--------|-------------|----------------|
| **AC** | `Encryption Policy` | How the department broadcasts | `all_unencrypted`, `first_unencrypted_then_encrypted`, `all_encrypted`, `unknown` |
| **AD** | `Encryption Notes` | Additional details about encryption | Free text field |
| **AE** | `Department Codes` | BNN codes associated with this department | `nj179`, `pas4795` (comma-separated) |
| **AF** | `Code Confidence` | How confident we are in code mapping | `confirmed`, `likely`, `unknown` |
| **AG** | `Last Updated` | When this row was last updated | Auto-filled timestamp |
| **AH** | `Updated By` | Who last updated this row | User email/name |

## Step 3: Add Column Headers

1. Click on cell **AC1** (first row, column AC)
2. Type: `Encryption Policy`
3. Click on cell **AD1** and type: `Encryption Notes`
4. Click on cell **AE1** and type: `Department Codes`
5. Click on cell **AF1** and type: `Code Confidence`
6. Click on cell **AG1** and type: `Last Updated`
7. Click on cell **AH1** and type: `Updated By`

## Step 4: Format New Columns (Optional)

1. Select columns AC through AH
2. Right-click → **"Format cells"**
3. Set:
   - **AC** (Encryption Policy): Data validation dropdown with values: `all_unencrypted`, `first_unencrypted_then_encrypted`, `all_encrypted`, `unknown`
   - **AF** (Code Confidence): Data validation dropdown with values: `confirmed`, `likely`, `unknown`
   - **AG** (Last Updated): Date/Time format
   - **AD, AE, AH**: Text format

## Step 5: Set Up Data Validation for Encryption Policy

1. Select column **AC** (excluding header row)
2. Go to **Data → Data validation**
3. Criteria: **"List of items"**
4. Enter: `all_unencrypted,first_unencrypted_then_encrypted,all_encrypted,unknown`
5. Check **"Show dropdown list in cell"**
6. Click **"Save"**

## Step 6: Set Up Data Validation for Code Confidence

1. Select column **AF** (excluding header row)
2. Go to **Data → Data validation**
3. Criteria: **"List of items"**
4. Enter: `confirmed,likely,unknown`
5. Check **"Show dropdown list in cell"**
6. Click **"Save"**

## Notes

- Columns A-AB are now protected and cannot be edited by anyone except you
- Columns AC-AH are editable and can be filled in as you cross-reference department codes
- The import script will automatically map existing encryption policy information from column Y (if present) to the new AC column
- You can manually fill in encryption policies based on the notes in column Y

## Quick Reference: Encryption Policy Values

- **`all_unencrypted`**: All calls broadcast on unencrypted channels
- **`first_unencrypted_then_encrypted`**: First call unencrypted, subsequent calls encrypted
- **`all_encrypted`**: All calls broadcast on encrypted channels
- **`unknown`**: Encryption policy not yet determined

