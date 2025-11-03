# Simplified Extension Optimizer for EMU Project

Write-Host "Optimizing VS Code Extensions..." -ForegroundColor Cyan

# Disable these
$disable = @(
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

# Install these
$install = @(
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
    "wix.vscode-import-cost"
)

Write-Host "Disabling extensions..." -ForegroundColor Yellow
foreach ($ext in $disable) {
    code --disable-extension $ext 2>&1 | Out-Null
}

Write-Host "Installing extensions..." -ForegroundColor Yellow  
foreach ($ext in $install) {
    code --install-extension $ext --force 2>&1 | Out-Null
}

Write-Host "Done! Please restart VS Code." -ForegroundColor Green
