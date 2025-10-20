#!/bin/bash

# Test script for data delivery REST service
# Usage: ./test-data-delivery.sh [filename]
# Example: ./test-data-delivery.sh my-data.csv

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Configuration from environment variables
SERVICE_URL="${BASE_URL:-http://localhost:3000}"
OIDC_ISSUER="${OIDC_ISSUER:-https://dataspace4health.local/iam/realms/ds4h}"
CLIENT_ID="${OIDC_CLIENT_ID:-federated-catalogue}"
CLIENT_SECRET="${OIDC_CLIENT_SECRET:-cf|J{G3z7a,@su5j(EJzq^G\$a6)4D9}"

# Allow filename to be passed as command line argument
FILENAME="${1:-verifiable_presentation.json}"  # Use first argument or default to verifiable_presentation.json

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [filename]"
    echo ""
    echo "Test script for the data delivery REST service"
    echo ""
    echo "Arguments:"
    echo "  filename    Name of the file to test (default: sample-data.csv)"
    echo ""
    echo "Environment variables (from .env file):"
    echo "  BASE_URL           Service URL (default: http://localhost:3000)"
    echo "  OIDC_ISSUER        OIDC issuer URL"
    echo "  OIDC_CLIENT_ID     OIDC client ID"
    echo "  OIDC_CLIENT_SECRET OIDC client secret"
    echo ""
    echo "Examples:"
    echo "  $0                    # Test with default file"
    echo "  $0 my-data.csv        # Test with specific file"
    exit 0
fi

# Validate required environment variables
if [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Error: OIDC_CLIENT_SECRET is not set in environment variables"
    exit 1
fi

echo "Testing Data Delivery REST Service..."
echo "Service URL: $SERVICE_URL"
echo "OIDC Issuer: $OIDC_ISSUER"
echo "Client ID: $CLIENT_ID"
echo "Target file: $FILENAME"
echo ""

# Fetch the token dynamically
echo "Fetching authentication token..."
TOKEN_RESPONSE=$(curl -k --silent --location "${OIDC_ISSUER}/protocol/openid-connect/token" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'grant_type=password' \
  --data-urlencode 'username=admin' \
  --data-urlencode 'password=xfsc4Ntt!' \
  --data-urlencode "client_id=$CLIENT_ID" \
  --data-urlencode 'scope=openid' \
  --data-urlencode "client_secret=$CLIENT_SECRET" \
  --data-urlencode 'redirect_uri=https://dataspace4health.local/*')

# Extract the token from the response
TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Failed to fetch the token. Response: $TOKEN_RESPONSE"
  exit 1
fi

echo "✅ Token fetched successfully"
echo ""

# Test the main endpoint - GET /files/{filename}
echo "Testing GET /files/$FILENAME endpoint..."
echo "Making request to: $SERVICE_URL/files/$FILENAME"

RESPONSE=$(curl -w "\n%{http_code}" --silent --location "$SERVICE_URL/files/$FILENAME" \
  --header "Authorization: Bearer $TOKEN")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract response body (all but last line)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Status Code: $HTTP_CODE"

case $HTTP_CODE in
  200)
    echo "✅ Success! File retrieved successfully"
    echo "Response body length: $(echo "$RESPONSE_BODY" | wc -c) characters"
    # Optionally save the response to a file
    # echo "$RESPONSE_BODY" > "downloaded_$FILENAME"
    # echo "File saved as: downloaded_$FILENAME"
    ;;
  401)
    echo "❌ Authentication failed (401 Unauthorized)"
    echo "Response: $RESPONSE_BODY"
    ;;
  404)
    echo "❌ File not found (404 Not Found)"
    echo "Response: $RESPONSE_BODY"
    echo "Note: Make sure the file '$FILENAME' exists in the data directory"
    ;;
  500)
    echo "❌ Server error (500 Internal Server Error)"
    echo "Response: $RESPONSE_BODY"
    ;;
  *)
    echo "❌ Unexpected response code: $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
    ;;
esac

echo ""

# Test the root endpoint to verify service is running
echo "Testing service health check..."
HEALTH_RESPONSE=$(curl -w "\n%{http_code}" --silent --location "$SERVICE_URL/")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HEALTH_CODE" == "200" ]; then
  echo "✅ Service is running: $HEALTH_BODY"
else
  echo "❌ Service health check failed (HTTP $HEALTH_CODE): $HEALTH_BODY"
fi

echo ""
echo "Test completed!"
