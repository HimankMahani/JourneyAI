# JourneyAI Frontend Documentation

## Overview
JourneyAI Frontend is a modern React-based single-page application (SPA) that provides an intuitive interface for AI-powered travel planning. Built with React 19 and Vite, it offers a responsive, fast, and user-friendly experience for creating and managing travel itineraries.

## Architecture

### Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.11
- **Routing**: React Router DOM 6.30.1
- **HTTP Client**: Axios 1.10.0
- **State Management**: React Context API
- **UI Components**: Custom componen### Security Considerations

### Authentication Security
- JWT token storage in localStorage
- Automatic token refresh
- Protected route implementation
- Session timeout handling

### Data Validation
- Client-side input validation
- XSS prevention
- CSRF protection
- Secure API communication

### Privacy Features
- User data protection
- Secure token handling
- Privacy-focused analytics
- GDPR compliance considerations

### Production Security
- Debug information removal
- Clean production builds
- Secure environment variable handling
- Error message sanitizationt icons
- **Notifications**: React Hot Toast 2.5.2, Sonner 2.0.6
- **Effects**: TSParticles 3.8.1
- **Development**: ESLint 9.25.0

### Build Configuration

#### Vite Configuration (`vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist'
  }
})
```

#### Tailwind Configuration (`tailwind.config.js`)
```javascript
// Utility-first CSS framework configuration
// Custom color schemes, spacing, and responsive breakpoints
```

## Project Structure

```
frontend/src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── planning/        # Trip planning specific components
│   ├── Header.jsx       # Navigation header
│   ├── Hero.jsx         # Landing page hero section
│   ├── Footer.jsx       # Site footer
│   ├── SignIn.jsx       # Authentication component
│   ├── SignUp.jsx       # Registration component
│   ├── ForgotPassword.jsx # Password recovery component
│   ├── TravelPlanning.jsx # Main planning interface
│   ├── Planning.jsx     # Trip planning page
│   ├── Destinations.jsx # Destinations showcase
│   ├── Booking.jsx      # My trips/bookings page
│   ├── TripCard.jsx     # Individual trip display card
│   └── ProtectedRoute.jsx # Route protection
├── contexts/            # React Context providers
│   ├── AuthContext.jsx  # Authentication state management
│   ├── TripContext.jsx  # Trip data management
│   ├── useAuth.js       # Authentication hook
│   ├── useTrip.js       # Trip management hook
│   └── useTripContext.js # Trip context hook
├── services/            # API service layer
│   └── api.js          # Axios configuration and API calls
├── hooks/              # Custom React hooks
│   └── usePlacePhoto.js # Google Places photo hook
├── data/               # Static data and utilities
│   ├── preGeneratedItineraries.js # Sample itineraries
│   └── tripData.js     # Trip-related data
├── lib/                # Utility functions
│   └── utils.js        # Common utilities
├── assets/             # Static assets
│   └── react.svg       # React logo
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
├── App.css             # Global styles
└── index.css           # Tailwind CSS imports
```

## Core Components

### App Component (`App.jsx`)
```javascript
// Main application structure
// Router configuration
// Context providers setup
// Route definitions and protection
```

**Key Features**:
- Nested routing with React Router
- Authentication state management
- Protected route implementation
- Layout component for consistent structure
- Global toast notifications

**Routes**:
- `/` - Home page (Hero + Travel Planning)
- `/destinations` - Destinations showcase (Protected)
- `/my-trips` - User's saved trips (Protected)
- `/planning/:tripId` - Trip planning interface (Protected)
- `/login` - Sign in page
- `/signup` - Registration page
- `/forgot-password` - Password recovery

### Authentication Components

#### SignIn Component (`SignIn.jsx`)
```javascript
// User login interface
// Form validation
// Error handling
// Redirect after successful login
```

#### SignUp Component (`SignUp.jsx`)
```javascript
// User registration interface
// Multi-step form
// Password validation
// Location input
// Account creation
```

#### ForgotPassword Component (`ForgotPassword.jsx`)
```javascript
// Password recovery interface
// Email input for reset
// Backend integration for password reset
// User feedback and success messages
```

#### ProtectedRoute Component (`ProtectedRoute.jsx`)
```javascript
// Route protection wrapper
// Authentication verification
// Automatic redirect to login
// Loading states
```

### Core UI Components

#### Header Component (`Header.jsx`)
```javascript
// Navigation bar
// Authentication status display
// User menu dropdown
// Mobile responsive navigation
// Logo and branding
```

#### Hero Component (`Hero.jsx`)
```javascript
// Landing page hero section
// Call-to-action elements
// Visual effects (particles)
// Responsive design
// Brand messaging
```

#### TravelPlanning Component (`TravelPlanning.jsx`)
```javascript
// Main trip creation interface
// AI-powered itinerary generation
// Form inputs for trip preferences
// Integration with backend APIs
// Real-time trip generation
```

#### TripCard Component (`TripCard.jsx`)
```javascript
// Individual trip display card
// Trip information summary
// Navigation to trip details
// Image handling with fallbacks
// Responsive card layout
```

#### Planning Component (`Planning.jsx`)
```javascript
// Detailed trip planning interface
// Tabbed navigation (Itinerary, Info, Packing)
// Weather integration
// Cultural information display
// Trip modification capabilities
```

### Planning Sub-Components (`components/planning/`)

#### TripHeader Component
```javascript
// Trip title and basic information
// Edit capabilities
// Status indicators
// Date and destination display
// Regenerate itinerary functionality
// Budget display and traveler count
```

#### ActivityCard Component
```javascript
// Individual activity display within itinerary
// Activity details (time, location, description)
// Cost information and duration
// Activity type categorization
// Interactive elements for activity management
// Photo integration for activities
```

#### TabNavigation Component
```javascript
// Tab switching interface
// Active tab highlighting
// Responsive design
// Accessibility features
```

#### ItineraryTab Component
```javascript
// Day-by-day itinerary display
// Activity cards with ActivityCard components
// Time-based organization
// Interactive elements
// Activity suggestions and modifications
```

#### DestinationInfoTab Component
```javascript
// Weather data display with current conditions
// Cultural information and local insights
// Local tips and recommendations
// Safety information and travel advisories
// Dynamic weather integration
```

#### PackingTab Component
```javascript
// Packing list management
// Item categorization by type
// Check-off functionality
// Weather-based suggestions
// Custom item addition
```

### UI Components (`components/ui/`)

#### Button Component
```javascript
// Reusable button with variants
// Size options (sm, md, lg)
// Color schemes (primary, secondary, etc.)
// Loading states
// Icon support
```

#### Card Component
```javascript
// Container component
// Shadow and border styling
// Header, content, footer sections
// Responsive padding
```

#### Badge Component
```javascript
// Status indicators
// Color variants
// Size options
// Text truncation
```

#### GradientBadge Component
```javascript
// Enhanced badge with gradient styling
// Premium visual appearance
// Color gradient variants
// Text and icon support
```

#### AI Button Component
```javascript
// Specialized button for AI interactions
// Loading states for AI operations
// Custom styling for AI features
// Integration with AI services
```

#### Separator Component
```javascript
// Visual separator element
// Horizontal and vertical orientations
// Customizable styling
// Spacing control
```

#### PlanningPageSkeleton Component
```javascript
// Loading placeholder for planning page
// Animated skeleton elements
// Maintains layout during loading
// Responsive skeleton structure
```

#### Skeleton Component
```javascript
// Loading placeholders
// Animated loading states
// Various shapes and sizes
// Accessibility support
```

## Recent Optimizations and Improvements

### Code Cleanup (Latest Updates)
- **Console Statement Removal**: All debug console.log statements removed from production code
- **Commented Code Cleanup**: Large commented-out code blocks removed for cleaner codebase
- **Unused Feature Removal**: Non-functional UI elements (like unused Share buttons) removed
- **Import Optimization**: Unused imports cleaned up across components

### Performance Enhancements
- **Reduced Bundle Size**: Removal of debug code and unused imports
- **Cleaner Console Output**: Production builds no longer show debug information
- **Optimized Component Structure**: Streamlined component hierarchy

### Weather Integration Improvements
- **Real-time Weather Data**: Enhanced weather service integration
- **Dynamic Weather Display**: Weather data integrated into destination information
- **Fallback Handling**: Graceful degradation when weather services are unavailable

## State Management

### AuthContext (`contexts/AuthContext.jsx`)
```javascript
const AuthContext = createContext();

