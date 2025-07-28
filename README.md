# JourneyAI: AI-Powered Smart Travel Planner

JourneyAI is full-stack AI travel planning platform that delivers personalized itineraries, real-time weather integration, cultural insights, and intelligent budget management. Built with modern technologies and optimized for scalability and user experience.

---

## 📚 Documentation Index

- [System Architecture & Diagrams](SYSTEM_DOCUMENTATION.md)
- [Backend API & Services](BACKEND_DOCUMENTATION.md)
- [Frontend Architecture & UI](FRONTEND_DOCUMENTATION.md)
- [Weather Integration Details](WEATHER_INTEGRATION_SUMMARY.md)

---

## 🌟 Key Features

### Core Functionality
- **🤖 AI-Powered Itineraries**: Personalized, day-by-day travel plans using Google Gemini AI
- **🌤️ Real-Time Weather Integration**: Current conditions and 5-day forecasts via OpenWeather API
- **🏛️ Cultural Insights**: Local tips, customs, etiquette, and safety information for global destinations
- **💰 Smart Budget Management**: AI-driven cost estimation with dynamic pricing models
- **🔐 Secure Authentication**: JWT-based user authentication with session management
- **📱 Responsive Design**: Modern, mobile-first React interface with accessibility features

### Advanced Features
- **🖼️ Smart Image Integration**: Multi-source photo system (Google Places, Wikimedia, Pexels)
- **💾 AI Response Caching**: MongoDB-based caching system for optimal performance
- **📊 Enhanced Parsing**: Robust JSON parsing with error recovery for AI responses
- **🎯 Dynamic Trip Generation**: Real-time itinerary creation with fallback systems
- **📈 Storage Management**: Automated cleanup and statistics for AI response data


---

## 🗂️ Project Structure

```
JourneyAI/
├── backend/                    # Node.js Express API server
│   ├── models/                 # Mongoose schemas (User, Trip, AIResponse, Location)
│   ├── routes/                 # Express routes
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── trips.js           # Trip CRUD operations
│   │   ├── weather.js         # Weather data endpoints
│   │   ├── ai.js              # AI integration endpoints
│   │   └── tripGenerator.js   # AI trip generation & management
│   ├── services/              # Service layer
│   │   ├── ai.service.js      # Google Gemini AI integration
│   │   ├── places.service.js  # Multi-source image retrieval
│   │   ├── aiResponse.service.js # AI response caching & storage
│   │   └── itineraryParser.service.js # AI response parsing
│   ├── middleware/            # Custom middleware (auth, validation)
│   ├── data/                  # Static data (curated destinations)
│   └── server.js              # Main server file
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── ui/           # Reusable UI components
│   │   │   ├── planning/     # Trip planning components
│   │   │   └── *.jsx         # Feature components
│   │   ├── contexts/         # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service functions
│   │   ├── data/             # Static data & utilities
│   │   └── lib/              # Utility functions
│   ├── public/               # Static assets & images
│   └── dist/                 # Production build output
├── Documentation Files
├── ├── SYSTEM_DOCUMENTATION.md     # Architecture & deployment
├── ├── BACKEND_DOCUMENTATION.md    # Complete backend API docs
├── ├── FRONTEND_DOCUMENTATION.md   # Complete frontend architecture
├── └── WEATHER_INTEGRATION_SUMMARY.md # Weather API integration
└── Configuration Files
    ├── package.json          # Root workspace configuration
    ├── LICENSE              # MIT License
    └── README.md            # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ required)
- MongoDB Atlas account or local MongoDB instance
- API Keys:
  - [OpenWeather API](https://openweathermap.org/api) for weather data
  - [Google Gemini AI](https://ai.google.dev/) for AI-powered content generation

### Installation & Setup

1. **Clone and Install Dependencies**
```bash
git clone https://github.com/HimankMahani/JourneyAI.git
cd JourneyAI
npm install                    # Install root dependencies
cd backend && npm install      # Install backend dependencies
cd ../frontend && npm install  # Install frontend dependencies
```

2. **Environment Configuration**
```bash
# Backend environment setup
cd backend
cp .env.example .env
# Edit .env with your credentials:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret_key
# OPENWEATHER_API_KEY=your_openweather_api_key
# GEMINI_API_KEY=your_gemini_api_key
```

3. **Start Development Servers**
```bash
# Option 1: Run both servers concurrently (from root)
npm run dev

# Option 2: Run separately
npm run dev:backend    # Backend on http://localhost:5050
npm run dev:frontend   # Frontend on http://localhost:5173
```

### Production Build
```bash
# Frontend production build
cd frontend
npm run build

