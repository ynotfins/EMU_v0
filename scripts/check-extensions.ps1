# Check which extensions are enabled/disabled
Write-Host "🔍 Checking extension status..." -ForegroundColor Cyan

$disabled = @(
  "ms-python.python",
  "ms-python.debugpy",
  "ms-vscode.vscode-pylance",
  "ms-vscode.powershell",
  "ms-azuretools.vscode-docker",
  "googlecloudtools.cloudcode",
  "graphql.vscode-graphql",
  "redhat.vscode-xml",
  "lokalise.i18n-ally",
  "sonarsource.sonarlint-vscode",
  "adelphes.android-dev-ext",
  "expo.vscode-expo-tools",
  "vscjava.vscode-java-pack",
  "mathiasfrohlich.Kotlin"
)

Write-Host "`n✅ Should be DISABLED:" -ForegroundColor Yellow
foreach ($ext in $disabled) {
  Write-Host "   - $ext"
}

Write-Host "`n📝 Run in Cursor Extensions panel:" -ForegroundColor Green
Write-Host "   Type: @disabled" -ForegroundColor White
Write-Host "   Should see ~26 extensions listed" -ForegroundColor White

