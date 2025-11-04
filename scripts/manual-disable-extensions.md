# Manual Extension Disable Guide 🛠️

Since VS Code's command-line disable doesn't persist, here's how to properly disable extensions:

## Method 1: Quick Disable (Recommended) ⚡

1. **Open Extensions Panel**: Press `Ctrl + Shift + X`
2. **Filter by Enabled**: Click filter icon → "Enabled"
3. **Search and Disable** each of these:

### Extensions to DISABLE ❌

#### Android/Mobile Development
- [ ] adelphes.android-dev-ext (Android Dev)
- [ ] apklab (APK Lab)
- [ ] smalise (Smali)
- [ ] expo-tools (Expo)

#### Java/JVM
- [ ] redhat.java
- [ ] vscode-gradle
- [ ] vscode-java-debug
- [ ] vscode-java-dependency
- [ ] vscode-java-pack
- [ ] vscode-java-test
- [ ] vscode-maven
- [ ] google-java-format
- [ ] kotlin

#### Python
- [ ] ms-python.python
- [ ] ms-pyright.pyright
- [ ] ms-python.debugpy

#### Containers
- [ ] vscode-docker
- [ ] vscode-containers
- [ ] remote-containers

#### Other Languages/Tools
- [ ] graphql-syntax
- [ ] vscode-xml
- [ ] rainbow-csv
- [ ] gc-excelviewer

#### Redundant Tools
- [ ] sonarlint (we have ESLint)
- [ ] geminicodeassist (we have Cursor)
- [ ] giga-ai
- [ ] cloudcode
- [ ] i18n-ally
- [ ] enlighter

## Method 2: Workspace Disable 📁

For each extension:
1. Click on the extension
2. Click dropdown arrow next to "Disable"
3. Select "Disable (Workspace)"

This only disables for this project!

## Method 3: Profile-Based (Advanced) 👤

1. Press `Ctrl + Shift + P`
2. Type: "Profiles: Create Profile"
3. Name it: "EMU Development"
4. Uncheck extensions you don't want
5. Switch to this profile when working on EMU

## To Verify ✅

After disabling:
1. Click filter icon in Extensions panel
2. Select "Disabled"
3. You should see all the disabled extensions

## Quick Check List 📋

Extensions that should remain ENABLED:
- ✅ ESLint
- ✅ Prettier
- ✅ Tailwind CSS
- ✅ GitLens
- ✅ Error Lens
- ✅ Pretty TS Errors
- ✅ TODO Tree
- ✅ Path Intellisense
- ✅ Better Comments
- ✅ Turbo Console Log
- ✅ Auto Rename Tag
- ✅ ES7 React snippets
- ✅ And other React/Next.js tools

## Time Estimate ⏱️
- Method 1: ~5 minutes
- Method 2: ~5 minutes (persists per workspace)
- Method 3: ~10 minutes (but reusable)
