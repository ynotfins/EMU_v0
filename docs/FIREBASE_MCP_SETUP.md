# Firebase MCP Setup Guide

## 📋 Prerequisites

- Firebase project: `emu-incidents` ✅
- Firebase CLI installed ✅
- Admin SDK access needed

---

## 🔑 Step 1: Generate Service Account Key

### Option A: Firebase Console (Recommended)

1. **Go to**: https://console.firebase.google.com/project/emu-incidents/settings/serviceaccounts/adminsdk

2. **Click**: "Generate new private key"

3. **Download**: `emu-incidents-firebase-adminsdk-xxxxx.json`

4. **Move to project**:

```powershell
Move-Item ~/Downloads/emu-incidents-firebase-adminsdk-*.json ./firebase-admin-key.json
```

5. **Add to .gitignore**:

```powershell
echo "firebase-admin-key.json" >> .gitignore
```

### Option B: Firebase CLI

```bash
firebase login
firebase apps:sdkconfig
```

---

## ⚙️ Step 2: Configure Cursor MCP Settings

### Location:

Windows: `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

or

Settings → Extensions → MCP → Edit in settings.json

### Add This Configuration:

```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-firebase"],
      "env": {
        "FIREBASE_PROJECT_ID": "emu-incidents",
        "GOOGLE_APPLICATION_CREDENTIALS": "D:\\github\\EMU_v0\\firebase-admin-key.json"
      }
    }
  }
}
```

**Important**: Use absolute path for `GOOGLE_APPLICATION_CREDENTIALS`

---

## 🔄 Step 3: Reload Cursor

1. **Save** the MCP settings file
2. **Reload**: `Ctrl+Shift+P` → "Developer: Reload Window"
3. **Verify**: MCP server should appear as green/active

---

## 🧪 Step 4: Test Firebase MCP

Once configured, you can:

### Seed Test Data:

```
In chat: "Add a test incident to Firestore with these fields:
- incidentNumber: 12345
- type: Fire
- address: 123 Main St
- city: Austin
- state: TX
- lat: 30.2672
- lng: -97.7431
- updatedAt: now
"
```

### Query Data:

```
In chat: "List all incidents from Firestore"
In chat: "Show me all favorited incidents"
```

### Check Security Rules:

```
In chat: "Test if my Firestore rules allow anonymous users to read incidents"
```

---

## 🚨 Troubleshooting

### Error: "Cannot find module"

- Ensure `npx` is working: `npx --version`
- Try global install: `npm install -g @modelcontextprotocol/server-firebase`

### Error: "GOOGLE_APPLICATION_CREDENTIALS not found"

- Use **absolute path** (not relative)
- Check file exists: `Test-Path firebase-admin-key.json`

### Error: "Permission denied"

- Service account needs "Firebase Admin SDK Administrator Service Agent" role
- Go to IAM in Firebase Console and verify

### MCP Server Shows Yellow "Loading"

- Check Cursor dev console: `Ctrl+Shift+I` → Console tab
- Look for MCP connection errors
- Restart Cursor completely

---

## 📦 Alternative: Local Firebase Emulator

If you prefer not to use production Firestore:

```bash
firebase init emulators
firebase emulators:start
```

Then point MCP to emulator:

```json
{
  "env": {
    "FIRESTORE_EMULATOR_HOST": "localhost:8080"
  }
}
```

---

## ✅ Success Checklist

- [ ] Service account key downloaded
- [ ] `firebase-admin-key.json` in project root
- [ ] Added to `.gitignore`
- [ ] MCP settings configured with absolute path
- [ ] Cursor reloaded
- [ ] MCP server shows green/active
- [ ] Test query works from chat

---

## 🎯 What You'll Be Able to Do

Once Firebase MCP is set up:

✅ **Seed test data** without Firebase Console
✅ **Query Firestore** directly from chat
✅ **Test security rules** in real-time
✅ **Debug data issues** faster
✅ **Bulk operations** (e.g., "add 10 test incidents")

This will save you **hours** of manual Firebase Console work!
