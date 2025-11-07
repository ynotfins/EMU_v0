# PowerShell script to create GOOGLE_MAPS_API_KEY secret in Google Cloud Secret Manager
# Usage: .\scripts\create-google-maps-secret.ps1

$PROJECT_ID = "emu-incidents"
$SECRET_NAME = "GOOGLE_MAPS_API_KEY"

Write-Host "Creating Google Maps API Key secret in Secret Manager..." -ForegroundColor Cyan

# Prompt for API key
$apiKey = Read-Host "Enter your Google Maps API Key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "Error: API key cannot be empty" -ForegroundColor Red
    exit 1
}

# Create secret
Write-Host "Creating secret: $SECRET_NAME" -ForegroundColor Yellow
$createSecret = gcloud secrets create $SECRET_NAME --project=$PROJECT_ID 2>&1

if ($LASTEXITCODE -ne 0) {
    if ($createSecret -match "already exists") {
        Write-Host "Secret already exists, adding new version..." -ForegroundColor Yellow
    } else {
        Write-Host "Error creating secret: $createSecret" -ForegroundColor Red
        exit 1
    }
}

# Add secret version
Write-Host "Adding secret version..." -ForegroundColor Yellow
echo $apiKey | gcloud secrets versions add $SECRET_NAME --project=$PROJECT_ID --data-file=-

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error adding secret version" -ForegroundColor Red
    exit 1
}

# Grant access to Cloud Functions service account
$SERVICE_ACCOUNT = "841200945180-compute@developer.gserviceaccount.com"
Write-Host "Granting access to service account: $SERVICE_ACCOUNT" -ForegroundColor Yellow

gcloud secrets add-iam-policy-binding $SECRET_NAME `
    --project=$PROJECT_ID `
    --member="serviceAccount:$SERVICE_ACCOUNT" `
    --role="roles/secretmanager.secretAccessor" `
    --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error granting permissions" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Successfully created GOOGLE_MAPS_API_KEY secret!" -ForegroundColor Green
Write-Host "You can now deploy the geocoding function with:" -ForegroundColor Cyan
Write-Host "  cd functions && firebase deploy --only functions:autoGeocodeIncident" -ForegroundColor White

