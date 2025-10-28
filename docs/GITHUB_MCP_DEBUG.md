# GitHub MCP Debug Guide

## 🟡 Problem: GitHub MCP Stuck on "Loading Tools..."

This is a common issue with GitHub MCP in Cursor.

---

## 🔍 Root Causes

### 1. Missing or Invalid GitHub Token
**Symptom**: Yellow status, never turns green
**Fix**: Generate new Personal Access Token

### 2. Incorrect MCP Configuration Path
**Symptom**: MCP settings not being read
**Fix**: Verify settings file location

### 3. Token Permissions Too Limited
**Symptom**: MCP connects but hangs on authentication
**Fix**: Grant correct scopes

### 4. Network/Proxy Issues
**Symptom**: Connection timeout
**Fix**: Check firewall/proxy settings

---

## ✅ Step-by-Step Fix

### Step 1: Generate GitHub Personal Access Token

1. **Go to**: https://github.com/settings/tokens/new

2. **Name**: `Cursor MCP - EMU_v0`

3. **Expiration**: 90 days (or custom)

4. **Select Scopes**:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:org` (Read org and team membership)
   - ✅ `read:user` (Read user profile data)
   - ✅ `user:email` (Access user email addresses)

5. **Generate token** and **copy it** (you can't see it again!)

---

### Step 2: Find Your Cursor MCP Settings File

**Windows Path**:
```
%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

**Quick open in PowerShell**:
```powershell
code "$env:APPDATA\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json"
```

**If file doesn't exist**, create it manually.

---

### Step 3: Configure GitHub MCP

**Add or update** in `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

**Important**: 
- Token starts with `ghp_`
- Use double quotes (JSON format)
- No trailing commas

---

### Step 4: Verify npx and GitHub MCP Package

Test the GitHub MCP server manually:

```powershell
# Test npx is working
npx --version

# Test GitHub MCP package can be downloaded
npx -y @modelcontextprotocol/server-github --help
```

**Expected**: Should download and show help message

**If it fails**: Your network may be blocking npm registry

---

### Step 5: Complete Cursor Restart

**Not just reload** - Full restart:

1. **Close** all Cursor windows
2. **Kill** Cursor process in Task Manager (if stuck)
3. **Reopen** Cursor
4. **Open** your project: `D:\github\EMU_v0`

---

### Step 6: Check MCP Status

Look for GitHub MCP in:
- Bottom status bar (should show green checkmark)
- Settings → Extensions → MCP (should list "github")
- Dev Console: `Ctrl+Shift+I` → Console tab (check for errors)

---

## 🧪 Test GitHub MCP

Once green, try these commands in chat:

### Test 1: List Repository
```
"List files in this GitHub repository"
```

### Test 2: Create Issue
```
"Create a GitHub issue titled 'Test MCP Connection' with body 'Testing GitHub MCP setup'"
```

### Test 3: Search Code
```
"Search this repository for 'Firebase' and show me where it's used"
```

---

## 🚨 Advanced Troubleshooting

### Check Cursor Dev Console
```
1. Ctrl+Shift+I (open DevTools)
2. Console tab
3. Look for lines containing "MCP" or "github"
4. Copy any error messages
```

### Check Network Requests
```
1. Ctrl+Shift+I (open DevTools)
2. Network tab
3. Look for failed requests to:
   - registry.npmjs.org
   - api.github.com
4. Check status codes (403 = auth issue, 404 = not found)
```

### Test GitHub Token Directly
```powershell
$token = "ghp_YOUR_TOKEN_HERE"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
```

**Expected**: Should return your GitHub user info

**If it fails**: Token is invalid or expired

---

## 🔄 Alternative: GitHub CLI Instead of MCP

If GitHub MCP won't work, use GitHub CLI:

```powershell
# Install GitHub CLI
winget install --id GitHub.cli

# Authenticate
gh auth login

# Use directly in terminal
gh issue create --title "Test" --body "Testing"
gh repo view
gh pr list
```

**Advantage**: More stable, better tested
**Disadvantage**: Not integrated with Cursor chat

---

## 📊 Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Command not found: npx" | Node.js not in PATH | Restart terminal, check `node --version` |
| "401 Unauthorized" | Invalid GitHub token | Regenerate token with correct scopes |
| "ENOTFOUND registry.npmjs.org" | Network issue | Check proxy/firewall settings |
| "Timeout waiting for MCP server" | Server crashed on startup | Check Cursor console for stack trace |
| "Cannot find module" | Package download failed | Try: `npm install -g @modelcontextprotocol/server-github` |

---

## ✅ Success Checklist

- [ ] GitHub token generated with `repo`, `read:org`, `read:user` scopes
- [ ] Token copied and saved securely
- [ ] `cline_mcp_settings.json` configured with token
- [ ] npx working: `npx --version` succeeds
- [ ] GitHub MCP package tested: `npx -y @modelcontextprotocol/server-github --help`
- [ ] Cursor completely restarted (not just reloaded)
- [ ] MCP shows green checkmark in status bar
- [ ] Test command works: "List files in this repo"

---

## 🎯 Expected Result

Once working, you can:

✅ **Create issues** from chat
✅ **Search repository** semantically
✅ **Review code** without leaving Cursor
✅ **Generate changelogs** automatically
✅ **File operations** via GitHub API

**But honestly**: Git CLI + Cursor terminal does 90% of this already. GitHub MCP is nice-to-have, not critical.

---

## 💡 Recommendation

If GitHub MCP is still stuck after following this guide:

**Skip it for now** and use:
- Git CLI (`git commit`, `git push`)
- GitHub CLI (`gh issue create`)
- Web browser (github.com)

Focus on building features instead of debugging MCP setup!

