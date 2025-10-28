# Extension Disabling - The Actual Truth

## ❌ Common Misconception

**You CANNOT disable extensions via `settings.json`** - this is a VS Code limitation.

---

## 🎯 What's Actually Possible

### Method 1: Manual Disable (Official)

**Status**: Only official way
**Persistence**: Workspace-level
**Storage**: VS Code's workspace storage database (not git-tracked)

**How**:

1. Open Extensions (`Ctrl+Shift+X`)
2. Click gear ⚙️ on extension
3. Select "Disable (Workspace)"

**Pros**:

- ✅ Official VS Code feature
- ✅ Reliable
- ✅ Per-workspace

**Cons**:

- ❌ Manual process
- ❌ Not version-controlled
- ❌ Doesn't sync across machines

---

### Method 2: Third-Party Extension (Automated)

**Extension**: [Disable Extensions](https://marketplace.visualstudio.com/items?itemName=muzaisimao.vscode-disable-extensions)
**Config File**: `.vscode/ext.config.json`
**Status**: ✅ Configured in this workspace

**How it works**:

1. Install the "Disable Extensions" extension
2. It reads `.vscode/ext.config.json`
3. Auto-disables listed extensions when workspace opens

**Pros**:

- ✅ Automated
- ✅ Version-controlled (committed to git)
- ✅ Syncs across machines
- ✅ Team-wide enforcement

**Cons**:

- ❌ Requires installing one more extension
- ❌ Not official VS Code feature

---

### Method 3: Feature Disables (What We Did)

**File**: `.vscode/settings.json`
**Example**: `"python.enabled": false`

**What it does**:

- ✅ Disables language servers
- ✅ Turns off file watchers
- ✅ Stops background processes

**What it DOESN'T do**:

- ❌ Doesn't unload the extension
- ❌ Extension still shows as "Enabled"
- ❌ Still uses some memory/startup time

**Value**: Reduces performance impact even if extensions stay enabled

---

## 🎯 Our Current Setup

### What We Have:

1. **`.vscode/settings.json`**: Feature-level disables for Python, Java, Docker, etc.

   - Prevents heavy language servers from running
   - Reduces CPU/memory usage
   - Extensions technically still "enabled" but mostly dormant

2. **`.vscode/ext.config.json`**: Auto-disable config for "Disable Extensions" extension

   - Lists 26 extensions to disable
   - Requires installing `muzaisimao.vscode-disable-extensions`
   - Will auto-disable on workspace open

3. **`.vscode/extensions.json`**: Recommendations and unwanted list
   - Prompts to install recommended extensions
   - Marks unwanted extensions
   - Doesn't actually disable anything

---

## 📋 Your Two Options

### Option A: Use Third-Party Extension (Recommended)

**Install the auto-disabler**:

1. Open Extensions (`Ctrl+Shift+X`)
2. Search: `muzaisimao.vscode-disable-extensions`
3. Click "Install"
4. Reload window
5. Extensions in `ext.config.json` will auto-disable

**Pros**: One-time setup, then automatic

---

### Option B: Manual Disable (Traditional)

**Disable each extension manually**:

- See list in `docs/EXTENSION_CLEANUP.md`
- Takes 5 minutes
- Doesn't sync to other machines

---

## 🤝 My Apology

I should have been clearer from the start:

**What I said**: "I'll disable extensions in settings.json"
**What's actually possible**: "I'll disable extension _features_ in settings.json"

There's no native VS Code way to disable extensions via JSON config files. The third-party extension is the closest we can get to automated workspace-level disabling.

---

## ✅ Recommendation

1. **Install**: `muzaisimao.vscode-disable-extensions`
2. **Reload**: Window
3. **Done**: Extensions auto-disable based on `ext.config.json`

This gives you the automated behavior you originally asked for.
