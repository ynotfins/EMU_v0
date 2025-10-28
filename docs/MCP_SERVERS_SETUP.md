# MCP Servers Recommended for EMU_v0

## 🤔 Background Agent Status

**Background Agent** is currently in beta and requires:
1. ✅ GitHub repository connected (you have this)
2. ✅ Cursor Pro/Business subscription (check your plan)
3. ✅ Explicit enablement in settings

**Why it might not be available:**
- May require Cursor Pro/Business tier
- May be in limited beta (not all accounts have access)
- Check: Settings → Features → Background Agent

**Workaround**: Use MCP servers + standard agent instead

---

## 🔧 MCP Servers to Set Up

### 1️⃣ Chrome DevTools MCP (Already Available)

**Status**: ✅ Already installed in Cursor

**What it does**:
- Control Chrome/Edge browser from Cursor
- Take screenshots of your app
- Test UI interactions automatically
- Debug rendering issues
- Performance profiling

**Use cases for EMU_v0**:
- ✅ Test incident list rendering
- ✅ Test favorites/bookmarks toggling
- ✅ Screenshot different roles (chaser vs supe)
- ✅ Test mobile responsive layouts
- ✅ Verify Firebase real-time updates

**How to use**:
```
In chat: "Open Chrome and navigate to localhost:3000"
In chat: "Take a screenshot of the incidents page"
In chat: "Click the favorite button on the first incident"
```

---

### 2️⃣ Firebase MCP (Community Server)

**Status**: ❌ Not yet configured

**What it does**:
- Read/write Firestore from Cursor
- Query Firebase data directly
- Test security rules
- Seed test data
- Check auth state

**Use cases for EMU_v0**:
- ✅ Seed incident test data
- ✅ Check user favorites/bookmarks
- ✅ Test Firestore queries
- ✅ Verify security rules
- ✅ Monitor real-time listeners

**Setup**:
```json
// Add to Cursor MCP settings
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-firebase"],
      "env": {
        "FIREBASE_PROJECT_ID": "emu-incidents",
        "GOOGLE_APPLICATION_CREDENTIALS": "./firebase-admin-key.json"
      }
    }
  }
}
```

**Priority**: 🔥 **HIGH** - Would be very useful for this project

---

### 3️⃣ GitHub MCP (Official Server)

**Status**: ❌ Not yet configured

**What it does**:
- Create issues from chat
- Review PRs
- Search repository
- File operations via GitHub API
- Commit/push automation

**Use cases for EMU_v0**:
- ✅ Create feature issues
- ✅ Track bugs
- ✅ Generate changelogs
- ✅ Auto-commit progress

**Setup**:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}
```

**Priority**: 🟡 **MEDIUM** - Nice to have, but we already have Git CLI

---

### 4️⃣ PostgreSQL/SQLite MCP

**Status**: ❌ Not applicable

**Why**: We use Firestore (NoSQL), not SQL databases

**Priority**: ⚪ **SKIP**

---

### 5️⃣ Puppeteer MCP (Browser Automation)

**Status**: ❌ Not yet configured

**What it does**:
- Advanced browser automation
- E2E testing
- Screenshot comparison
- Performance testing

**Use cases for EMU_v0**:
- ✅ E2E test flows (login → view incident → favorite)
- ✅ Test across different screen sizes
- ✅ Automated regression testing
- ✅ Generate UI documentation

**Setup**:
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

**Priority**: 🟡 **MEDIUM** - Overlaps with Chrome DevTools MCP

---

### 6️⃣ Filesystem MCP (Local Files)

**Status**: ✅ Already have file tools built-in

**Priority**: ⚪ **SKIP** - Not needed

---

## 🎯 Recommended Setup Priority

### Must Have (Do Now)
1. ✅ **Chrome DevTools MCP** - Already available, test it!

### Should Have (Do Next)
2. 🔥 **Firebase MCP** - Direct Firestore access would be game-changing

### Nice to Have (Do Later)
3. 🟡 **GitHub MCP** - Useful but not critical
4. 🟡 **Puppeteer MCP** - Only if Chrome DevTools isn't enough

---

## 🧪 Test Chrome DevTools MCP Now

Let me verify it's working:

**Test 1**: List available pages
**Test 2**: Open browser to localhost
**Test 3**: Take screenshot

Want me to test it? Just say "test Chrome MCP"

---

## 📝 How to Configure MCP Servers in Cursor

### Windows Path:
`%APPDATA%\Cursor\User\globalStorage\mcp-settings.json`

or

Settings → Extensions → Model Context Protocol → Edit Settings

### Format:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "API_KEY": "value"
      }
    }
  }
}
```

---

## 🔥 Next Steps

1. ✅ **Test Chrome DevTools MCP** (available now)
2. 🔥 **Set up Firebase MCP** (would be incredibly useful)
3. 🚀 **Start building features** (MCP helps but isn't blocking)

**Want me to:**
- A) Test Chrome DevTools MCP with your app?
- B) Help set up Firebase MCP?
- C) Skip MCP for now and continue Firebase development?