// State management for:
// - User authentication status
// - User profile data
// - Login/logout functionality
// - Token management
// - Loading states

// Methods:
// - login(email, password)
// - register(userData)
// - logout()
// - getCurrentUser()
```

### TripContext (`contexts/TripContext.jsx`)
```javascript
const TripContext = createContext();

// State management for:
// - Current trip data
// - Trip list
// - Trip creation/editing
// - AI-generated content
// - Weather data
// - Cultural information

// Methods:
// - createTrip(tripData)
// - updateTrip(tripId, updates)
// - deleteTrip(tripId)
// - generateItinerary(preferences)
// - getWeather(destination)
```

### Custom Hooks

#### useAuth Hook (`contexts/useAuth.js`)
```javascript
// Simplified authentication interface
// Returns: { user, login, logout, loading }
// Handles authentication state
// Provides loading indicators
```

#### useTrip Hook (`contexts/useTrip.js`)
```javascript
// Trip management interface
// Returns: { trips, currentTrip, createTrip, updateTrip }
// Handles trip CRUD operations
// Manages loading states
```

#### usePlacePhoto Hook (`hooks/usePlacePhoto.js`)
```javascript
// Google Places photo integration
// Handles photo fetching for destinations
// Caching and error handling
// Fallback image management
```

## API Service Layer

### API Configuration (`services/api.js`)
```javascript
// Axios instance with base configuration
// Request/response interceptors
// Token management
// Error handling
// Service methods for all endpoints
```

**Base Configuration**:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**Services Available**:
- `authService` - Authentication operations
- `tripService` - Trip CRUD operations
- `weatherService` - Weather data fetching
- `aiService` - AI-powered recommendations

### Authentication Service
```javascript
authService: {
  login(email, password),          // User login
  register(userData),              // User registration
  logout(),                        // Clear session
  getCurrentUser(),                // Get stored user data
  getToken(),                      // Get auth token
  isAuthenticated()                // Check auth status
}
```

### Trip Service
```javascript
tripService: {
  getAllTrips(),                   // Get user's trips
  getTripById(id),                 // Get specific trip
  createTrip(tripData),            // Create new trip
  updateTrip(id, updates),         // Update existing trip
  deleteTrip(id),                  // Delete trip
  generateItinerary(preferences)   // AI-powered generation
}
```

### Weather Service
```javascript
weatherService: {
  getCurrentWeather(location),     // Current weather data
  getWeatherForecast(location),    // 5-day forecast
  getWeatherByCoords(lat, lon)     // Weather by coordinates
}
```

## Styling and Design

### Tailwind CSS Implementation
```css
/* Base styles in index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component styles */
@layer components {
  .btn-primary { /* Custom button styles */ }
  .card-shadow { /* Custom card shadows */ }
}
```

### Design System
- **Colors**: Custom color palette with semantic naming
- **Typography**: Responsive font scales
- **Spacing**: Consistent margin/padding system
- **Shadows**: Layered shadow system
- **Breakpoints**: Mobile-first responsive design

### Responsive Design
```javascript
// Breakpoint system:
// sm: 640px   - Small tablets
// md: 768px   - Large tablets
// lg: 1024px  - Small desktops
// xl: 1280px  - Large desktops
// 2xl: 1536px - Extra large screens
```

## User Experience Features

### Loading States
- Skeleton components for content loading
- Button loading indicators
- Page-level loading spinners
- Progressive data loading

### Error Handling
- Toast notifications for errors
- Fallback UI components
- Graceful degradation
- User-friendly error messages

### Notifications
```javascript
// Toast notifications using react-hot-toast and sonner
// Success, error, warning, and info messages
// Auto-dismiss functionality
// Position customization
```

### Interactive Elements
- Hover effects and transitions
- Click feedback
- Keyboard navigation support
- Focus indicators

## Performance Optimization

### Code Splitting
```javascript
// Lazy loading of route components
const Planning = lazy(() => import('./components/Planning'));

