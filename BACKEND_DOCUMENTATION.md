# JourneyAI Backend Documentation

## Overview
JourneyAI Backend is a RESTful API server built with Node.js and Express.js that provides comprehensive travel planning functionality. It integrates with multiple external APIs to deliver AI-powered travel recommendations, weather forecasts, and location services.

## Architecture

### Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas (NoSQL)
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **HTTP Client**: axios, node-fetch
- **Environment Management**: dotenv
- **Development**: nodemon

### External API Integrations
- **Google Gemini AI**: AI-powered travel recommendations and cost estimation
- **OpenWeather API**: Real-time weather data and 5-day forecasts

## Server Configuration

### Entry Point: `server.js`
```javascript
// Key configurations:
- Port: 5050 (configurable via environment)
- CORS: Multi-origin support for development and production
- Body parsing: JSON and URL-encoded
- Database: MongoDB Atlas with connection pooling
- Error handling: Comprehensive middleware
```

### CORS Configuration
```javascript
// Allowed origins:
- https://journey-ai-beta.vercel.app (Production)
- https://journey-12u0xy4d3-himankmahanis-projects.vercel.app (Staging)
- http://localhost:5173 (Vite dev server)
- http://localhost:5174 (Alternative dev server)
- http://localhost:5000 (Local testing)
```

## Database Models

