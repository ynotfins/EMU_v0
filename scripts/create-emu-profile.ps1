# YOLO Mode: Create EMU Clean Architecture Profile
Write-Host "`n🚀 CREATING EMU CLEAN ARCHITECTURE PROFILE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Step 1: Create profile settings JSON
$profileSettings = @{
    name = "EMU Clean Architecture"
    icon = "rocket"
    settings = @{
        "workbench.colorTheme" = "PowerShell ISE"
        "editor.fontSize" = 14
        "editor.formatOnSave" = $true
        "editor.codeActionsOnSave" = @{
            "source.fixAll.eslint" = $true
        }
        "typescript.updateImportsOnFileMove.enabled" = "always"
        "tailwindCSS.experimental.classRegex" = @(
            @("cn\\(([^)]*)\\)", "'([^']*)'"),
            @("cva\\(([^)]*)\\)", "'([^']*)'")
        )
    }
    extensions = @(
        # Core Development
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode", 
        "bradlc.vscode-tailwindcss",
        "usernamehw.errorlens",
        "yoavbls.pretty-ts-errors",
        
        # Git & GitHub
        "eamodio.gitlens",
        "github.vscode-github-actions",
        
        # Utilities
        "christian-kohler.path-intellisense",
        "gruntfuggly.todo-tree",
        "streetsidesoftware.code-spell-checker",
        "editorconfig.editorconfig",
        "chakrounanas.turbo-console-log",
        
        # React/Next.js
        "formulahendry.auto-rename-tag",
        "dsznajder.es7-react-js-snippets",
        "steoates.autoimport",
        "vincaslt.highlight-matching-tag",
        
        # Firebase & Config
        "googlecloudtools.firebase-dataconnect-vscode",
        "redhat.vscode-yaml",
        "mikestead.dotenv",
        
        # Testing & Quality
        "firsttris.vscode-jest-runner",
        "orta.vscode-jest",
        "aaron-bond.better-comments",
        "wayou.vscode-todo-highlight",
        "naumovs.color-highlight",
        
        # File Management
        "sleistner.vscode-fileutils",
        "wix.vscode-import-cost",
        
        # Keep for functionality
        "ms-vscode.powershell",
        "anysphere.cursorpyright"
    )
}

# Step 2: Open VS Code command palette to create profile
Write-Host "`n📋 Opening VS Code Profile Creator..." -ForegroundColor Yellow
Start-Process "code" -ArgumentList "--command", "workbench.profiles.actions.createProfile"

# Wait for VS Code to open
Start-Sleep -Seconds 2

# Step 3: Copy profile name to clipboard
$profileSettings.name | Set-Clipboard
Write-Host "`n✅ Profile name copied to clipboard: '$($profileSettings.name)'" -ForegroundColor Green
Write-Host "   Just press Ctrl+V when prompted for profile name!" -ForegroundColor Cyan

# Step 4: Generate extension enable/disable commands
Write-Host "`n📝 Generating extension checklist..." -ForegroundColor Yellow
$enableList = $profileSettings.extensions -join "`n"

@"

🎯 INSTRUCTIONS:
================

1. ✅ VS Code is opening the Profile Creator
2. ✅ Profile name is in your clipboard - just paste it!
3. 📋 In the extension list that appears:

   UNCHECK these categories (we don't need them):
   ❌ All Android/Mobile extensions
   ❌ All Java extensions  
   ❌ All Python extensions
   ❌ Docker & Container extensions
   ❌ GraphQL, XML, CSV viewers
   ❌ Gemini Code Assist, Giga AI
   ❌ SonarLint, Cloud Code

   KEEP CHECKED (✅):
   $enableList

4. Click "Create Profile"
5. VS Code will restart with your clean EMU profile!

"@ | Write-Host -ForegroundColor White

# Step 5: Create a quick reference file
$quickRef = @"
# EMU Clean Architecture Profile Extensions

## ✅ ENABLED (Keep these checked)
$($profileSettings.extensions | ForEach-Object { "- $_" } | Out-String)

## ❌ DISABLED (Uncheck these)
- adelphes.android-dev-ext
- ai-dl.enlighter
- expo.vscode-expo-tools
- giga-ai.giga-ai
- google.geminicodeassist
- googlecloudtools.cloudcode
- grapecity.gc-excelviewer
- graphql.vscode-graphql-syntax
- josevseb.google-java-format-for-vs-code
- lokalise.i18n-ally
- loyieking.smalise
- mathiasfrohlich.kotlin
- mechatroner.rainbow-csv
- ms-azuretools.vscode-containers
- ms-azuretools.vscode-docker
- ms-pyright.pyright
- ms-python.debugpy
- ms-python.python
- redhat.java
- redhat.vscode-xml
- sonarsource.sonarlint-vscode
- surendrajat.apklab
- vscjava.vscode-gradle
- vscjava.vscode-java-debug
- vscjava.vscode-java-dependency
- vscjava.vscode-java-pack
- vscjava.vscode-java-test
- vscjava.vscode-maven
- anysphere.remote-containers
"@

$quickRef | Out-File -FilePath "EMU_PROFILE_EXTENSIONS.md" -Encoding utf8
Write-Host "📄 Created EMU_PROFILE_EXTENSIONS.md for reference" -ForegroundColor Green

# Step 6: Future switching
Write-Host "`n🔄 TO SWITCH PROFILES LATER:" -ForegroundColor Cyan
Write-Host "   1. Click profile icon in bottom left (or Ctrl+Shift+P)" -ForegroundColor White
Write-Host "   2. Select 'EMU Clean Architecture' or your default profile" -ForegroundColor White
Write-Host "   3. VS Code switches instantly!" -ForegroundColor White

Write-Host "`n✨ Profile setup initiated! Follow the checklist above." -ForegroundColor Green
Write-Host "   This gives you a clean, fast environment for EMU development!" -ForegroundColor Cyan
