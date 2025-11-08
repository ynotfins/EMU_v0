# Cursor IDE Configuration

This directory contains Cursor-specific configuration and documentation.

## ⚠️ Credentials Location

**This project uses GLOBAL credential management.**

All credentials, API keys, and project information are stored in:
- **`C:\Users\ynotf\Dropbox\.mcp\global-credentials.yaml`**
- **`C:\Users\ynotf\Dropbox\.mcp\global-profile.yaml`**

**DO NOT create** `.cursor/credentials.yaml` or `.cursor/profile.yaml` in this project.

See: **`C:\Users\ynotf\.cursor\rules\global-mcp-system.md`** for details.

## Files

### No Project-Specific Credential Files ❌

This project does NOT have:
- ~~`credentials.yaml`~~ (use global instead)
- ~~`profile.yaml`~~ (use global instead)

All project credentials are in: `C:\Users\ynotf\Dropbox\.mcp\global-credentials.yaml`
All project metadata is in: `C:\Users\ynotf\Dropbox\.mcp\global-profile.yaml`

---

### `environment.json` ✅ Safe to commit

Cursor IDE behavior settings.

**Contains**:

- `agentCanUpdateSnapshot`: Allow agent to update project snapshots

**Purpose**: Control Cursor AI capabilities

---

### `rules/` ✅ Safe to commit

Cursor rules for AI assistant behavior.

**Contains**:

- `.cursor/autonomous-rule-creation` - Auto-create rules from feedback
- `.cursor/coding-standards` - Python coding standards
- `.cursor/memory-bank-instructions` - AI memory management
- `.cursor/python-file-organization` - File location rules
- `.cursor/rule-visibility` - Display applied rules
- `.cursor/rules-location` - Rules directory location

**Purpose**: Guide AI assistant behavior and code generation

---

## How to Use

### For Team Members

1. **Review `profile.yaml`** to understand the project
2. **Review `credentials.yaml`** to see what credentials you need
3. **Set up your `.env.local`** with actual values (never commit this!)
4. **Download `firebase-admin-key.json`** from Firebase Console (never commit this!)

### For AI Assistants

1. **Read `profile.yaml`** at session start for project context
2. **Reference `credentials.yaml`** for credential locations
3. **Follow rules in `rules/`** for code generation
4. **Update Memory Bank** (`docs/memory-bank/`) after significant changes

### For CI/CD

- These files are for local development only
- CI/CD should use encrypted secrets/environment variables
- Never read these files in production builds

---

## Security Notes

### ✅ Safe to Commit

- `credentials.yaml` (template with `${VAR}` references)
- `profile.yaml` (project metadata only)
- `environment.json` (IDE settings)
- `rules/` (AI behavior rules)
- This `README.md`

### ❌ NEVER Commit

- `.env.local` (actual API keys)
- `firebase-admin-key.json` (admin access)
- `*.pem`, `*.key` (private keys)
- Any file with actual passwords/tokens

---

## Updating These Files

### When to Update `credentials.yaml`

- Added new API service
- Changed key locations
- Updated security rules
- New environment variables

### When to Update `profile.yaml`

- Major feature added/changed
- Technology stack changes
- New user roles
- Architecture changes
- Updated roadmap

### When to Update `environment.json`

- Change Cursor AI permissions
- Enable/disable AI features

### When to Update `rules/`

- New coding standards
- Changed file organization
- AI behavior adjustments

---

## Integration with Memory Bank

These files complement but don't replace the Memory Bank (`docs/memory-bank/`):

| File                       | Purpose                | Audience   | Update Frequency         |
| -------------------------- | ---------------------- | ---------- | ------------------------ |
| `.cursor/credentials.yaml` | Credential reference   | Team       | When adding services     |
| `.cursor/profile.yaml`     | Project metadata       | Team + AI  | When major changes occur |
| `docs/memory-bank/`        | AI context & decisions | AI primary | After each session       |

**Memory Bank** = What the AI knows about the project
**Cursor config** = How the team & AI work with the project

---

## MCP Server Configuration

MCP (Model Context Protocol) servers are configured separately in:

**Windows**: `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

**Example**:

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
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

See `docs/FIREBASE_MCP_SETUP.md` and `docs/GITHUB_MCP_DEBUG.md` for details.

---

## Troubleshooting

### "Cursor can't find credentials"

→ Check that `firebase-admin-key.json` and `.env.local` exist in project root

### "MCP server won't connect"

→ Check global MCP settings file (see path above)

### "AI isn't following rules"

→ Verify rules are in `.cursor/rules/` and Cursor has reloaded

### "Credentials exposed in Git"

→ Check `.gitignore`, ensure `.env.local` and `firebase-admin-key.json` are listed

---

## Links

- [Firebase Console](https://console.firebase.google.com/project/emu-incidents)
- [GitHub Repository](https://github.com/ynotfins/EMU_v0)
- [Main Documentation](../docs/README.md)
- [Memory Bank](../docs/memory-bank/)

---

**Last Updated**: 2025-10-28
