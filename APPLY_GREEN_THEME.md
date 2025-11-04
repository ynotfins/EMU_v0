# 🟢 **Apply Green Theme & Fix Profile Settings**

## ✅ **Quick Steps to Apply Green Theme:**

### 1. Open VS Code Settings
Press `Ctrl + Shift + P` and type: `Preferences: Open Settings (JSON)`

### 2. Copy ALL Contents
Copy everything from `GREEN_WORKSPACE_SETTINGS.json` (created in this folder)

### 3. Paste & Save
Paste it into your settings.json (replace existing content or merge carefully)

### 4. Save & Reload
- Press `Ctrl + S` to save
- Press `Ctrl + Shift + P` → "Developer: Reload Window"

---

## 🚫 **Extensions to Manually Disable:**

Since VS Code profiles don't support CLI disabling, you need to manually disable these in your profile:

### In Extensions Panel (`Ctrl + Shift + X`):

#### ❌ **Java/JVM** (8 extensions)
- Java Extension Pack
- Language Support for Java
- Debugger for Java
- Java Test Runner
- Maven for Java
- Java Dependency Viewer
- Gradle for Java
- Google Java Format

#### ❌ **Python** (3 extensions)
- Python
- Pylance/Pyright
- Python Debugger

#### ❌ **Containers** (3 extensions)
- Docker
- Remote - Containers
- Azure Containers

#### ❌ **Android/Mobile** (4 extensions)
- Android Dev
- APK Lab
- Smali
- Expo Tools

#### ❌ **Others** (11 extensions)
- GraphQL
- XML
- Kotlin
- CSV Viewer
- Excel Viewer
- SonarLint
- Gemini Code Assist
- Giga AI
- Cloud Code
- i18n Ally
- Enlighter

---

## 🎯 **Your Profile Should Have:**

### ✅ **KEEP ENABLED** (Essential for Next.js):
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
- Error Lens
- Pretty TypeScript Errors
- TODO Tree
- Path Intellisense
- Turbo Console Log
- Better Comments
- Auto Rename Tag
- ES7+ React snippets
- Firebase extensions
- And all other React/Next.js tools

---

## 🟢 **Green Theme Features:**
- Activity Bar: Dark green with bright green text
- Status Bar: Medium green
- Editor: Dark background with green highlights
- Terminal: Matrix-style green on black
- Buttons: Bright green
- All UI elements: Green-themed

---

## ⚡ **Quick Alternative:**

If you want a pre-made green theme instead:
1. Press `Ctrl + K` then `Ctrl + T`
2. Search for: "Matrix Theme" or "Monokai Green"
3. Select one you like

But the custom green in `GREEN_WORKSPACE_SETTINGS.json` is optimized for long coding sessions!

---

## 🔄 **To Switch Profiles Later:**
- Click profile icon (bottom left)
- Select "Default" or "Next=JS Firebase Typescript Tailwind"
- VS Code switches instantly!
