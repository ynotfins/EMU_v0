# Deploy Firebase Security Rules
Write-Host "Deploying Firebase Security Rules..." -ForegroundColor Cyan

try {
    # Deploy Firestore rules
    Write-Host "`nDeploying Firestore rules..." -ForegroundColor Yellow
    firebase deploy --only firestore:rules
    
    # Deploy Realtime Database rules
    Write-Host "`nDeploying Realtime Database rules..." -ForegroundColor Yellow
    firebase deploy --only database
    
    Write-Host "`nAll Firebase rules deployed successfully!" -ForegroundColor Green
    
    Write-Host "`nRules Summary:" -ForegroundColor Cyan
    Write-Host "- Firestore: Supes can now read all user locations" -ForegroundColor White
    Write-Host "- Firestore: Added rules for all collections (favorites, bookmarks, notes, etc)" -ForegroundColor White
    Write-Host "- RTDB: Added live-locations path for real-time tracking" -ForegroundColor White
    Write-Host "- RTDB: Enhanced chat security with proper validation" -ForegroundColor White
} catch {
    Write-Host "Error deploying rules: $_" -ForegroundColor Red
    exit 1
}
