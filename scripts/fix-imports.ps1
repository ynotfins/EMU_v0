# Fix imports after moving to src directory structure

$replacements = @{
    '@/components/role-layout' = '@/components/features/role-layout'
    '@/components/stats-cards' = '@/components/features/stats-cards'
    '@/components/supe-controls-card' = '@/components/features/supe-controls-card'
    '@/components/god-mode-card' = '@/components/features/god-mode-card'
    '@/lib/auth-persistence' = '@/lib/firebase/auth-persistence'
    '@/lib/dev' = '@/lib/utils/dev'
    '@/lib/realtime-database' = '@/lib/utils/realtime-database'
}

# Get all TypeScript/TSX files
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $replacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
            $modified = $true
            Write-Host "Fixed import in: $($file.FullName) - $old"
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host "Import fixes completed!"
