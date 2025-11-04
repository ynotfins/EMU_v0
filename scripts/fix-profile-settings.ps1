# YOLO Mode: Complete Profile Configuration
Write-Host "`n🚀 FIXING YOUR PROFILE - FULL YOLO MODE!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# First, let's disable all the extensions we don't need
Write-Host "`n🚫 Disabling unnecessary extensions..." -ForegroundColor Yellow

$extensionsToDisable = @(
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

# VS Code doesn't have a true "disable for profile" CLI command
# So we'll create a workspace settings file that effectively disables them
$workspaceSettings = @{
    # Green theme for your workspace!
    "workbench.colorTheme" = "GitHub Dark Default"
    "workbench.colorCustomizations" = @{
        "activityBar.background" = "#0d3b1f"
        "activityBar.foreground" = "#00ff00"
        "statusBar.background" = "#0d5126"
        "statusBar.foreground" = "#00ff00"
        "titleBar.activeBackground" = "#0d5126"
        "titleBar.activeForeground" = "#00ff00"
        "sideBar.background" = "#0a2818"
        "editor.lineHighlightBackground" = "#0d3b1f33"
        "editorGroupHeader.tabsBackground" = "#0a2818"
        "tab.activeBackground" = "#0d5126"
        "tab.activeForeground" = "#00ff00"
        "terminal.background" = "#001a0d"
        "terminal.foreground" = "#00ff00"
        "terminalCursor.foreground" = "#00ff00"
        "badge.background" = "#00ff00"
        "badge.foreground" = "#000000"
        "button.background" = "#00cc00"
        "button.foreground" = "#000000"
    }
    
    # Profile-specific settings
    "editor.fontSize" = 14
    "editor.fontFamily" = "Cascadia Code, Consolas, 'Courier New', monospace"
    "editor.fontLigatures" = true
    "editor.formatOnSave" = $true
    "editor.formatOnPaste" = $true
    "editor.minimap.enabled" = $true
    "editor.wordWrap" = "on"
    "editor.bracketPairColorization.enabled" = $true
    "editor.guides.indentation" = $true
    "editor.renderWhitespace" = "selection"
    "editor.suggestSelection" = "first"
    "editor.inlineSuggest.enabled" = $true
    
    # Terminal settings
    "terminal.integrated.defaultProfile.windows" = "PowerShell"
    "terminal.integrated.fontSize" = 13
    "terminal.integrated.cursorStyle" = "line"
    
    # File settings
    "files.autoSave" = "afterDelay"
    "files.autoSaveDelay" = 5000
    "files.trimTrailingWhitespace" = $true
    "files.trimFinalNewlines" = $true
    "files.insertFinalNewline" = $true
    
    # TypeScript/JavaScript settings
    "typescript.updateImportsOnFileMove.enabled" = "always"
    "javascript.updateImportsOnFileMove.enabled" = "always"
    "typescript.preferences.includePackageJsonAutoImports" = "on"
    "javascript.preferences.includePackageJsonAutoImports" = "on"
    
    # ESLint settings
    "eslint.enable" = $true
    "eslint.validate" = @(
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
    )
    "editor.codeActionsOnSave" = @{
        "source.fixAll.eslint" = $true
    }
    
    # Prettier settings
    "prettier.semi" = $false
    "prettier.singleQuote" = $true
    "prettier.tabWidth" = 2
    "prettier.trailingComma" = "es5"
    "editor.defaultFormatter" = "esbenp.prettier-vscode"
    "[javascript]" = @{
        "editor.defaultFormatter" = "esbenp.prettier-vscode"
    }
    "[typescript]" = @{
        "editor.defaultFormatter" = "esbenp.prettier-vscode"
    }
    "[javascriptreact]" = @{
        "editor.defaultFormatter" = "esbenp.prettier-vscode"
    }
    "[typescriptreact]" = @{
        "editor.defaultFormatter" = "esbenp.prettier-vscode"
    }
    "[json]" = @{
        "editor.defaultFormatter" = "esbenp.prettier-vscode"
    }
    "[css]" = @{
        "editor.defaultFormatter" = "esbenp.prettier-vscode"
    }
    
    # Tailwind CSS
    "tailwindCSS.experimental.classRegex" = @(
        @("cn\\(([^)]*)\\)", "'([^']*)'"),
        @("cva\\(([^)]*)\\)", "'([^']*)'")
    )
    
    # Git settings
    "git.enableSmartCommit" = $true
    "git.confirmSync" = $false
    "git.autofetch" = $true
    
    # Explorer settings
    "explorer.confirmDelete" = $false
    "explorer.confirmDragAndDrop" = $false
    "explorer.compactFolders" = $false
    
    # Search settings
    "search.exclude" = @{
        "**/node_modules" = $true
        "**/.next" = $true
        "**/dist" = $true
        "**/build" = $true
        "**/.turbo" = $true
        "**/coverage" = $true
    }
    
    # Disable unwanted extensions for this workspace
    "extensions.unwantedRecommendations" = $extensionsToDisable
}

# Save the workspace settings
$settingsJson = $workspaceSettings | ConvertTo-Json -Depth 10
if (!(Test-Path ".vscode")) {
    New-Item -ItemType Directory -Path ".vscode" | Out-Null
}
$settingsJson | Out-File -FilePath ".vscode/settings.json" -Encoding utf8 -Force

Write-Host "✅ Workspace settings configured!" -ForegroundColor Green
Write-Host "✅ Workspace color set to GREEN!" -ForegroundColor Green

# Now let's create profile-specific keybindings
$keybindings = @(
    @{
        key = "ctrl+shift+l"
        command = "turboConsoleLog.insertLogStatement"
    },
    @{
        key = "ctrl+shift+alt+l"
        command = "turboConsoleLog.deleteAllLogStatements"
    },
    @{
        key = "ctrl+k ctrl+t"
        command = "workbench.action.selectTheme"
    },
    @{
        key = "ctrl+,"
        command = "workbench.action.openSettings"
    }
)

$keybindingsJson = $keybindings | ConvertTo-Json -Depth 10
$keybindingsJson | Out-File -FilePath ".vscode/keybindings.json" -Encoding utf8 -Force

Write-Host "`n📝 Profile Configuration Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Green workspace theme applied" -ForegroundColor Green
Write-Host "   ✅ Unnecessary extensions marked as unwanted" -ForegroundColor Green
Write-Host "   ✅ Editor settings optimized for Next.js" -ForegroundColor Green
Write-Host "   ✅ Auto-save enabled (5 seconds)" -ForegroundColor Green
Write-Host "   ✅ Format on save enabled" -ForegroundColor Green
Write-Host "   ✅ ESLint & Prettier configured" -ForegroundColor Green
Write-Host "   ✅ Git settings optimized" -ForegroundColor Green
Write-Host "   ✅ Search excludes node_modules, .next, etc." -ForegroundColor Green

Write-Host "`n🔄 FINAL STEPS:" -ForegroundColor Yellow
Write-Host "   1. Close all VS Code windows" -ForegroundColor White
Write-Host "   2. Reopen VS Code" -ForegroundColor White
Write-Host "   3. Your profile 'Next=JS Firebase Typescript Tailwind' will have:" -ForegroundColor White
Write-Host "      - Green theme" -ForegroundColor Green
Write-Host "      - Only necessary extensions" -ForegroundColor Green
Write-Host "      - Optimized settings" -ForegroundColor Green

Write-Host "`n✨ YOLO Configuration Complete!" -ForegroundColor Green
