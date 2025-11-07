# Google Sheets Import Guide

## Option 1: Export as CSV (Recommended)

1. Open your Google Sheets file
2. Go to **File → Download → Comma-separated values (.csv)**
3. Save the file to your computer
4. Run: `pnpm run import:fire-departments path/to/your-file.csv`
5. The script will convert it to JSON and you can import it via the UI

## Option 2: Import Directly from Google Sheets URL

1. Make your Google Sheets file **publicly viewable**:
   - Click **Share** button
   - Change to **"Anyone with the link"** → **"Viewer"**
   - Copy the share URL

2. In the Fire Departments page, click **"Import from Google Sheets"**
3. Paste the Google Sheets URL
4. The system will automatically fetch and import the data

## Option 3: Use Browser Extension (For AI Assistant)

If you want me to access your Google Sheets directly:

1. Share the Google Sheets URL with me
2. I can use the browser extension to navigate to it
3. I can extract the data and help you format it

**Note:** Make sure the sheet has these columns:
- `fdid` (required)
- `name` (required)  
- `state` (required)
- `county` (optional)
- `city` (optional)
- `address` (optional)
- `zipCode` or `zipcode` (optional)
- `phone` (optional)
- `website` (optional)
- `encryptionPolicy` or `encryption policy` (optional - values: `all_unencrypted`, `first_unencrypted_then_encrypted`, `all_encrypted`, `unknown`)
- `notes` (optional)

## CSV Format Example

```csv
fdid,name,state,county,city,address,zipCode,phone,website,encryptionPolicy,notes
00001,Example Fire Department,NJ,Monmouth,Example City,123 Main St,07701,(555) 123-4567,https://example.com,all_unencrypted,All calls on unencrypted channel
00002,Another Department,PA,Chester,Another City,456 Oak Ave,19301,(555) 987-6543,https://another.com,first_unencrypted_then_encrypted,First call unencrypted, rest encrypted
```