### User Model (`models/User.js`)
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  firstName: String,
  lastName: String,
  location: {
    city: String,
    country: String,
    full: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Trip Model (`models/Trip.js`)
```javascript
{
  title: String (required),
  description: String,
  user: ObjectId (ref: User),
  startDate: Date (required),
  endDate: Date (required),
  destination: {
    name: String (required),
    coordinates: { lat: Number, lng: Number },
    country: String,
    placeId: String
  },
  budget: {
    currency: String (default: 'INR'),
    amount: Number
  },
  itinerary: [{
    day: Number,
    date: Date,
    activities: [{
      time: String,
      activity: String,
      location: String,
      type: String,
      cost: Number,
      notes: String
    }]
  }],
  travelers: Number (default: 1),
  duration: Number,
  status: String (enum: planning, confirmed, completed),
  accommodation: Array,
  transportation: Array,
  notes: Array,
  aiSuggestions: Array,
  estimatedCost: Object,
  generatedBy: String (default: 'user'),
  isPublic: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## API Routes

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
**Description**: Register a new user
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "location": "New York, USA"
}
```
**Response**:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### POST `/api/auth/login`
**Description**: Login user
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Trip Routes (`/api/trips`)

#### GET `/api/trips`
**Description**: Get all trips for authenticated user
**Headers**: `Authorization: Bearer <token>`
**Response**:
```json
[
  {
    "id": "trip_id",
    "title": "Trip to Paris",
    "destination": { "name": "Paris" },
    "startDate": "2024-06-01",
    "endDate": "2024-06-07",
    // ... other trip fields
  }
]
```

#### POST `/api/trips`
**Description**: Create a new trip
**Headers**: `Authorization: Bearer <token>`
**Body**:
```json
{
  "title": "Trip to Tokyo",
  "description": "Amazing adventure in Japan",
  "startDate": "2024-07-01",
  "endDate": "2024-07-10",
  "destination": {
    "name": "Tokyo, Japan"
  },
  "budget": {
    "amount": 200000,
    "currency": "INR"
  },
  "travelers": 2,
  "itinerary": [...] // Optional
}
```

#### GET `/api/trips/:id`
**Description**: Get specific trip details
**Headers**: `Authorization: Bearer <token>`
**Response**: Complete trip object

#### PUT `/api/trips/:id`
**Description**: Update trip details
**Headers**: `Authorization: Bearer <token>`
**Body**: Partial trip object with fields to update

#### DELETE `/api/trips/:id`
**Description**: Delete a trip
**Headers**: `Authorization: Bearer <token>`
**Response**: Success confirmation

### Weather Routes (`/api/weather`)

#### GET `/api/weather/current`
**Description**: Get current weather for a location
**Query Parameters**:
- `city`: City name (e.g., "Paris", "Tokyo")
- `lat` & `lon`: Coordinates (alternative to city)

**Response**:
```json
{
  "location": {
    "name": "Paris",
    "country": "FR",
    "coordinates": { "lat": 48.8566, "lon": 2.3522 }
  },
  "current": {
    "temp": 22.5,
    "feels_like": 23.1,
    "humidity": 65,
    "pressure": 1013,
    "wind_speed": 3.2,
    "description": "partly cloudy",
    "icon": "02d",
    "clouds": 25,
    "timestamp": 1640995200,
    "sunrise": 1640937600,
    "sunset": 1640968800
  }
}
```

#### GET `/api/weather/forecast`
**Description**: Get 5-day weather forecast
**Query Parameters**: Same as current weather
**Response**:
```json
{
  "location": {
    "name": "Paris",
    "country": "FR",
    "coordinates": { "lat": 48.8566, "lon": 2.3522 }
  },
  "forecast": [
    {
      "date": "2024-01-01",
      "temp_min": 18.2,
      "temp_max": 24.5,
      "condition": { "main": "Clouds" },
      "icon": "04d",
      "timestamps": [
        {
          "time": "2024-01-01T12:00:00Z",
          "temp": 22.0,
          "description": "scattered clouds",
          "wind_speed": 2.1,
          "probability": 0.15
        }
      ]
    }
  ]
}
```

### Trip Generator Routes (`/api/generator`)
**Description**: AI-powered trip generation endpoints

#### POST `/api/generator/place-photos`
**Description**: Get photos for multiple places using image fallback system
**Headers**: `Authorization: Bearer <token>`
**Body**:
```json
{
  "places": ["Paris", "Tokyo", "New York"]
}
```
**Response**:
```json
{
  "success": true,
  "photos": [
    {
      "placeName": "Paris",
      "photoUrl": "https://images.unsplash.com/photo-..."
    }
  ]
}
```

### Image Retrieval System
**Photo Sources Hierarchy**:
1. Curated destination images (Priority 1) - High-quality, hand-selected images
2. Wikimedia Commons photos (Priority 2) - Wikipedia-sourced images
3. Pexels photos (Priority 3) - Stock photography
4. Smart fallback images (Priority 4) - Default travel-themed images

**Implementation**: 
- Used in `services/places.service.js` 
- Provides reliable image sourcing without external API dependencies
- Ensures consistent image availability for all destinations

## Middleware

### Authentication Middleware (`middleware/auth.js`)
```javascript
// Verifies JWT token from Authorization header
// Adds userId to request object
// Protects routes requiring authentication
```

## Services

### AI Service (`services/ai.service.js`)
```javascript
// Integrates with Google Gemini AI
// Handles content generation for travel recommendations
// Manages AI API calls with error handling
```

### Weather Service Integration
```javascript
// Direct integration in weather routes
// Handles OpenWeather API calls
// Processes and formats weather data
```

## Error Handling

### Global Error Handler
```javascript
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});
```

### API Error Responses
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (access denied)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

## Environment Variables

### Required Variables
```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key
OPENWEATHER_API_KEY=your_openweather_api_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5050 (optional, defaults to 5050)
NODE_ENV=production (for production deployment)
```

## Security Features

### Password Security
- bcryptjs hashing with salt rounds
- Passwords never stored in plain text

### JWT Authentication
- Token-based authentication
- 30-day token expiration
- Stateless authentication

### Input Validation
- Mongoose schema validation
- Request body validation
- SQL injection protection (NoSQL)

### CORS Protection
- Configured allowed origins
- Credential support
- Method restrictions

## Database Connection

### MongoDB Atlas Configuration
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  family: 4 // IPv4
})
```

### Connection Features
- Automatic reconnection
- Connection pooling
- Timeout handling
- Error logging

## Testing

### Available Test Scripts
```bash
npm run test:apis      # Test API endpoints
npm run test:server    # Test server functionality
npm run test:db        # Test database operations
```

### API Testing
- Direct API endpoint testing
- Database connectivity tests
- External API integration tests

## Deployment

### Production Configuration
- Environment: `NODE_ENV=production`
- Platform: Render.com
- Auto-deployment from Git
- Environment variable management

### Development Setup
```bash
npm install
npm run dev  # Uses nodemon for auto-reload
```

## Performance Considerations

### Database Optimization
- Indexed fields (user email, trip user reference)
- Connection pooling
- Query optimization

### API Rate Limiting
- External API usage monitoring
- Error handling for rate limits
- Graceful degradation

### Memory Management
- Efficient data structures
- Stream processing for large data
- Garbage collection optimization

## Monitoring and Logging

### Logging Strategy
- Console logging for development
- Error tracking
- API request logging
- Database connection monitoring

### Health Checks
- Database connectivity
- External API availability
- Server status endpoint (`GET /`)
