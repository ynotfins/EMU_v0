# Google Apps Script Setup Guide

## Quick Setup (Recommended)

1. **Open your Google Sheet**
   - Navigate to: https://docs.google.com/spreadsheets/d/1Dp563w_Z5GLno3UY5IYLeKVTzpAMcZVvljOz1ZsboKo/edit

2. **Open Apps Script**
   - Go to **Extensions → Apps Script**
   - Or use shortcut: `Alt+E, X` (Windows) or `Option+E, X` (Mac)

3. **Paste the Script**
   - Delete any existing code
   - Copy the code from `google-apps-script-setup.js`
   - Paste it into the editor

4. **Run the Script**
   - Click the function dropdown at the top
   - Select `runSetup`
   - Click the **Run** button (▶️)
   - Authorize the script when prompted (click "Review permissions" → "Allow")

5. **Done!**
   - The script will:
     - Set up data validation for Encryption Policy (Column AC)
     - Set up data validation for Code Confidence (Column AF)
     - Format Last Updated column (Column AG) as Date/Time

## Optional: Auto-Update on Edit

The script includes an `onEdit` function that automatically:
- Updates "Last Updated" timestamp when you edit columns AC-AF
- Records your email in "Updated By" column

To enable this:
1. In Apps Script editor, click **Triggers** (clock icon) on the left
2. Click **+ Add Trigger** (bottom right)
3. Configure:
   - Function: `onEdit`
   - Event source: `From spreadsheet`
   - Event type: `On edit`
4. Click **Save**

## What the Script Does

### Column AC: Encryption Policy
- Dropdown with: `all_unencrypted`, `first_unencrypted_then_encrypted`, `all_encrypted`, `unknown`
- Applied to all rows (excluding header)

### Column AF: Code Confidence  
- Dropdown with: `confirmed`, `likely`, `unknown`
- Applied to all rows (excluding header)

### Column AG: Last Updated
- Formatted as: `MM/DD/YYYY HH:MM:SS`
- Auto-updates when you edit columns AC-AF (if trigger is enabled)

## Troubleshooting

**"Authorization required"**
- Click "Review permissions" → Select your Google account → "Allow"
- This is safe - the script only accesses your spreadsheet

**"Script execution failed"**
- Make sure you're on the correct sheet tab (`usfa-registry-NJ`)
- Check that columns AC-AH exist (add them if missing)

**"Range not found"**
- Ensure you have at least 2 rows (header + 1 data row)
- The script skips row 1 (header)

## Manual Alternative

If you prefer not to use Apps Script, follow the manual steps in `GOOGLE_SHEETS_SETUP.md`

