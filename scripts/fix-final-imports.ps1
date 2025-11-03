# Fix final import issues for build

Write-Host "Fixing final import issues..." -ForegroundColor Green

$fixes = @{
    # Components that are in features but imported without /features/
    '@/components/chat-room' = '@/components/features/chat-room'
    '@/components/docs-manager' = '@/components/features/docs-manager'
    '@/components/esign-manager' = '@/components/features/esign-manager'
    '@/components/homeowner-form' = '@/components/features/homeowner-form'
    '@/components/incident-chat' = '@/components/features/incident-chat'
    '@/components/role-layout' = '@/components/features/role-layout'
    '@/lib/firebase"' = '@/lib/firebase/firebase"'
    '@/lib/firebase;' = '@/lib/firebase/firebase;'
}

$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $fixes.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $fixes[$old]
            $modified = $true
        }
    }
    
    if ($modified) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed: $($file.Name)"
    }
}

# Fix UTF-8 encoding issues by re-saving files
$problematicFiles = @(
    "src/app/admin/page.tsx",
    "src/components/features/god-mode-card.tsx", 
    "src/components/features/supe-controls-card.tsx"
)

foreach ($filePath in $problematicFiles) {
    if (Test-Path $filePath) {
        try {
            $content = Get-Content $filePath -Raw
            [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))
            Write-Host "Re-encoded: $filePath" -ForegroundColor Yellow
        } catch {
            Write-Host "Error re-encoding: $filePath - $_" -ForegroundColor Red
        }
    }
}

Write-Host "Import fixes completed!" -ForegroundColor Green
