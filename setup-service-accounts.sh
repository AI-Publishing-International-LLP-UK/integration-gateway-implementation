#!/bin/bash

# Error handling
set -euo pipefail
trap 'echo "Error on line $LINENO"; exit 1' ERR

# Project configuration
PROJECT_ID="api-for-warp-drive"
REGION="us-west1"

echo "Setting up service accounts for Integration Gateway..."

# Read service account configuration
config=$(cat service-accounts.json)

# Set up service accounts with owner role
echo $config | jq -c '.serviceAccounts[]' | while read -r account; do
    email=$(echo $account | jq -r '.email')
    role=$(echo $account | jq -r '.role')
    description=$(echo $account | jq -r '.description')
    
    echo "Setting up service account: $email ($description)"
    echo "Granting role: $role"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$email" \
        --role="$role" \
        --condition=None
done

echo "Service account setup complete!"

