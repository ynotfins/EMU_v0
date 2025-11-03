# PowerShell Script to Optimize VS Code Extensions for EMU Project
# This script disables extensions not needed for Next.js/TypeScript/React/Firebase development

Write-Host "🔧 Optimizing VS Code Extensions for EMU Project" -ForegroundColor Cyan
Write-Host ""

# Extensions to KEEP ENABLED for this project
$keepEnabled = @(
    "dbaeumer.vscode-eslint",              # ESLint
    "esbenp.prettier-vscode",              # Prettier
    "bradlc.vscode-tailwindcss",          # Tailwind CSS
    "christian-kohler.path-intellisense",  # Path Intellisense
    "eamodio.gitlens",                    # GitLens
    "gruntfuggly.todo-tree",              # TODO Tree
    "usernamehw.errorlens",               # Error Lens
    "yoavbls.pretty-ts-errors",           # Pretty TypeScript Errors
    "streetsidesoftware.code-spell-checker", # Spell Checker
    "editorconfig.editorconfig",          # EditorConfig
    "ms-vscode.powershell",               # PowerShell (for scripts)
    "googlecloudtools.firebase-dataconnect-vscode", # Firebase Data Connect
    "github.vscode-github-actions",       # GitHub Actions
    "redhat.vscode-yaml",                 # YAML (for configs)
    "anysphere.cursorpyright"             # Cursor Python (keep for Cursor functionality)
)

# Extensions to DISABLE (not needed for this project)
$toDisable = @(
    "adelphes.android-dev-ext",           # Android Dev
    "ai-dl.enlighter",                    # Enlighter (not needed)
    "expo.vscode-expo-tools",             # Expo (not using Expo)
    "giga-ai.giga-ai",                    # Giga AI (redundant with Cursor)
    "google.geminicodeassist",            # Gemini Code (redundant)
    "googlecloudtools.cloudcode",         # Cloud Code (not using GCP directly)
    "grapecity.gc-excelviewer",          # Excel Viewer (not needed)
    "graphql.vscode-graphql-syntax",     # GraphQL (not using)
    "josevseb.google-java-format-for-vs-code", # Java formatter
    "lokalise.i18n-ally",                 # i18n (not implementing yet)
    "loyieking.smalise",                  # Smali (Android)
    "mathiasfrohlich.kotlin",             # Kotlin
    "mechatroner.rainbow-csv",            # CSV viewer
    "ms-azuretools.vscode-containers",    # Containers (not using)
    "ms-azuretools.vscode-docker",        # Docker (not using)
    "ms-pyright.pyright",                 # Python type checker
    "ms-python.debugpy",                  # Python debugger
    "ms-python.python",                   # Python
    "redhat.java",                        # Java
    "redhat.vscode-xml",                  # XML
    "sonarsource.sonarlint-vscode",      # SonarLint (redundant with ESLint)
    "surendrajat.apklab",                 # APK Lab (Android)
    "vscjava.vscode-gradle",              # Gradle (Java)
    "vscjava.vscode-java-debug",          # Java Debug
    "vscjava.vscode-java-dependency",     # Java Dependencies
    "vscjava.vscode-java-pack",           # Java Pack
    "vscjava.vscode-java-test",           # Java Test
    "vscjava.vscode-maven",               # Maven (Java)
    "anysphere.remote-containers"         # Remote Containers (not using)
)

# Additional extensions to INSTALL for optimal development
$toInstall = @(
    "formulahendry.auto-rename-tag",      # Auto Rename Tag
    "dsznajder.es7-react-js-snippets",    # React Snippets
    "steoates.autoimport",                # Auto Import
    "mikestead.dotenv",                   # DotENV support
    "firsttris.vscode-jest-runner",       # Jest Runner (for when we add tests)
    "orta.vscode-jest",                   # Jest support
    "vincaslt.highlight-matching-tag",    # Highlight Matching Tag
    "naumovs.color-highlight",            # Color Highlight
    "wayou.vscode-todo-highlight",        # TODO Highlight
    "aaron-bond.better-comments",         # Better Comments
    "sleistner.vscode-fileutils",         # File Utils
    "chakrounanas.turbo-console-log",     # Turbo Console Log
    "wix.vscode-import-cost",             # Import Cost
    "styled-components.vscode-styled-components" # For styled components (if used)
)

Write-Host "📋 Current Extensions Status:" -ForegroundColor Yellow
Write-Host "✅ Extensions to keep: $($keepEnabled.Count)" -ForegroundColor Green
Write-Host "❌ Extensions to disable: $($toDisable.Count)" -ForegroundColor Red
Write-Host "➕ Extensions to install: $($toInstall.Count)" -ForegroundColor Cyan
Write-Host ""

# Function to disable an extension
function Disable-Extension {
    param($extensionId)
    
    try {
        $result = & code --disable-extension $extensionId 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Disabled: $extensionId" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ⚠️  Failed to disable: $extensionId" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "  ❌ Error disabling: $extensionId - $_" -ForegroundColor Red
        return $false
    }
}

# Function to install an extension
function Install-Extension {
    param($extensionId)
    
    try {
        $result = & code --install-extension $extensionId 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Installed: $extensionId" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ⚠️  Failed to install: $extensionId" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "  ❌ Error installing: $extensionId - $_" -ForegroundColor Red
        return $false
    }
}

# Get user confirmation
Write-Host "This will optimize your VS Code extensions for the EMU project." -ForegroundColor Cyan
Write-Host "Do you want to proceed? (Y/N): " -NoNewline -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "❌ Operation cancelled." -ForegroundColor Red
    exit 0
}

# Disable unnecessary extensions
Write-Host ""
Write-Host "🚫 Disabling unnecessary extensions..." -ForegroundColor Yellow
$disabledCount = 0
foreach ($ext in $toDisable) {
    if (Disable-Extension $ext) {
        $disabledCount++
    }
}

# Install recommended extensions
Write-Host ""
Write-Host "📦 Installing recommended extensions..." -ForegroundColor Yellow
$installedCount = 0
foreach ($ext in $toInstall) {
    if (Install-Extension $ext) {
        $installedCount++
    }
}

# Summary
Write-Host ""
Write-Host "✨ Extension Optimization Complete!" -ForegroundColor Green
Write-Host "  - Disabled: $disabledCount extensions" -ForegroundColor Cyan
Write-Host "  - Installed: $installedCount extensions" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 Please restart VS Code for all changes to take effect." -ForegroundColor Yellow
Write-Host ""

# Create workspace recommendations file
Write-Host "📝 Creating workspace recommendations file..." -ForegroundColor Cyan
$recommendations = @{
    recommendations = $keepEnabled + $toInstall
}

$recommendationsJson = $recommendations | ConvertTo-Json -Depth 10
$vscodeDir = ".vscode"
if (!(Test-Path $vscodeDir)) {
    New-Item -ItemType Directory -Path $vscodeDir | Out-Null
}
$recommendationsJson | Out-File -FilePath "$vscodeDir\extensions.json" -Encoding utf8
Write-Host "✅ Created .vscode/extensions.json" -ForegroundColor Green

Write-Host ""
Write-Host "💡 Pro Tips:" -ForegroundColor Cyan
Write-Host "  1. Use Ctrl+Shift+P -> 'Developer: Reload Window' to apply changes" -ForegroundColor White
Write-Host "  2. Check 'Extensions' view to verify disabled extensions" -ForegroundColor White
Write-Host "  3. Run 'pnpm check' to verify your development environment" -ForegroundColor White
