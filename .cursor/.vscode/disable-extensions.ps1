# Disable Irrelevant Extensions for EMU Incidents (React Native/Expo)
Write-Host "Disabling irrelevant extensions for this workspace..." -ForegroundColor Cyan

$extensionsToDisable = @(
    "redhat.java",
    "vscjava.vscode-java-pack",
    "vscjava.vscode-java-debug",
    "vscjava.vscode-java-test",
    "vscjava.vscode-java-dependency",
    "vscjava.vscode-maven",
    "vscjava.vscode-gradle",
    "josevseb.google-java-format-for-vs-code",
    "ms-python.python",
    "ms-python.debugpy",
    "mathiasfrohlich.kotlin",
    "ms-azuretools.vscode-docker",
    "ms-azuretools.vscode-containers",
    "anysphere.remote-containers",
    "googlecloudtools.cloudcode",
    "googlecloudtools.firebase-dataconnect-vscode",
    "google.geminicodeassist",
    "adelphes.android-dev-ext",
    "surendrajat.apklab",
    "loyieking.smalise",
    "graphql.vscode-graphql-syntax",
    "github.vscode-github-actions",
    "sonarsource.sonarlint-vscode",
    "ai-dl.enlighter",
    "lokalise.i18n-ally",
    "redhat.vscode-xml"
)

foreach ($ext in $extensionsToDisable) {
    Write-Host "  Disabling: $ext" -ForegroundColor Yellow
    cursor --disable-extension $ext --workspace
}

Write-Host "`n✅ Done! Extensions disabled for this workspace." -ForegroundColor Green
Write-Host "Please reload Cursor for changes to take effect." -ForegroundColor Cyan

