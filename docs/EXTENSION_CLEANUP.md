# Extension Cleanup Guide

## ⚠️ The Problem

VS Code workspace configuration can **recommend** or mark extensions as **unwanted**, but it **CANNOT automatically disable** them. You must manually disable extensions in the UI.

**Current Status**: 23 enabled, 17 disabled (many irrelevant extensions still active)

---

## 🎯 Goal: Keep Only 9 Essential Extensions

### ✅ Keep These (Recommended):

1. **dbaeumer.vscode-eslint** - ESLint linting
2. **bradlc.vscode-tailwindcss** - Tailwind CSS IntelliSense
3. **esbenp.prettier-vscode** - Code formatting
4. **eamodio.gitlens** - Git integration
5. **usernamehw.errorlens** - Inline error display
6. **streetsidesoftware.code-spell-checker** - Spell checking
7. **christian-kohler.path-intellisense** - Path autocomplete
8. **editorconfig.editorconfig** - EditorConfig support
9. **redhat.vscode-yaml** - YAML support

### ❌ Disable These (Unwanted):

**Python/Data Science** (not needed for this Next.js/TypeScript project):

- `ms-python.python`
- `ms-python.debugpy`
- `ms-vscode.vscode-pylance`

**Docker/Containers** (not actively used):

- `ms-azuretools.vscode-docker`
- `ms-azuretools.vscode-docker-compose`
- `ms-azuretools.vscode-azurecontainerapps`
- `anyspere.vscode-dev-containers`

**Cloud Tools** (not needed):

- `googlecloudtools.cloudcode`
- `googlecloudtools.firebase-dataconnect`
- `google.geminicodeassist`

**Mobile Development** (not needed):

- `adelphes.android-dev-ext`
- `surendrajat.apklab`
- `expo.vscode-expo-tools`

**Java/Kotlin** (not needed):

- `vscjava.vscode-java-pack`
- `vscjava.vscode-maven`
- `vscjava.vscode-gradle`
- `redhat.java`
- `vscjava.vscode-java-test`
- `mathiasfrohlich.Kotlin`

**Other Tools**:

- `ms-vscode.powershell` - PowerShell language server
- `graphql.vscode-graphql` - GraphQL tools
- `redhat.vscode-xml` - XML tools
- `lokalise.i18n-ally` - i18n management
- `sonarsource.sonarlint-vscode` - SonarLint analysis
- `LoyieKing.es6-mocha-snippets` - Mocha snippets

---

## 🛠️ How to Disable Extensions (Manual Process)

### Method 1: Extensions Panel (Recommended)

1. **Open Extensions**: `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac)

2. **For each unwanted extension**:

   - Search for the extension by name
   - Click the **gear icon** ⚙️ next to the extension
   - Select **"Disable (Workspace)"**

3. **Reload window**: `Ctrl+Shift+P` → "Reload Window"

### Method 2: Quick Disable Script

Run the audit script to see the full list:

```bash
npm run ext:audit
```

### Method 3: Batch Disable (Advanced)

If you want to uninstall (not just disable) unwanted extensions:

```bash
# List all installed extensions
code --list-extensions

# Uninstall specific extensions (example)
code --uninstall-extension ms-python.python
code --uninstall-extension ms-azuretools.vscode-docker
# ... etc
```

---

## ✅ Verification

After disabling, you should see:

- **~9 enabled** (only the recommended ones)
- **~17+ disabled** (all the unwanted ones)

Run this to check the policy:

```bash
npm run ext:audit
```

---

## 🚀 Performance Benefits

Disabling unused extensions:

- ✅ Reduces Cursor startup time
- ✅ Lowers memory usage
- ✅ Prevents conflicting language servers
- ✅ Removes unnecessary UI clutter
- ✅ Speeds up indexing and IntelliSense

---

## 📝 Notes

- **Workspace vs Global**: "Disable (Workspace)" only disables for this project
- **Cursor Specific**: Some extensions are Cursor-specific and should be kept
- **Settings Applied**: `.vscode/settings.json` already has aggressive disable flags for extension features
- **Extensions.json**: The `unwantedRecommendations` list prevents VS Code from suggesting those extensions

---

## 🔄 If You Need a Clean Slate

To completely reset:

1. Close Cursor
2. Delete workspace storage:
   ```
   %APPDATA%\Cursor\User\workspaceStorage\<hash-for-this-workspace>
   ```
3. Reopen workspace
4. Manually disable unwanted extensions again

**Reminder**: VS Code does not provide a programmatic way to disable extensions at the workspace level. This is a limitation of the VS Code extension system.
