
# JourneyAI - Smart Travel Planner

A full-stack travel planning application that leverages AI to provide personalized travel recommendations, detailed itineraries, real-time weather forecasts, and cultural insights. The app is designed to simplify trip planning and enhance the travel experience.

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

ai-smart-travel-planner/

## 🗂️ Project Structure

```
JourneyAI/

---

## 🌟 Key Features

- **AI-Powered Itineraries**: Generate personalized travel plans based on user preferences.
- **Weather Integration**: Real-time weather data and 5-day forecasts for destinations (OpenWeather API).
- **Cultural Insights**: Local tips, dining etiquette, and cultural information for major destinations.
- **Budget Management**: Estimate trip costs and categorize expenses.
- **User Authentication**: Secure login with JWT.
- **Responsive Design**: Modern UI optimized for desktop and mobile devices.
- **Offline Mode**: Cache itineraries and weather data for offline access (planned feature).

---

## 🗂️ Project Structure

```
JourneyAI/
├── backend/                    # Node.js Express API server
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routes (auth, trips, weather, ai, etc.)
│   ├── middleware/             # Custom middleware
│   ├── services/               # Service layer for external APIs
│   ├── server.js               # Main server file
│   └── BACKEND.md              # Backend documentation
├── frontend/                   # React frontend application
│   ├── src/                    # React source files
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API service functions
│   │   ├── App.jsx             # Main App component
│   │   └── main.jsx            # React entry point
│   ├── public/                 # Static assets
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
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
cd JourneyAI
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

---

## 🌦️ Weather Integration & Cultural Info

- **Real-time weather data** (OpenWeather API) for authenticated users
- **5-day weather forecast** and weather-based travel recommendations
- **Fallback weather display** for unauthenticated users
- **Comprehensive cultural information** for major destinations (Paris, Tokyo, New York, London, Barcelona, Rome, Amsterdam, Dubai, etc.)
- **Local tips, customs, dining etiquette, and safety recommendations**
- **Responsive UI** with modern components and graceful error handling

---

## 🔧 API Configuration

### Backend Configuration (✅ Verified)
- **Port**: 5050
- **Database**: MongoDB Atlas (Connected)
- **Authentication**: JWT-based with middleware
- **Weather API**: OpenWeather API key configured

### Frontend Configuration (✅ Verified)
- **Port**: 5173 (Vite)
- **API Base URL**: `http://localhost:5050/api`
- **Hot Reload**: Working correctly

---

## 🚀 Testing & Validation

### Backend Tests (✅ Completed)
```bash
# OpenWeather API direct test
curl "https://api.openweathermap.org/data/2.5/weather?q=Paris&units=metric&appid=YOUR_OPENWEATHER_API_KEY"
# Result: ✅ Returns valid weather data
```

### Frontend Tests (✅ Completed)
- Component renders without errors
- Weather data displays correctly when available
- Fallback content shows when weather is unavailable
- Cultural information displays for all supported destinations

---

## 📱 User Experience

### For Authenticated Users
- Real-time weather data for their destination
- 5-day weather forecast
- Weather-based travel recommendations
- Cultural tips and local customs

### For Non-Authenticated Users
- Sample weather information
- Full cultural information and tips
- Prompt to log in for live weather data

---

## 🎯 Next Steps (Optional)

1. **Add More Destinations**: Extend cultural information database
2. **Historical Weather**: Add historical weather data for trip planning
3. **Weather Alerts**: Implement weather-based notifications
4. **Offline Mode**: Cache weather data for offline viewing
5. **Weather Maps**: Integrate weather visualization maps
6. **Unit Tests**: Add comprehensive test coverage for weather components

---

## 📊 Performance

- **Load Time**: Fast with proper loading states
- **Error Handling**: Graceful degradation when APIs are unavailable
- **Mobile Responsive**: Works well on all screen sizes
- **Hot Reload**: Instant updates during development

---

## 🚀 Deployment Guide

The application is designed to be deployed with:
- Frontend: [Vercel](https://vercel.com)
- Backend: [Render](https://render.com)

### Troubleshooting Deployment Issues

#### Common API Errors

1. **Weather API Error (500)**
   - If you're getting 500 errors from the weather API, make sure:
   - For countries, try specifying a major city instead (e.g., "Seoul" instead of "South Korea")

2. **AI Endpoint Errors (404)**
   - If endpoints like `/api/ai/destination-info` return 404:
   - Verify the correct route structure in both frontend and backend

3. **CORS Issues**
   - If experiencing CORS errors:
   - Ensure both frontend and backend are using HTTPS in production

#### Environment Variables

**Backend (Render):**
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `OPENWEATHER_API_KEY`: OpenWeather API key
- `GEMINI_API_KEY`: Google Gemini API key

**Frontend (Vercel):**
