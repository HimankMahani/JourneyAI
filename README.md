# AI Smart Travel Planner

A full-stack travel planning application with AI-powered recommendations, weather forecasts, and itinerary management.

## Project Structure

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
- Google OAuth 2.0
- External APIs: Google Maps, OpenWeather, Gemini AI

### Frontend
- React 19
- Vite (build tool)
- Tailwind CSS
- React Router
- Axios (HTTP client)
