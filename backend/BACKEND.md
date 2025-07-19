# AI Smart Travel Planner

A modern travel planning application with AI-powered recommendations, weather forecasts, and itinerary management.

## Features

- User authentication with JWT and Google OAuth
- Trip planning with detailed itineraries
- Location search and details using Google Maps API
- Weather forecasts using OpenWeather API
- AI-powered travel recommendations using Gemini API
- MongoDB integration for data storage

## Backend API Structure

The backend is organized into several key modules:

### Authentication (/api/auth)
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Google OAuth: `POST /api/auth/google`
- Get user profile: `GET /api/auth/me`

### Trips (/api/trips)
- Get all trips: `GET /api/trips`
- Create trip: `POST /api/trips`
- Get trip details: `GET /api/trips/:id`
- Update trip: `PUT /api/trips/:id`
- Delete trip: `DELETE /api/trips/:id`
- Add itinerary: `POST /api/trips/:id/itinerary`
- Update itinerary day: `PUT /api/trips/:id/itinerary/:dayIndex`
- Get AI suggestions: `GET /api/trips/:id/ai-suggest`

### Locations (/api/locations)
- Search locations: `GET /api/locations/search`
- Get location details: `GET /api/locations/:placeId`
- Add location review: `POST /api/locations/review/:placeId`

### Weather (/api/weather)
- Get current weather: `GET /api/weather/current`
- Get weather forecast: `GET /api/weather/forecast`

### AI Recommendations (/api/ai)
- Get enhanced trip cost estimates: `POST /api/ai/estimate-enhanced-trip-costs`
- Get destination information: `POST /api/ai/destination-info`

### User Profile (/api/users)
- Get user profile: `GET /api/users/profile`
- Update user profile: `PUT /api/users/profile`
- Change password: `PUT /api/users/password`
- Get user stats: `GET /api/users/stats`

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB database
- API keys for Google Maps, OpenWeather, and Gemini

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/ai-travel-planner.git
cd ai-travel-planner
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file based on .env.example
```bash
cp .env.example .env
# Edit .env with your API keys and database URI
```

4. Start the server
```bash
npm run server
```

The server will start on port 5051 by default.

### API Testing

To test API endpoints, use the included test server:
```bash
npm run test:apis
```

## Technology Stack

- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT, Google OAuth
- APIs: Google Maps, OpenWeather, Gemini AI
- Frontend: React, Vite
