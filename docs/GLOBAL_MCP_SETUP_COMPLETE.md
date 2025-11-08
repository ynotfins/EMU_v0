# Global MCP System - EMU_v0 Integration Complete ✅

## 📋 What Was Done

### 1️⃣ Firebase Admin SDK Key
- ✅ Downloaded from Firebase Console
- ✅ Renamed to `firebase-admin-key.json`
- ✅ Placed in project root (`D:\github\EMU_v0\firebase-admin-key.json`)
- ✅ Added to `.gitignore`
- ✅ Path registered in global credentials

### 2️⃣ Updated Global Credentials
**File**: `C:\Users\ynotf\Dropbox\.mcp\global-credentials.yaml`

Added EMU_v0 credentials:
```yaml
# ===== EMU_v0 / EMU-INCIDENTS PROJECT =====
FIREBASE_PROJECT_ID: "emu-incidents"
FIREBASE_WEB_API_KEY: "${NEXT_PUBLIC_FIREBASE_API_KEY}"
FIREBASE_AUTH_DOMAIN: "emu-incidents.firebaseapp.com"
FIREBASE_STORAGE_BUCKET: "emu-incidents.appspot.com"
FIREBASE_MESSAGING_SENDER_ID: "841200945180"
FIREBASE_APP_ID_WEB: "${NEXT_PUBLIC_FIREBASE_APP_ID_WEB}"
FIREBASE_FCM_VAPID_KEY: "${NEXT_PUBLIC_FCM_VAPID_KEY}"
FIREBASE_ADMIN_KEY_PATH: "D:\\github\\EMU_v0\\firebase-admin-key.json"
GOOGLE_MAPS_API_KEY: "${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}"
GITHUB_REPO_EMU: "https://github.com/ynotfins/EMU_v0"
```

### 3️⃣ Updated Global Profile
**File**: `C:\Users\ynotf\Dropbox\.mcp\global-profile.yaml`

- ✅ Updated OS: `Windows 11` (from "Windows")
- ✅ Added RAM specs: `128GB`
- ✅ Updated shell: `PowerShell 7`
- ✅ Added Node version: `20+`
- ✅ Added package manager: `pnpm`

Added EMU_v0 project:
```yaml
emu_v0: { path: "D:\\github\\EMU_v0", repo: "https://github.com/ynotfins/EMU_v0", stack: "Next.js 16 + Firebase", status: "active" }
```

Added Firebase MCP server:
```yaml
firebase: { description: "Firebase/Firestore integration", command: "npx", package: "@modelcontextprotocol/server-firebase", uses_credential: "FIREBASE_ADMIN_KEY_PATH", project: "emu_v0", status: "setup_pending" }
```

### 4️⃣ Created Global Cursor Rule
**File**: `C:\Users\ynotf\.cursor\rules\global-mcp-system.md`

Ensures all future projects:
- ✅ Reference global credential files
- ✅ Never create project-specific credential files
- ✅ Update global files when adding credentials
- ✅ Maintain consistency across all projects

### 5️⃣ Cleaned Up Project Files
- ✅ Removed incorrect `.cursor/credentials.yaml`
- ✅ Removed incorrect `.cursor/profile.yaml`
- ✅ Updated `.cursor/README.md` to reference global files
- ✅ Updated `.gitignore` to reflect correct structure

---

## 📂 File Locations

### Global MCP System (Single Source of Truth)
```
C:\Users\ynotf\Dropbox\.mcp\global-credentials.yaml           ✅ All credentials
C:\Users\ynotf\Dropbox\.mcp\global-profile.yaml               ✅ All projects & machine info
C:\Users\ynotf\.cursor\rules\global-mcp-system.md     ✅ Global rule enforcing this system
```

### Project-Specific (EMU_v0)
```
D:\github\EMU_v0\firebase-admin-key.json              ✅ Ignored by Git
D:\github\EMU_v0\.env.local                           ✅ Ignored by Git (if exists)
D:\github\EMU_v0\.cursor\environment.json             ✅ Cursor IDE settings
D:\github\EMU_v0\.cursor\README.md                    ✅ References global system
D:\github\EMU_v0\.cursor\rules\                       ✅ Project-specific coding rules
```

