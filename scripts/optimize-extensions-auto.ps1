# PowerShell Script to Optimize VS Code Extensions for EMU Project (YOLO Mode)
# Auto-accepts all changes

Write-Host "`n🔧 Optimizing VS Code Extensions for EMU Project (YOLO Mode)" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Extensions to DISABLE (not needed for this project)
$toDisable = @(
    "adelphes.android-dev-ext",
    "ai-dl.enlighter",
    "expo.vscode-expo-tools",
    "giga-ai.giga-ai",
    "google.geminicodeassist",
    "googlecloudtools.cloudcode",
    "grapecity.gc-excelviewer",
    "graphql.vscode-graphql-syntax",
    "josevseb.google-java-format-for-vs-code",
    "lokalise.i18n-ally",
    "loyieking.smalise",
    "mathiasfrohlich.kotlin",
    "mechatroner.rainbow-csv",
    "ms-azuretools.vscode-containers",
    "ms-azuretools.vscode-docker",
    "ms-pyright.pyright",
    "ms-python.debugpy",
    "ms-python.python",
    "redhat.java",
    "redhat.vscode-xml",
    "sonarsource.sonarlint-vscode",
    "surendrajat.apklab",
    "vscjava.vscode-gradle",
    "vscjava.vscode-java-debug",
    "vscjava.vscode-java-dependency",
    "vscjava.vscode-java-pack",
    "vscjava.vscode-java-test",
    "vscjava.vscode-maven",
    "anysphere.remote-containers"
)

# Extensions to INSTALL
$toInstall = @(
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets",
    "steoates.autoimport",
    "mikestead.dotenv",
    "firsttris.vscode-jest-runner",
    "orta.vscode-jest",
    "vincaslt.highlight-matching-tag",
    "naumovs.color-highlight",
    "wayou.vscode-todo-highlight",
    "aaron-bond.better-comments",
    "sleistner.vscode-fileutils",
    "chakrounanas.turbo-console-log",
    "wix.vscode-import-cost",
    "styled-components.vscode-styled-components"
)

# Extensions to KEEP
$keepEnabled = @(
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "christian-kohler.path-intellisense",
    "eamodio.gitlens",
    "gruntfuggly.todo-tree",
    "usernamehw.errorlens",
    "yoavbls.pretty-ts-errors",
    "streetsidesoftware.code-spell-checker",
    "editorconfig.editorconfig",
    "ms-vscode.powershell",
    "googlecloudtools.firebase-dataconnect-vscode",
    "github.vscode-github-actions",
    "redhat.vscode-yaml",
    "anysphere.cursorpyright"
)

Write-Host "🚫 Disabling unnecessary extensions..." -ForegroundColor Yellow
$disabledCount = 0
foreach ($ext in $toDisable) {
    Write-Host "  Disabling: $ext" -ForegroundColor DarkGray
    & code --disable-extension $ext 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $disabledCount++
    }
}
Write-Host "  ✅ Disabled $disabledCount extensions`n" -ForegroundColor Green

Write-Host "📦 Installing recommended extensions..." -ForegroundColor Yellow
$installedCount = 0
foreach ($ext in $toInstall) {
    Write-Host "  Installing: $ext" -ForegroundColor DarkGray
    & code --install-extension $ext --force 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $installedCount++
    }
}
Write-Host "  ✅ Installed/Updated $installedCount extensions`n" -ForegroundColor Green

# Create .vscode/extensions.json
Write-Host "📝 Creating workspace recommendations..." -ForegroundColor Yellow
$vscodeDir = ".vscode"
if (!(Test-Path $vscodeDir)) {
    New-Item -ItemType Directory -Path $vscodeDir | Out-Null
}

$recommendations = @{
    recommendations = $keepEnabled + $toInstall
    unwantedRecommendations = $toDisable
}

$recommendationsJson = $recommendations | ConvertTo-Json -Depth 10
$recommendationsJson | Out-File -FilePath "$vscodeDir\extensions.json" -Encoding utf8 -Force
Write-Host "  ✅ Created .vscode/extensions.json`n" -ForegroundColor Green

# Summary
Write-Host "✨ Extension Optimization Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Disabled: $disabledCount extensions" -ForegroundColor Cyan
Write-Host "  Installed: $installedCount extensions" -ForegroundColor Cyan
Write-Host "  Workspace recommendations created`n" -ForegroundColor Cyan

Write-Host "🔄 IMPORTANT: Restart VS Code to apply all changes" -ForegroundColor Yellow
Write-Host "  - Use Ctrl+Shift+P -> 'Developer: Reload Window'" -ForegroundColor White
Write-Host "  - Or close and reopen VS Code`n" -ForegroundColor White

# List currently enabled extensions for this project
Write-Host "✅ Extensions optimized for EMU project:" -ForegroundColor Green
foreach ($ext in $keepEnabled) {
    Write-Host "  - $ext" -ForegroundColor DarkGreen
}
foreach ($ext in $toInstall) {
    Write-Host "  - $ext" -ForegroundColor DarkCyan
}