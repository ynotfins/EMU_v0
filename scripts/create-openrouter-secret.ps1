# PowerShell script to create OPENROUTER_API_KEY secret in Google Cloud Secret Manager
# Usage: .\scripts\create-openrouter-secret.ps1 -ApiKey "your-api-key-here"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

$PROJECT_ID = "emu-incidents"
$SECRET_NAME = "OPENROUTER_API_KEY"

Write-Host "Creating secret $SECRET_NAME in project $PROJECT_ID..." -ForegroundColor Cyan

# Create the secret
$ApiKey | gcloud secrets create $SECRET_NAME `
    --project=$PROJECT_ID `
    --data-file=- `
    --replication-policy="automatic"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Secret $SECRET_NAME created successfully!" -ForegroundColor Green
    Write-Host "Granting access to Cloud Functions service account..." -ForegroundColor Cyan
    
    # Get project number
    $PROJECT_NUMBER = (gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
    $SERVICE_ACCOUNT = "${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
    
    # Grant access
    gcloud secrets add-iam-policy-binding $SECRET_NAME `
        --project=$PROJECT_ID `
        --member="serviceAccount:${SERVICE_ACCOUNT}" `
        --role="roles/secretmanager.secretAccessor"
    
    Write-Host "Secret is ready to use!" -ForegroundColor Green
} else {
    Write-Host "Failed to create secret. It may already exist." -ForegroundColor Yellow
    Write-Host "To update existing secret:" -ForegroundColor Yellow
    Write-Host "  `$ApiKey | gcloud secrets versions add $SECRET_NAME --data-file=- --project=$PROJECT_ID" -ForegroundColor Yellow
}

