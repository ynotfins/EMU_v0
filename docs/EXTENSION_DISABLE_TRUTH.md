# Extension Disabling Truth

## ❌ What DOESN'T Work

### `settings.json` CANNOT disable extensions
```json
{
  "python.enabled": false  // ❌ Only disables Python features, extension still loads
}
```

### `extensions.json` unwanted list
```json
{
  "unwantedRecommendations": ["ms-python.python"]  // ❌ Only hides recommendations
}
```

## ✅ What DOES Work

### Option 1: Manual UI Disable (Most Reliable)
1. Open Extensions: `Ctrl+Shift+X`
2. Find extension (e.g., "Python")
3. Click gear icon → **Disable (Workspace)**
4. Repeat for each unwanted extension

### Option 2: Third-Party Extension (Unreliable in Cursor)
- `muzaisimao.vscode-disable-extensions` works in VS Code
- In Cursor: opens new window, doesn't work properly
- **NOT RECOMMENDED for Cursor**

### Option 3: Uninstall (Nuclear Option)
- Permanently removes extension
- Affects ALL workspaces
- Use only if never needed

## 🎯 Current Status

**Target**: 10 enabled, 26 disabled
**Actual**: 24 enabled, 17 disabled
**Gap**: 14 extensions need manual disabling

## 📝 Next Step

Use the manual guide in `docs/EXTENSION_CLEANUP.md`
