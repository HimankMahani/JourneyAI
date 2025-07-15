#!/bin/bash

# Set the base URL
BASE_URL="http://localhost:5050"

# Test user credentials
EMAIL="testuser1@gmail.com"
PASSWORD="test@1234"

# Function to print a separator
echo_separator() {
    echo "\n=== $1 ===\n"
}

# Step 1: Register the user
echo_separator "1. Registering user $EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    # "username": "testuser1", # removed username field
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'",
    "firstName": "Test",
    "lastName": "User"
  }')

echo "Registration Response:"
echo "$REGISTER_RESPONSE" | jq .

# Check if registration was successful
if [[ "$REGISTER_RESPONSE" != *"User registered successfully"* ]]; then
    echo "User may already exist, continuing with login..."
fi

# Step 2: Login to get JWT token
echo_separator "2. Logging in user $EMAIL"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq .

# Extract the JWT token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "Failed to get JWT token. Exiting."
    exit 1
fi

echo "\nJWT Token: $TOKEN\n"

# Step 3: Generate an itinerary
echo_separator "3. Generating itinerary"
ITINERARY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/generator/itinerary" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "from": "Mumbai, India",
    "destination": "Goa, India",
    "startDate": "2025-08-01",
    "endDate": "2025-08-05",
    "travelers": "3-4",
    "budget": "mid-range",
    "interests": ["beaches", "food", "sightseeing"]
  }')

echo "Itinerary Generation Response:"
echo "$ITINERARY_RESPONSE" | jq .

echo_separator "Test completed"
