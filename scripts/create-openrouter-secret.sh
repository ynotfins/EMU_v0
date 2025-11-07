#!/bin/bash
# Script to create OPENROUTER_API_KEY secret in Google Cloud Secret Manager
# Usage: ./scripts/create-openrouter-secret.sh <api-key-value>

if [ -z "$1" ]; then
  echo "Error: API key value required"
  echo "Usage: ./scripts/create-openrouter-secret.sh <api-key-value>"
  exit 1
fi

PROJECT_ID="emu-incidents"
SECRET_NAME="OPENROUTER_API_KEY"

echo "Creating secret $SECRET_NAME in project $PROJECT_ID..."

# Create the secret
echo -n "$1" | gcloud secrets create $SECRET_NAME \
  --project=$PROJECT_ID \
  --data-file=- \
  --replication-policy="automatic"

if [ $? -eq 0 ]; then
  echo "Secret $SECRET_NAME created successfully!"
  echo "Granting access to Cloud Functions service account..."
  
  # Grant access to Cloud Functions service account
  PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
  SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
  
  gcloud secrets add-iam-policy-binding $SECRET_NAME \
    --project=$PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
  
  echo "Secret is ready to use!"
else
  echo "Failed to create secret. It may already exist."
  echo "To update existing secret:"
  echo "  echo -n \"$1\" | gcloud secrets versions add $SECRET_NAME --data-file=- --project=$PROJECT_ID"
fi

