# Deploy Firebase Cloud Functions
# Handles geocoding and CRM contact creation

Write-Host "[1/5] Building Cloud Functions..." -ForegroundColor Cyan
Set-Location functions
pnpm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "[OK] Build complete" -ForegroundColor Green
Set-Location ..

Write-Host "[2/5] Checking Firebase login..." -ForegroundColor Cyan
firebase login:list

Write-Host "[3/5] Setting Google Maps API key..." -ForegroundColor Yellow
Write-Host "Run this command manually (one time only):" -ForegroundColor Yellow
Write-Host "  firebase functions:config:set google.maps_api_key='YOUR_KEY_HERE'" -ForegroundColor White

Write-Host "[4/5] Deploying functions..." -ForegroundColor Cyan
firebase deploy --only functions

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Functions deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Active Functions:" -ForegroundColor Cyan
    Write-Host "  - autoGeocodeIncident (onCreate trigger)" -ForegroundColor White
    Write-Host "  - scheduleGeocodeMissing (scheduled every 15 min)" -ForegroundColor White
    Write-Host ""
    Write-Host "Next:" -ForegroundColor Yellow
    Write-Host "  1. Test with a new incident" -ForegroundColor White
    Write-Host "  2. Check functions logs: firebase functions:log" -ForegroundColor White
    Write-Host "  3. Verify lat/lng added to incidents" -ForegroundColor White
    Write-Host "  4. Check /contacts collection for CRM data" -ForegroundColor White
} else {
    Write-Host "[X] Deployment failed" -ForegroundColor Red
    exit 1
}