// Suspense boundaries for loading states
<Suspense fallback={<LoadingSpinner />}>
  <Planning />
</Suspense>
```

### Asset Optimization
- Image optimization with proper formats
- Icon system with Lucide React
- CSS purging with Tailwind
- Bundle size monitoring

### State Optimization
- Context splitting for performance
- Memoization of expensive computations
- Efficient re-rendering patterns
- Local state vs global state decisions

## Environment Configuration

### Environment Variables
```bash
VITE_API_BASE_URL=http://localhost:5050/api  # Backend API URL
# Note: Google Places API key configured on backend only
```

### Development vs Production
- Different API endpoints
- Debug mode configurations
- Error reporting levels
- Performance monitoring

## Build and Deployment

### Development Build
```bash
npm run dev          # Start development server
npm run lint         # Run ESLint checks
```

### Production Build
```bash
npm run build        # Create production build
npm run preview      # Preview production build locally
```

### Deployment Configuration
- **Platform**: Vercel
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Configured in Vercel dashboard

## Testing Strategy

### Component Testing
- React Testing Library setup
- Unit tests for components
- Integration tests for user flows
- Accessibility testing

### E2E Testing
- User journey testing
- Authentication flows
- Trip creation workflows
- Error scenario testing

## Security Considerations

### Authentication Security
- JWT token storage in localStorage
- Automatic token refresh
- Protected route implementation
- Session timeout handling

### Data Validation
- Client-side input validation
- XSS prevention
- CSRF protection
- Secure API communication

### Privacy Features
- User data protection
- Secure token handling
- Privacy-focused analytics
- GDPR compliance considerations

## Accessibility Features

### WCAG Compliance
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation
- Screen reader support

### Inclusive Design
- Color contrast compliance
- Font size accessibility
- Focus indicators
- Alternative text for images

## Browser Support

### Supported Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Progressive Enhancement
- Core functionality without JavaScript
- Graceful degradation
- Feature detection
- Polyfill strategies

## Monitoring and Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Bundle size monitoring
- API response time tracking
- Error rate monitoring

### User Analytics
- User journey tracking
- Feature usage analytics
- Performance metrics
- Error reporting
