/**
 * Google Apps Script to Set Up Fire Department Spreadsheet
 * 
 * Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Paste this code
 * 4. Click Run → runSetup
 * 5. Authorize the script when prompted
 */

function runSetup() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  // Step 1: Set up data validation for Encryption Policy (Column AC)
  setupEncryptionPolicyValidation(sheet, lastRow);
  
  // Step 2: Set up data validation for Code Confidence (Column AF)
  setupCodeConfidenceValidation(sheet, lastRow);
  
  // Step 3: Format Last Updated column (Column AG) as Date/Time
  formatLastUpdatedColumn(sheet, lastRow);
  
  SpreadsheetApp.getUi().alert('Setup complete! Data validation and formatting applied.');
}

function setupEncryptionPolicyValidation(sheet, lastRow) {
  const columnAC = 29; // AC is column 29 (A=1, B=2, ..., AC=29)
  const range = sheet.getRange(2, columnAC, lastRow - 1, 1); // Skip header row
  
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['all_unencrypted', 'first_unencrypted_then_encrypted', 'all_encrypted', 'unknown'], true)
    .setAllowInvalid(false)
    .setHelpText('Select encryption policy: all_unencrypted, first_unencrypted_then_encrypted, all_encrypted, or unknown')
    .build();
  
  range.setDataValidation(rule);
  Logger.log('Encryption Policy validation set up for column AC');
}

function setupCodeConfidenceValidation(sheet, lastRow) {
  const columnAF = 32; // AF is column 32
  const range = sheet.getRange(2, columnAF, lastRow - 1, 1); // Skip header row
  
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['confirmed', 'likely', 'unknown'], true)
    .setAllowInvalid(false)
    .setHelpText('Select confidence level: confirmed, likely, or unknown')
    .build();
  
  range.setDataValidation(rule);
  Logger.log('Code Confidence validation set up for column AF');
}

function formatLastUpdatedColumn(sheet, lastRow) {
  const columnAG = 33; // AG is column 33
  const range = sheet.getRange(2, columnAG, lastRow - 1, 1); // Skip header row
  
  range.setNumberFormat('MM/DD/YYYY HH:MM:SS');
  Logger.log('Last Updated column formatted as Date/Time');
}

/**
 * Optional: Auto-populate Last Updated when row is edited
 * Set this up as an onEdit trigger
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const row = range.getRow();
  const col = range.getColumn();
  
  // If editing columns AC-AF (29-32), update Last Updated (AG=33) and Updated By (AH=34)
  if (row > 1 && col >= 29 && col <= 32) {
    const lastUpdatedCell = sheet.getRange(row, 33); // Column AG
    const updatedByCell = sheet.getRange(row, 34); // Column AH
    
    lastUpdatedCell.setValue(new Date());
    updatedByCell.setValue(Session.getActiveUser().getEmail());
  }
}

