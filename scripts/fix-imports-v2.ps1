# Fix final import issues for build - Version 2

Write-Host "Fixing final import issues..." -ForegroundColor Green

$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx"

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $modified = $false
    
    # Fix component imports
    $replacements = @{
        '@/components/chat-room' = '@/components/features/chat-room'
        '@/components/docs-manager' = '@/components/features/docs-manager'
        '@/components/esign-manager' = '@/components/features/esign-manager'
        '@/components/homeowner-form' = '@/components/features/homeowner-form'
        '@/components/incident-chat' = '@/components/features/incident-chat'
        '@/components/role-layout' = '@/components/features/role-layout'
        '@/lib/firebase"' = '@/lib/firebase/firebase"'
        '@/lib/firebase;' = '@/lib/firebase/firebase;'
    }
    
    foreach ($old in $replacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
            $modified = $true
        }
    }
    
    if ($modified) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed imports in: $($file.Name)"
    }
}

Write-Host "Import fixes completed!" -ForegroundColor Green
