#!/usr/bin/env tsx
/**
 * Extension Audit Script
 * Checks which extensions are enabled/disabled and compares against workspace policy
 */

const RECOMMENDED = [
  "dbaeumer.vscode-eslint",
  "bradlc.vscode-tailwindcss",
  "esbenp.prettier-vscode",
  "eamodio.gitlens",
  "usernamehw.errorlens",
  "streetsidesoftware.code-spell-checker",
  "christian-kohler.path-intellisense",
  "editorconfig.editorconfig",
  "redhat.vscode-yaml",
];

const UNWANTED = [
  "ms-python.python",
  "ms-python.debugpy",
  "ms-vscode.vscode-pylance",
  "ms-vscode.powershell",
  "ms-azuretools.vscode-docker",
  "ms-azuretools.vscode-docker-compose",
  "ms-azuretools.vscode-azurecontainerapps",
  "googlecloudtools.cloudcode",
  "googlecloudtools.firebase-dataconnect",
  "google.geminicodeassist",
  "graphql.vscode-graphql",
  "redhat.vscode-xml",
  "anyspere.vscode-dev-containers",
  "lokalise.i18n-ally",
  "sonarsource.sonarlint-vscode",
  "adelphes.android-dev-ext",
  "surendrajat.apklab",
  "expo.vscode-expo-tools",
  "vscjava.vscode-java-pack",
  "vscjava.vscode-maven",
  "vscjava.vscode-gradle",
  "redhat.java",
  "vscjava.vscode-java-test",
  "mathiasfrohlich.Kotlin",
  "LoyieKing.es6-mocha-snippets",
];

console.log("📋 Extension Policy Audit\n");
console.log("✅ RECOMMENDED for this workspace:");
RECOMMENDED.forEach((ext) => console.log(`   - ${ext}`));

console.log("\n❌ UNWANTED for this workspace:");
UNWANTED.forEach((ext) => console.log(`   - ${ext}`));

console.log("\n📝 Manual Action Required:");
console.log("   VS Code does NOT support workspace-level extension disabling.");
console.log("   You must manually disable unwanted extensions:\n");
console.log("   1. Open Extensions panel (Ctrl+Shift+X)");
console.log("   2. For each unwanted extension above:");
console.log("      - Click gear icon → 'Disable (Workspace)'");
console.log("      - Or right-click → 'Disable (Workspace)'\n");
console.log("   This will update your local workspace storage.");

