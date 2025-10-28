# Manual Extension Disable Instructions

Since Cursor didn't automatically prompt to disable extensions, you have two options:

## Option 1: Run PowerShell Script (Fastest)

1. Open PowerShell terminal in this project
2. Run: `.\.vscode\disable-extensions.ps1`
3. Reload Cursor

## Option 2: Manually Disable via UI

Press `Ctrl+Shift+X` to open Extensions panel, then for each extension below, click the gear icon → "Disable (Workspace)"

### Extensions to Disable for This Project (26):

**Java Extensions (8):**
- ❌ Java (redhat.java)
- ❌ Extension Pack for Java (vscjava.vscode-java-pack)
- ❌ Debugger for Java (vscjava.vscode-java-debug)
- ❌ Test Runner for Java (vscjava.vscode-java-test)
- ❌ Project Manager for Java (vscjava.vscode-java-dependency)
- ❌ Maven for Java (vscjava.vscode-maven)
- ❌ Gradle for Java (vscjava.vscode-gradle)
- ❌ Google Java Format (josevseb.google-java-format-for-vs-code)

**Python Extensions (2):**
- ❌ Python (ms-python.python)
- ❌ Python Debugger (ms-python.debugpy)

**Android Native (3):**
- ❌ Android Dev Extension (adelphes.android-dev-ext)
- ❌ APKLab (surendrajat.apklab)
- ❌ Smalise (loyieking.smalise)

**Docker (3):**
- ❌ Docker (ms-azuretools.vscode-docker)
- ❌ Azure Containers (ms-azuretools.vscode-containers)
- ❌ Remote Containers (anysphere.remote-containers)

**Google Cloud (3):**
- ❌ Cloud Code (googlecloudtools.cloudcode)
- ❌ Firebase DataConnect (googlecloudtools.firebase-dataconnect-vscode)
- ❌ Gemini Code Assist (google.geminicodeassist)

**Other (7):**
- ❌ Kotlin (mathiasfrohlich.kotlin)
- ❌ GraphQL Syntax (graphql.vscode-graphql-syntax)
- ❌ GitHub Actions (github.vscode-github-actions)
- ❌ SonarLint (sonarsource.sonarlint-vscode)
- ❌ Enlighter (ai-dl.enlighter)
- ❌ i18n Ally (lokalise.i18n-ally)
- ❌ XML (redhat.vscode-xml)

## Why Disable These?

Each extension runs background processes, language servers, and file watchers. For this React Native/Expo project, these 26 extensions are:
1. **Completely unnecessary** - You're not writing Java, Python, or Kotlin
2. **Slowing everything down** - Indexing files, starting servers, watching changes
3. **Causing 5-15 min delays** - Multiple heavy language servers competing for resources

## What to Keep Enabled (9):

✅ Expo Tools
✅ ESLint
✅ Path Intellisense
✅ GitLens
✅ Error Lens
✅ Todo Tree
✅ Code Spell Checker
✅ EditorConfig
✅ YAML Support

After disabling, reload Cursor and enjoy <3 second response times! ⚡

