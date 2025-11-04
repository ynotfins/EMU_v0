# YOLO Mode: Automatically setup Next.js Firebase TypeScript Tailwind profile
Write-Host "`n🚀 YOLO MODE: Setting up your profile extensions automatically!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Extensions we NEED for this profile
$extensionsToInstall = @(
    # Core Development
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens",
    "yoavbls.pretty-ts-errors",
    
    # Git & Version Control
    "eamodio.gitlens",
    "github.vscode-github-actions",
    
    # Code Intelligence
    "christian-kohler.path-intellisense",
    "gruntfuggly.todo-tree",
    "streetsidesoftware.code-spell-checker",
    "chakrounanas.turbo-console-log",
    
    # React/Next.js Development
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets",
    "steoates.autoimport",
    "vincaslt.highlight-matching-tag",
    "aaron-bond.better-comments",
    
    # Firebase & Config
    "googlecloudtools.firebase-dataconnect-vscode",
    "redhat.vscode-yaml",
    "mikestead.dotenv",
    
    # Testing & Quality
    "firsttris.vscode-jest-runner",
    "orta.vscode-jest",
    "wayou.vscode-todo-highlight",
    "naumovs.color-highlight",
    
    # File Management
    "sleistner.vscode-fileutils",
    "wix.vscode-import-cost",
    
    # Required for functionality
    "ms-vscode.powershell",
    "anysphere.cursorpyright",
    "editorconfig.editorconfig"
)

# Install all extensions for the profile
Write-Host "`n📦 Installing extensions for your profile..." -ForegroundColor Yellow
$totalExtensions = $extensionsToInstall.Count
$current = 0

foreach ($ext in $extensionsToInstall) {
    $current++
    $percent = [math]::Round(($current / $totalExtensions) * 100)
    Write-Host "[$percent%] Installing: $ext" -ForegroundColor DarkGray
    
    # Install with force to ensure it's available
    code --install-extension $ext --force 2>&1 | Out-Null
}

Write-Host "`n✅ All extensions installed!" -ForegroundColor Green

# Create a profile configuration file
$profileConfig = @"
# Next.js Firebase TypeScript Tailwind - Extension List

## ✅ Extensions Included in This Profile

### Core Development
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Error Lens
- Pretty TypeScript Errors

### Git & Version Control  
- GitLens
- GitHub Actions

### Code Intelligence
- Path Intellisense
- TODO Tree
- Code Spell Checker
- Turbo Console Log

### React/Next.js Development
- Auto Rename Tag
- ES7+ React/Redux snippets
- Auto Import
- Highlight Matching Tag
- Better Comments

### Firebase & Config
- Firebase Data Connect
- YAML
- DotENV

### Testing & Quality
- Jest Runner
- Jest
- TODO Highlight
- Color Highlight

### File Management
- File Utils
- Import Cost

### System Required
- PowerShell
- Cursor Pyright
- EditorConfig

## ❌ Extensions NOT in This Profile
All Java, Python (except Cursor required), Docker, Android, and other unrelated extensions are excluded.

Total Extensions: $($extensionsToInstall.Count)
"@

$profileConfig | Out-File -FilePath "NEXTJS_FIREBASE_PROFILE.md" -Encoding utf8
Write-Host "📄 Created profile documentation: NEXTJS_FIREBASE_PROFILE.md" -ForegroundColor Green

# Now switch to the profile
Write-Host "`n🔄 Switching to your new profile..." -ForegroundColor Cyan
Write-Host "   Close and reopen VS Code to complete the profile setup" -ForegroundColor Yellow
Write-Host "   Your profile 'Next.js Firebase TypeScript Tailwind' will be active!" -ForegroundColor Green

Write-Host "`n✨ YOLO Setup Complete!" -ForegroundColor Green
Write-Host "   - Extensions installed: $totalExtensions" -ForegroundColor Cyan
Write-Host "   - Profile configured for Next.js development" -ForegroundColor Cyan
Write-Host "   - Restart VS Code to activate" -ForegroundColor Yellow
