#!/usr/bin/env pwsh
# Configure Firebase Functions environment variables
# Usage: .\scripts\configure-functions.ps1

Write-Host "🔧 Configuring Firebase Functions environment..." -ForegroundColor Cyan

# Check if firebase CLI is installed
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI not found! Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Set the Google Maps API key
Write-Host "`n📍 Setting Google Maps API key for geocoding..." -ForegroundColor Yellow
Write-Host "Enter your Google Maps API key (same as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY):" -ForegroundColor Cyan
$apiKey = Read-Host

if ($apiKey) {
    # Set the config
    firebase functions:config:set google.maps_api_key=$apiKey
    
    Write-Host "✅ Google Maps API key configured!" -ForegroundColor Green
    Write-Host "`n📝 To deploy functions with new config:" -ForegroundColor Yellow
    Write-Host "   cd functions" -ForegroundColor Gray
    Write-Host "   npm run deploy" -ForegroundColor Gray
} else {
    Write-Host "❌ No API key provided. Geocoding will not work." -ForegroundColor Red
}

Write-Host "`n✅ Configuration complete!" -ForegroundColor Green
