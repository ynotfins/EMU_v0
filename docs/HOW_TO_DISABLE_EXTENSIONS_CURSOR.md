# Manual Extension Disabling Guide for Cursor

## 🎯 Goal
Disable 14 unwanted extensions to go from **24 enabled → 10 enabled**

## 📋 Step-by-Step Instructions

### 1. Open Extensions Panel
Press: `Ctrl+Shift+X`

### 2. Search for Each Extension Below

For each extension in the list:

1. **Type the extension name** in the search box
2. **Find it in the results** (look for exact match)
3. **Click the gear icon** (⚙️) next to the extension
4. **Select: "Disable (Workspace)"**
5. **Repeat** for next extension

---

## 🚫 Extensions to Disable

### Python Toolchain (3 extensions)
- [ ] **Python** (ms-python.python)
- [ ] **Pylance** (ms-python.vscode-pylance)
- [ ] **Python Debugger** (ms-python.debugpy)

### Cloud & Container Tools (5 extensions)
- [ ] **Docker** (ms-azuretools.vscode-docker)
- [ ] **Docker Compose** (ms-azuretools.vscode-docker-compose)
- [ ] **Azure Container Apps** (ms-azuretools.vscode-azurecontainerapps)
- [ ] **Cloud Code** (googlecloudtools.cloudcode)
- [ ] **Firebase DataConnect** (googlecloudtools.firebase-dataconnect)

### Mobile & Java Development (6 extensions)
- [ ] **Android Dev Ext** (adelphes.android-dev-ext)
- [ ] **APKLab** (surendrajat.apklab)
- [ ] **Expo Tools** (expo.vscode-expo-tools)
- [ ] **Java Extension Pack** (vscjava.vscode-java-pack)
- [ ] **Kotlin** (mathiasfrohlich.Kotlin)
- [ ] **Language Support for Java** (redhat.java)

### Other Language Tools (5 extensions)
- [ ] **GraphQL** (graphql.vscode-graphql)
- [ ] **XML** (redhat.vscode-xml)
- [ ] **PowerShell** (ms-vscode.powershell)
- [ ] **SonarLint** (sonarsource.sonarlint-vscode)
- [ ] **i18n Ally** (lokalise.i18n-ally)

### AI Assistants (1 extension)
- [ ] **Gemini Code Assist** (google.geminicodeassist)

---

## ✅ Extensions to KEEP ENABLED

These should remain enabled (do NOT disable):

- ✅ **ESLint** (dbaeumer.vscode-eslint)
- ✅ **Prettier** (esbenp.prettier-vscode)
- ✅ **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- ✅ **GitLens** (eamodio.gitlens)
- ✅ **Error Lens** (usernamehw.errorlens)
- ✅ **Code Spell Checker** (streetsidesoftware.code-spell-checker)
- ✅ **Path Intellisense** (christian-kohler.path-intellisense)
- ✅ **EditorConfig** (editorconfig.editorconfig)
- ✅ **YAML** (redhat.vscode-yaml)
- ✅ **GitHub Pull Requests** (github.vscode-pull-request-github)

---

## 🔄 After Disabling All

1. **Reload Window**: `Ctrl+Shift+P` → "Developer: Reload Window"
2. **Verify**: `Ctrl+Shift+X` → Type `@enabled` → Should see ~10 extensions
3. **Check speed**: Cursor should feel noticeably faster

---

## 💡 Tips

- Use `@enabled` in Extensions search to see only enabled ones
- Use `@disabled` to see disabled ones
- **Workspace disable** = only affects this project
- **Disable** (global) = affects ALL projects
- Can re-enable anytime via same gear menu

---

## 📊 Expected Results

**Before**: 24 enabled, slow startup, high memory
**After**: 10 enabled, fast startup, low memory

**Performance gain**: ~5-10x faster Cursor startup
