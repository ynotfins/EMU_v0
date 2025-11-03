# Fix remaining import issues

Write-Host "Fixing remaining import issues..." -ForegroundColor Cyan

# Fix 1: realtime-database.ts importing from './firebase'
$rtdbFile = "src/lib/utils/realtime-database.ts"
if (Test-Path $rtdbFile) {
    $content = Get-Content $rtdbFile
    $content = $content -replace "from './firebase'", "from '../firebase/firebase'"
    Set-Content -Path $rtdbFile -Value $content
    Write-Host "Fixed realtime-database.ts imports"
}

# Fix 2: Components in features importing from './ui/...'  
$featureFiles = Get-ChildItem -Path "src/components/features" -Filter "*.tsx"
foreach ($file in $featureFiles) {
    $content = Get-Content $file.FullName
    $modified = $false
    
    # Fix UI imports
    if ($content -match './ui/') {
        $content = $content -replace '"./ui/', '"../ui/'
        $content = $content -replace "'./ui/", "'../ui/"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Fixed UI imports in $($file.Name)"
    }
}

# Fix 3: Missing features in component paths
$replacements = @{
    '@/components/map-card' = '@/components/features/map-card'
    '@/components/bottom-nav' = '@/components/layouts/bottom-nav'
    '@/components/chat-contacts' = '@/components/features/chat-contacts'
    '@/components/chat-room' = '@/components/features/chat-room'  
    '@/components/docs-manager' = '@/components/features/docs-manager'
    '@/components/esign-manager' = '@/components/features/esign-manager'
    '@/components/homeowner-form' = '@/components/features/homeowner-form'
    '@/components/incident-chat' = '@/components/features/incident-chat'
    '@/components/role-layout' = '@/components/features/role-layout'
}

# Fix 4: @/lib/firebase should go to firebase subdirectory
$replacements['@/lib/firebase"'] = '@/lib/firebase/firebase"'
$replacements['@/lib/firebase'''] = '@/lib/firebase/firebase'''
$replacements['@/lib/firebase;'] = '@/lib/firebase/firebase;'

# Fix 5: Missing library paths
$replacements['@/lib/pwa-register'] = '@/lib/utils/pwa-register'
$replacements['@/lib/silence'] = '@/lib/utils/silence'
$replacements['@/lib/offline-cache'] = '@/lib/utils/offline-cache'

# Apply all replacements
$allFiles = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx"
foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName
    $originalContent = $content -join "`n"
    
    foreach ($old in $replacements.Keys) {
        $content = $content -replace [regex]::Escape($old), $replacements[$old]
    }
    
    $newContent = $content -join "`n"
    if ($newContent -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated imports in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`nImport fixes completed!" -ForegroundColor Green
