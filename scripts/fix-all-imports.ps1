# Comprehensive import fix script for src restructure

# Function to update imports in a directory
function Update-Imports {
    $files = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx"
    
    # Define all the replacements needed
    $replacements = @{
        # Component imports that need /features/ added
        '@/components/incident-chat' = '@/components/features/incident-chat'
        '@/components/incident-list-item' = '@/components/features/incident-list-item'
        '@/components/id-verification-card' = '@/components/features/id-verification-card'
        '@/components/preferences-card' = '@/components/features/preferences-card'
        '@/components/help-legal-card' = '@/components/features/help-legal-card'
        '@/components/profile-header' = '@/components/features/profile-header'
        '@/components/filter-bar' = '@/components/features/filter-bar'
        '@/components/docs-manager' = '@/components/features/docs-manager'
        '@/components/esign-manager' = '@/components/features/esign-manager'
        '@/components/emergency-payment-card' = '@/components/features/emergency-payment-card'
        '@/components/live-map' = '@/components/features/live-map'
        '@/components/live-team-map' = '@/components/features/live-team-map'
        '@/components/logo' = '@/components/features/logo'
        '@/components/protected-route' = '@/components/features/protected-route'
        '@/components/consent-gate' = '@/components/features/consent-gate'
        '@/components/ErrorBoundary' = '@/components/features/ErrorBoundary'
        '@/components/pwa-registration' = '@/components/features/pwa-registration'
        '@/components/install-pwa-prompt' = '@/components/features/install-pwa-prompt'
        '@/components/role-switcher' = '@/components/features/role-switcher'
        
        # Firebase imports
        '@/lib/firebase' = '@/lib/firebase/firebase'
        
        # Logger import
        '@/lib/logger' = '@/lib/utils/logger'
        
        # Offline cache
        '@/lib/offline-cache' = '@/lib/utils/offline-cache'
        
        # FCM
        '@/lib/fcm' = '@/lib/firebase/fcm'
    }
    
    $fileCount = 0
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Encoding UTF8
        $originalContent = $content
        
        foreach ($old in $replacements.Keys) {
            $pattern = [regex]::Escape($old) + '(?=["\s;])'
            $content = $content -replace $pattern, $replacements[$old]
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            $fileCount++
            Write-Host "Updated: $($file.Name)"
        }
    }
    
    Write-Host "`nTotal files updated: $fileCount"
}

# Run the updates
Update-Imports
