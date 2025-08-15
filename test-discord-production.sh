#!/bin/bash

# Test Discord Notifications in Production
echo "🧪 Testing Production Discord Notifications"
echo "==========================================="

# Your backend URL
BACKEND_URL="https://journeyai-backend.onrender.com"

echo ""
echo "1. Testing Environment Variables Check..."
curl -s "$BACKEND_URL/api/debug/env-check" | python3 -m json.tool

echo ""
echo "2. Testing Discord Notifications..."
curl -X POST "$BACKEND_URL/api/debug/discord-test" \
  -H "Content-Type: application/json" | python3 -m json.tool

echo ""
echo "✅ Test Complete!"
echo ""
echo "Check your Discord channel for 3 test notifications:"
echo "1. 🌍 Website Visit"
echo "2. 👋 User Signup" 
echo "3. ✈️ Itinerary Generation"
