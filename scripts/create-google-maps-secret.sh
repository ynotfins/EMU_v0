#!/bin/bash
# Bash script to create GOOGLE_MAPS_API_KEY secret in Google Cloud Secret Manager
# Usage: ./scripts/create-google-maps-secret.sh

PROJECT_ID="emu-incidents"
SECRET_NAME="GOOGLE_MAPS_API_KEY"

echo "Creating Google Maps API Key secret in Secret Manager..."

# Prompt for API key
read -sp "Enter your Google Maps API Key: " api_key
echo ""

if [ -z "$api_key" ]; then
    echo "Error: API key cannot be empty"
    exit 1
fi

# Create secret
echo "Creating secret: $SECRET_NAME"
if ! gcloud secrets create "$SECRET_NAME" --project="$PROJECT_ID" 2>/dev/null; then
    echo "Secret already exists, adding new version..."
fi

# Add secret version
echo "Adding secret version..."
echo -n "$api_key" | gcloud secrets versions add "$SECRET_NAME" --project="$PROJECT_ID" --data-file=-

if [ $? -ne 0 ]; then
    echo "Error adding secret version"
    exit 1
fi

# Grant access to Cloud Functions service account
SERVICE_ACCOUNT="841200945180-compute@developer.gserviceaccount.com"
echo "Granting access to service account: $SERVICE_ACCOUNT"

gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
    --project="$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

if [ $? -ne 0 ]; then
    echo "Error granting permissions"
    exit 1
fi

echo ""
echo "✅ Successfully created GOOGLE_MAPS_API_KEY secret!"
echo "You can now deploy the geocoding function with:"
echo "  cd functions && firebase deploy --only functions:autoGeocodeIncident"