# Backend production start
cd backend
npm start
```

---

## 🛠️ Technology Stack

### Backend Technologies
- **Runtime**: Node.js (v18+) with ES6 modules
- **Framework**: Express.js with custom middleware
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT with bcryptjs password hashing
- **AI Integration**: Google Gemini AI for content generation
- **Weather Service**: OpenWeather API for real-time data
- **HTTP Client**: Axios & node-fetch for external API calls
- **Development**: Nodemon for hot reload

### Frontend Technologies
- **Framework**: React 19 with Hooks and Context API
- **Build Tool**: Vite 6.3.5 for fast development and builds
- **Styling**: Tailwind CSS 4.1.11 for utility-first styling
- **Routing**: React Router DOM 6.30.1 for navigation
- **HTTP Client**: Axios 1.10.0 for API communication
- **UI Components**: Custom component library with Lucide React icons
- **Notifications**: React Hot Toast & Sonner for user feedback
- **Effects**: TSParticles for interactive animations

### Development & Deployment
- **Code Quality**: ESLint for code linting and consistency
- **Version Control**: Git with semantic commit messages
- **Frontend Deployment**: Vercel (static hosting with global CDN)
- **Backend Deployment**: Render (Node.js server with auto-deploy)
- **Database Hosting**: MongoDB Atlas (cloud with multi-region support)
- **Environment Management**: dotenv for secure configuration

---

## 📦 Deployment & Production

### Deployment Architecture
- **Frontend**: Vercel (static hosting with edge caching and global CDN)
- **Backend**: Render (containerized Node.js with auto-scaling)
- **Database**: MongoDB Atlas (cloud-native with automatic backups)
- **CDN**: Vercel Edge Network for optimal performance

### Environment Variables

#### Backend (Production)
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/journeyai
JWT_SECRET=your_secure_jwt_secret_key
OPENWEATHER_API_KEY=your_openweather_api_key
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=production
PORT=5050
```

#### Frontend (Production)
```bash
# Frontend environment variables are handled at build time
# No runtime environment variables needed for static deployment
```

### Production Optimizations
- ✅ **Code Cleanup**: Removed all debug console.log statements
- ✅ **Bundle Optimization**: Minimized JavaScript and CSS bundles
- ✅ **Image Optimization**: Lazy loading and responsive images
- ✅ **Error Handling**: Comprehensive error boundaries and fallbacks
- ✅ **Security**: JWT authentication, CORS configuration, input validation
- ✅ **Performance**: Code splitting, caching strategies, and API optimization

See [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md) for detailed deployment guides and architecture diagrams.

---

## 🧪 Testing & Quality Assurance

### Backend Testing
- **API Endpoint Tests**: Comprehensive route testing with `test-trip-ai.js`
- **Database Connectivity**: MongoDB connection and query validation
- **AI Integration**: Google Gemini API response validation
- **Weather Service**: OpenWeather API integration testing
- **Error Handling**: Edge case and failure scenario testing

### Frontend Testing
- **Component Validation**: React component rendering and lifecycle testing
- **API Integration**: Frontend-backend communication validation
- **UI/UX Testing**: User interaction flows and responsive design
- **Authentication**: Login/logout and protected route testing
- **Performance**: Load time optimization and bundle size monitoring

### Code Quality
- ✅ **ESLint Integration**: Code linting and consistency enforcement
- ✅ **Clean Code**: Removed commented code blocks and debug statements
- ✅ **Type Safety**: Proper prop validation and error boundaries
- ✅ **Security Audit**: Authentication flows and data validation
- ✅ **Performance Audit**: Bundle analysis and optimization


---

## 🔧 Recent Improvements & Optimizations

### Code Quality Enhancements
- ✅ **Debug Cleanup**: Removed all console.log statements from production code
- ✅ **Code Optimization**: Cleaned up commented-out code blocks
- ✅ **Syntax Fixes**: Resolved deployment syntax errors and linting issues
- ✅ **Import Optimization**: Removed unused imports and dependencies

### User Experience Improvements
- ✅ **Form Validation**: Enhanced signup form with real-time password matching
- ✅ **Error Handling**: Improved error messages and user feedback
- ✅ **UI Cleanup**: Removed unnecessary icons and streamlined interface
- ✅ **Performance**: Faster load times with optimized bundle size

### Backend Enhancements
- ✅ **AI Response Caching**: MongoDB-based caching system for improved performance
- ✅ **Enhanced Parsing**: Robust JSON parsing with error recovery
- ✅ **Image Service**: Multi-source photo retrieval system
- ✅ **Budget Calculation**: Dynamic pricing models with destination factors

### Security & Stability
- ✅ **Production Ready**: Cleaned codebase suitable for production deployment
- ✅ **Error Recovery**: Comprehensive fallback systems for API failures
- ✅ **Input Validation**: Enhanced form validation and sanitization
- ✅ **Session Management**: Secure JWT implementation with proper expiration

---

## 🎯 Project Status

**Current Status**: ✅ **Production Ready**

- **Frontend**: Fully functional React application with modern UI
- **Backend**: Robust API server with AI integration and caching
- **Database**: MongoDB with optimized schemas and indexing
- **Deployment**: Successfully deployed on Vercel (frontend) and Render (backend)
- **Testing**: Comprehensive testing suite with error handling
- **Documentation**: Complete technical documentation and user guides

---

## 🤝 Contributing

This project is ready for contributions! Areas for potential enhancement:

1. **Testing**: Add comprehensive unit and integration tests
2. **Features**: Implement additional AI-powered travel features
3. **Internationalization**: Add multi-language support
4. **Mobile App**: React Native mobile application
5. **Analytics**: User behavior tracking and insights

For contribution guidelines, please open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

## 📞 Support & Documentation

- **Technical Issues**: Check the detailed documentation files
- **API Reference**: See [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md)
- **UI Components**: See [FRONTEND_DOCUMENTATION.md](FRONTEND_DOCUMENTATION.md)
- **System Architecture**: See [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
- **Weather Integration**: See [WEATHER_INTEGRATION_SUMMARY.md](WEATHER_INTEGRATION_SUMMARY.md)

*For complete technical specifications and implementation details, refer to the comprehensive documentation files linked above.*
