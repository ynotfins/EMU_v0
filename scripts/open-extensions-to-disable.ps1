# PowerShell script to open extension pages for easy disabling
# Run this and VS Code will open each extension page - just click "Disable"

Write-Host "Opening extension pages for disabling..." -ForegroundColor Cyan
Write-Host "Just click 'Disable' for each one!" -ForegroundColor Yellow
Write-Host ""

$extensionsToDisable = @(
    # Android/Mobile
    "adelphes.android-dev-ext",
    "surendrajat.apklab",
    "loyieking.smalise",
    "expo.vscode-expo-tools",
    
    # Java/JVM
    "redhat.java",
    "vscjava.vscode-gradle",
    "vscjava.vscode-java-debug",
    "vscjava.vscode-java-dependency",
    "vscjava.vscode-java-pack",
    "vscjava.vscode-java-test",
    "vscjava.vscode-maven",
    "josevseb.google-java-format-for-vs-code",
    "mathiasfrohlich.kotlin",
    
    # Python
    "ms-python.python",
    "ms-pyright.pyright",
    "ms-python.debugpy",
    
    # Containers
    "ms-azuretools.vscode-docker",
    "ms-azuretools.vscode-containers",
    "anysphere.remote-containers",
    
    # Other
    "graphql.vscode-graphql-syntax",
    "redhat.vscode-xml",
    "mechatroner.rainbow-csv",
    "grapecity.gc-excelviewer",
    "sonarsource.sonarlint-vscode",
    "google.geminicodeassist",
    "giga-ai.giga-ai",
    "googlecloudtools.cloudcode",
    "lokalise.i18n-ally",
    "ai-dl.enlighter"
)

$batchSize = 5
$current = 0

foreach ($ext in $extensionsToDisable) {
    if ($current -gt 0 -and $current % $batchSize -eq 0) {
        Write-Host "Press any key to continue with next batch..." -ForegroundColor Green
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    }
    
    Write-Host "Opening: $ext" -ForegroundColor DarkGray
    code --show-versions --extension-id $ext
    Start-Sleep -Milliseconds 500
    $current++
}

Write-Host ""
Write-Host "✅ All extension pages opened!" -ForegroundColor Green
Write-Host "Remember to click 'Disable' for each one." -ForegroundColor Yellow
