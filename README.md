# AI Smart Travel Planner

A full-stack travel planning application that leverages AI to provide personalized travel recommendations, detailed itineraries, weather forecasts, and cultural insights. The app is designed to simplify trip planning and enhance the travel experience.

---

## 🌟 Features

- **AI-Powered Itineraries**: Generate personalized travel plans based on user preferences.
- **Weather Integration**: Real-time weather data and 5-day forecasts for destinations.
- **Cultural Insights**: Local tips, dining etiquette, and cultural information for major destinations.
- **Budget Management**: Estimate trip costs and categorize expenses.
- **User Authentication**: Secure login with JWT.
- **Responsive Design**: Modern UI optimized for desktop and mobile devices.
- **Offline Mode**: Cache itineraries and weather data for offline access (planned feature).

---

## 🗂️ Project Structure

```
ai-smart-travel-planner/
├── backend/                    # Node.js Express API server
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Trip.js
│   │   └── Location.js
│   ├── routes/                 # Express routes
│   │   ├── auth.js
│   │   ├── trips.js
│   │   ├── locations.js
│   │   ├── weather.js
│   │   ├── ai.js
│   │   └── users.js
│   ├── middleware/             # Custom middleware
│   │   └── auth.js
│   ├── services/               # Service layer for external APIs
│   │   ├── ai.service.js
│   │   ├── maps.service.js
│   │   └── weather.service.js
│   ├── utils/                  # Utility functions
│   ├── server.js               # Main server file
│   ├── test-apis.js            # API testing server
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── BACKEND.md              # Backend documentation
├── frontend/                   # React frontend application
│   ├── src/                    # React source files
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API service functions
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx             # Main App component
│   │   └── main.jsx            # React entry point
│   ├── public/                 # Static assets
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   ├── package.json
│   └── eslint.config.js        # ESLint configuration
└── package.json                # Root package.json for workspace management
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB database
- API keys for Google Maps, OpenWeather, and Gemini

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd ai-smart-travel-planner
```

2. Install dependencies for both backend and frontend
```bash
npm run install:all
```

3. Set up environment variables
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys and database URI
```

### Running the Application

#### Development Mode (Both frontend and backend)
```bash
npm run dev
```

#### Run Backend Only
```bash
npm run dev:backend
```

#### Run Frontend Only
```bash
npm run dev:frontend
```

## Technology Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- External APIs: Google Maps, OpenWeather, Gemini AI

### Frontend
- React 19
- Vite (build tool)
- Tailwind CSS
- React Router
- Axios (HTTP client)

## 🚀 Deployment Guide

The application is designed to be deployed with:
- Frontend: [Vercel](https://vercel.com)
- Backend: [Render](https://render.com)

### Troubleshooting Deployment Issues

#### Common API Errors

1. **Weather API Error (500)**
   - If you're getting 500 errors from the weather API, make sure:
   - The `OPENWEATHER_API_KEY` is properly set in environment variables
   - You're passing valid city names (countries like "South Korea" may not work directly)
   - For countries, try specifying a major city instead (e.g., "Seoul" instead of "South Korea")

2. **AI Endpoint Errors (404)**
   - If endpoints like `/api/ai/destination-info` return 404:
   - Ensure the backend is properly updated with all required endpoints
   - Check that the `GEMINI_API_KEY` is set in environment variables
   - Verify the correct route structure in both frontend and backend

3. **CORS Issues**
   - If experiencing CORS errors:
   - Update the CORS origins in `backend/server.js` to include your Vercel deployment URL
   - Ensure both frontend and backend are using HTTPS in production

#### Environment Variables

**Backend (Render):**
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `OPENWEATHER_API_KEY`: OpenWeather API key
- `GEMINI_API_KEY`: Google Gemini API key

**Frontend (Vercel):**
- `VITE_API_BASE_URL`: URL to the backend API (e.g., https://journeyai-backend.onrender.com/api)

#### Recent Fixes (July 9, 2025)

- Fixed Weather API authentication - endpoints are now public for better access
- Added missing destination-info endpoint for cultural information
- Added enhanced trip cost estimation endpoint with itinerary support
- Improved error handling for all API endpoints

---