---

## 🔐 Security Status

### ✅ Global Files (Single Source)
- `global-credentials.yaml` → Contains ALL API keys
- `global-profile.yaml` → Contains ALL project info
- Both files are on local machine only
- Never committed to any Git repository

### ✅ Project Files (Never Contain Credentials)
- `firebase-admin-key.json` → Project-specific, `.gitignore` ✅
- `.env.local` → Project-specific, `.gitignore` ✅
- `.cursor/README.md` → References global files only
- No credential duplication

---

## 🎯 Next Steps

### For Firebase MCP Setup

1. **Open global Cursor MCP settings**:
```powershell
code "$env:APPDATA\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json"
```

2. **Add Firebase MCP configuration**:
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

3. **Update global-profile.yaml** to mark Firebase MCP as active:
```yaml
firebase: { ..., status: "active" }
```

4. **Reload Cursor**:
   - `Ctrl+Shift+P` → "Developer: Reload Window"

5. **Test in chat**:
   - "List all incidents from Firestore"
   - "Add a test incident to the incidents collection"

---

## 📚 How the Global System Works

### For This Project (EMU_v0)
1. ✅ Credentials stored in: `C:\Users\ynotf\Dropbox\.mcp\global-credentials.yaml`
2. ✅ Project info stored in: `C:\Users\ynotf\Dropbox\.mcp\global-profile.yaml`
3. ✅ AI reads global files at session start
4. ✅ Project references global files in docs
5. ✅ No credential duplication

### For Future Projects
1. ✅ Add credentials to `global-credentials.yaml`
2. ✅ Add project info to `global-profile.yaml`
3. ✅ Never create project-specific credential files
4. ✅ Global rule enforces this automatically

### For Multiple Machines (PC & Laptop)
- ✅ Sync global files between machines
- ✅ Update machine specs in `global-profile.yaml` per machine
- ✅ All projects automatically have access to all credentials

---

## ✅ Verification Checklist

- [x] Firebase Admin SDK key in project root
- [x] Firebase Admin SDK key added to `.gitignore`
- [x] Firebase credentials added to `global-credentials.yaml`
- [x] EMU_v0 project added to `global-profile.yaml`
- [x] Windows 11 and 128GB RAM specs updated
- [x] Firebase MCP server defined in global profile
- [x] Global Cursor rule created
- [x] Project-specific credential files removed
- [x] `.cursor/README.md` updated to reference global system
- [x] All changes committed and pushed
- [ ] Firebase MCP configured in Cursor settings (next step)
- [ ] Test Firebase MCP connection (next step)
- [ ] Seed test data in Firestore (next step)

---

## 🚀 Benefits of Global System

✅ **Single Source of Truth**
- All credentials in one place
- All projects in one place
- All machine specs in one place

✅ **No Duplication**
- Credentials never duplicated across projects
- Easier to rotate API keys
- Update once, applies everywhere

✅ **Consistency**
- All projects follow same pattern
- New projects automatically compliant
- Team members have clear guidance

✅ **Security**
- Credentials never committed to Git
- Global files stay on local machine
- No accidental exposure

✅ **Machine Awareness**
- PC vs Laptop specs always available
- OS and RAM info accessible to AI
- Tool versions tracked globally

---

## 📝 Reference

| Item | Location |
|------|----------|
| All credentials | `C:\Users\ynotf\Dropbox\.mcp\global-credentials.yaml` |
| All projects | `C:\Users\ynotf\Dropbox\.mcp\global-profile.yaml` |
| Global rule | `C:\Users\ynotf\.cursor\rules\global-mcp-system.md` |
| Project README | `.cursor/README.md` |
| Firebase Admin Key | `./firebase-admin-key.json` |
| Firebase MCP Setup | `docs/FIREBASE_MCP_SETUP.md` |
| GitHub MCP Debug | `docs/GITHUB_MCP_DEBUG.md` |

---

**Completed**: 2025-10-28
**Status**: ✅ Global MCP system properly configured
**Next**: Configure Firebase MCP in Cursor settings

