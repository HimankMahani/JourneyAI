#!/bin/bash

# Discord Notification Testing Script for Production
# This script tests Discord notifications on your deployed backend

echo "🧪 Testing Discord Notifications in Production"
echo "=============================================="

# Replace this with your actual Render backend URL
BACKEND_URL="https://journeyai-backend.onrender.com"

echo ""
echo "1. Testing Backend Health Check..."
curl -s "$BACKEND_URL/" | echo "Response: $(cat)"

echo ""
echo "2. Testing Auth Ping Endpoint..."
curl -s "$BACKEND_URL/api/auth/ping" | echo "Response: $(cat)"

echo ""
echo "3. Testing User Registration (This should trigger Discord notification)..."
curl -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-discord-'$(date +%s)'@example.com",
    "password": "TestPassword123",
    "firstName": "Discord",
    "lastName": "Test",
    "location": "Test City, Test Country"
  }' | echo "Response: $(cat)"

echo ""
echo "4. Testing Visitor Tracking (Visit homepage)..."
curl -s "$BACKEND_URL/" \
  -H "User-Agent: Discord-Test-Bot/1.0" | echo "Response: $(cat)"

echo ""
echo "✅ Testing Complete!"
echo ""
echo "🔍 What to check:"
echo "1. Check your Discord channel for notifications"
echo "2. Check Render logs for any errors"
echo "3. If no notifications appear, verify environment variables on Render"
echo ""
echo "📋 Environment Variables Required on Render:"
echo "- DISCORD_WEBHOOK_URL"
echo "- MONGODB_URI"
echo "- JWT_SECRET"
echo "- All other API keys"
