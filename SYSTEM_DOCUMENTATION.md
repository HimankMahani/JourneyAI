# JourneyAI - Complete System Documentation

## System Overview

JourneyAI is a full-stack intelligent travel planning application that lev│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │       │
│  │ ai.service  │ │places.svc   │ │aiResponse   │ │itinerary │  │       │
│  │ (Gemini)    │ │ (Images)    │ │ .service    │ │ Parser   │  │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │       │es AI to create personalized travel itineraries, provide real-time weather data, and offer cultural insights for destinations worldwide.

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW DIAGRAM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USER INPUT                     FRONTEND                    BACKEND         │
│  ┌─────────────┐               ┌─────────────┐           ┌─────────────┐     │
│  │ Trip        │──────────────►│ React Form  │──────────►│ Express     │     │
│  │ Preferences │               │ Validation  │   POST    │ Route       │     │
│  │             │               │             │ /trips    │ Handler     │     │
│  │ • Dest      │               │ • State     │           │             │     │
│  │ • Dates     │               │ • Validation│           │ • Auth      │     │
│  │ • Budget    │               │ • Error UI  │           │ • Validation│     │
│  │ • Travelers │               │             │           │ • Process   │     │
│  └─────────────┘               └─────────────┘           └─────────────┘     │
│                                       ▲                         │           │
│                                       │                         ▼           │
│  ┌─────────────┐               ┌─────────────┐           ┌─────────────┐     │
│  │ Display     │◄──────────────│ UI Update   │◄──────────│ AI Service  │     │
│  │ Generated   │               │ Components  │   JSON    │ Integration │     │
│  │ Itinerary   │               │             │ Response  │             │     │
│  │             │               │ • Trip List │           │ • Gemini AI │     │
│  │ • Activities│               │ • Planning  │           │ • Content   │     │
│  │ • Schedule  │               │ • Weather   │           │ • Generation│     │
│  │ • Photos    │               │ • Cultural  │           │             │     │
│  └─────────────┘               └─────────────┘           └─────────────┘     │
│                                                                 │           │
│                                                                 ▼           │
│  EXTERNAL APIs                  DATABASE                 ┌─────────────┐     │
│  ┌─────────────┐               ┌─────────────┐           │ Data        │     │
│  │ Gemini AI   │◄──────────────│ MongoDB     │◄──────────│ Processing  │     │
│  │ • Generate  │               │ Atlas       │   Save    │ & Storage   │     │
│  │ • Recommend │               │             │   Trip    │             │     │
│  │ • Format    │               │ Collections:│           │ • Parse AI  │     │
│  └─────────────┘               │ • Users     │           │ • Weather   │     │
│                                │ • Trips     │           │ • Images    │     │
│  ┌─────────────┐               │ • Locations │           │ • Cultural  │     │
│  │ OpenWeather │◄──────────────│ • AIResponse│           │   Data      │     │
│  │ • Current   │               └─────────────┘           └─────────────┘     │
│  │ • Forecast  │                                                           │
│  │ • Conditions│                                                           │
│  └─────────────┘                                                           │
│                                                                             │
│  ┌─────────────┐                                                           │
│  │ Image APIs  │                                                           │
│  │ • Wikimedia │                                                           │
│  │ • Pexels    │                                                           │
│  │ • Fallbacks │                                                           │
│  └─────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Data Flow Process

### 1. User Registration & Authentication Flow
```
User Input → Frontend Form → Backend Validation → Password Hash → MongoDB Storage
     ↓              ↓              ↓                    ↓              ↓
Email/Pass → React State → JWT Creation → bcrypt Hash → User Document
     ↓              ↓              ↓                    ↓              ↓
Submit → Form Submit → Auth Route → Token Generate → Database Save
     ↓              ↓              ↓                    ↓              ↓
Success ← UI Update ← JSON Response ← JWT Token ← Success Response
```

### 2. Trip Creation & AI Generation Flow
```
Trip Preferences → Frontend Processing → Backend AI Service → External APIs
       ↓                    ↓                    ↓                ↓
User Selection → Form Data → Service Layer → Gemini AI API
       ↓                    ↓                    ↓                ↓
Destination → Validation → AI Prompt → Content Generation
       ↓                    ↓                    ↓                ↓
Dates/Budget → State Mgmt → API Call → Structured Response
       ↓                    ↓                    ↓                ↓
Preferences → Trip Object → Parse Data → Itinerary JSON
       ↓                    ↓                    ↓                ↓
Submit → POST Request → Database Save → Trip Document
       ↓                    ↓                    ↓                ↓
Response ← Frontend Update ← Success JSON ← MongoDB Storage
```

### 3. Weather Integration Flow
```
Location Data → Weather Service → OpenWeather API → Data Processing
      ↓               ↓                ↓                  ↓
Trip Destination → API Request → Current Weather → JSON Response
      ↓               ↓                ↓                  ↓
Coordinates → Service Call → 5-Day Forecast → Data Format
      ↓               ↓                ↓                  ↓
City Name → HTTP Request → Weather Data → Frontend Update
      ↓               ↓                ↓                  ↓
Display ← UI Component ← Processed Data ← Weather Object
```

### 4. Image Retrieval Flow
```
Place Names → Places Service → Image Sources → Fallback Chain
     ↓              ↓              ↓              ↓
Destinations → getCachedPhoto → Curated Images → Priority 1
     ↓              ↓              ↓              ↓
Activities → Image Search → Wikimedia API → Priority 2
     ↓              ↓              ↓              ↓
Locations → Photo Request → Pexels API → Priority 3
     ↓              ↓              ↓              ↓
Display ← Frontend ← Smart Fallback ← Priority 4
```

### 5. Real-time Data Synchronization
```
Frontend State ⟷ Backend API ⟷ Database ⟷ External APIs
       ↓               ↓           ↓           ↓
Context API ⟷ REST Endpoints ⟷ MongoDB ⟷ Live Data
       ↓               ↓           ↓           ↓
Component ⟷ HTTP Requests ⟷ Collections ⟷ API Responses
Updates         (axios)      (Mongoose)    (Real-time)
```

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 USER LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Web Browser (Desktop/Mobile) → React SPA → Responsive UI Components       │
└─────────────────────────────────────────────────────────────────────────────┘
                                         │
                                    HTTPS/JSON
                                         │
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  React 19 Application (Port: 5173)                                         │
│  ├── Components (UI, Planning, Auth)                                       │
│  ├── Context API (Auth, Trip State Management)                             │
│  ├── Services (API Communication Layer)                                    │
│  ├── Routing (React Router DOM)                                            │
│  └── Styling (Tailwind CSS)                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                         │
                                    HTTP/REST API
                                         │
┌─────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Node.js Express Server (Port: 5050)                                       │
│  ├── Authentication (JWT)              ├── Trip Management                 │
│  ├── Route Handlers                    ├── AI Service Integration          │
│  ├── Middleware (Auth, CORS, Error)    ├── Weather Service                 │
│  └── Data Validation                   └── Places Service                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                         │
                              Multiple Connections
                                         │
┌─────────────────────────────────────────────────────────────────────────────┐
                                          │
┌─────────────────────────────────────────────────────────────────────────────┐
                                          │
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA & EXTERNAL APIS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   MongoDB       │  │  Google Gemini  │  │  OpenWeather    │             │
│  │   Atlas         │  │  AI API         │  │  API            │             │
│  │  (Database)     │  │  (AI Service)   │  │  (Weather)      │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              REACT FRONTEND                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   App.jsx       │    │   Router        │    │   Context       │         │
│  │ (Entry Point)   │◄──►│ (Navigation)    │◄──►│ (State Mgmt)    │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                 │                        │                  │
│                                 ▼                        ▼                  │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                      MAIN COMPONENTS                            │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │       │
│  │  │   Header    │ │    Hero     │ │ TravelPlan  │ │  Footer  │  │       │
│  │  │ Navigation  │ │  Landing    │ │  Creation   │ │ Contact  │  │       │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                    FEATURE COMPONENTS                           │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │       │
│  │  │ SignIn/Up   │ │  Planning   │ │Destinations │ │ Booking  │  │       │
│  │  │   (Auth)    │ │ (Trip Mgmt) │ │ (Showcase)  │ │(My Trips)│  │       │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                       UI COMPONENTS                             │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │       │
│  │  │   Button    │ │    Card     │ │    Badge    │ │ Skeleton │  │       │
│  │  │ (Actions)   │ │(Containers) │ │ (Status)    │ │(Loading) │  │       │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                     SERVICE LAYER                               │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │       │
│  │  │ Auth Service│ │Trip Service │ │Weather Svc  │ │AI Service│  │       │
│  │  │    (JWT)    │ │   (CRUD)    │ │ (Weather)   │ │ (Gemini) │  │       │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Backend Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND SERVER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   server.js     │    │   Middleware    │    │   Routes        │         │
│  │ (Entry Point)   │◄──►│ (CORS,Auth,Err) │◄──►│ (Endpoints)     │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                 │                        │                  │
│                                 ▼                        ▼                  │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                         ROUTE MODULES                           │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │       │
│  │  │    auth     │ │    trips    │ │   weather   │ │    ai    │  │       │
│  │  │ /api/auth   │ │ /api/trips  │ │/api/weather │ │ /api/ai  │  │       │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │       │
│  │                                                                 │       │
│  │  ┌─────────────┐                                                │       │
│  │  │tripGenerator│                                                │       │
│  │  │/api/generator│                                               │       │
│  │  └─────────────┘                                                │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                       SERVICE LAYER                             │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │       │
│  │  │ ai.service  │ │places.svc   │ │aiResponse   │ │itinerary │  │       │
│  │  │ (Gemini)    │ │ (GoogleMaps)│ │ .service    │ │ Parser   │  │       │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                 │                                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                        DATA MODELS                              │       │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │       │
│  │  │    User     │ │    Trip     │ │AIResponse│            │       │
│  │  │ (Mongoose)  │ │ (Mongoose)  │ │(Mongoose)│            │       │
│  │  └─────────────┘ └─────────────┘ └──────────┘            │       │
│  └─────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MONGODB ATLAS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                                  │
│  │     USERS       │    │      TRIPS      │                                  │
│  │                 │    │                 │                                  │
│  │ _id (ObjectId)  │◄──┐│ _id (ObjectId)  │                                  │
│  │ email (String)  │   ││ user (ObjectId) │                                  │
│  │ password (Hash) │   ││ title (String)  │                                  │
│  │ firstName       │   ││ description     │                                  │
│  │ lastName        │   ││ destination     │                                  │
│  │ location        │   ││ startDate       │                                  │
│  │ createdAt       │   ││ endDate         │                                  │
│  │ updatedAt       │   ││ budget          │                                  │
│  └─────────────────┘   ││ itinerary[]     │                                  │
│                        ││ travelers       │    ┌─────────────────┐           │
│                        ││ status          │    │  AI_RESPONSES   │           │
│                        ││ createdAt       │    │                 │           │
│                        ││ updatedAt       │    │ _id (ObjectId)  │           │
│                        │└─────────────────┘    │ userId (Ref)    │───┐       │
│                        │                       │ queryType       │   │     │
│                        │ ┌─────────────────┐   │ query (Object)  │   │     │
│                        │ │   ITINERARY     │   │ response (Obj)  │   │     │
│                        │ │   (Embedded)    │   │ timestamp       │   │     │
│                        │ │                 │   └─────────────────┘   │     │
│                        │ │ day (Number)    │                         │     │
│                        │ │ date (Date)     │                         │     │
│                        │ │ activities[]    │                         │     │
│                        └►│ ├─ time         │                         │     │
│                          │ ├─ activity     │                         │     │
│                          │ ├─ location     │                         │     │
│                          │ ├─ type         │                         │     │
│                          │ ├─ cost         │                         │     │
│                          │ └─ notes        │                         │     │
│                          └─────────────────┘                         │     │
│                                                                      │     │
│                          ┌─────────────────┐◄────────────────────────┘     │
│                          │     INDEX       │                               │
│                          │                 │                               │
│                          │ users.email     │                               │
│                          │ trips.user      │                               │
│                          │ trips.startDate │                               │
│                          └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## API Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER JOURNEY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Action → Frontend → API Request → Backend → External APIs → Response  │
│                                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │ User Clicks │──►│ React Event │──►│HTTP Request │──►│Express Route│     │
│  │"Plan Trip"  │   │ Handler     │   │(axios)      │   │ Handler     │     │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘     │
│                                                                ▼            │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │Trip Created │◄──│UI Update    │◄──│JSON Response│◄──│Database     │     │
│  │& Displayed  │   │(State Mgmt) │   │             │   │Save         │     │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘     │
│                                                                ▲            │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │Weather Data │◄──│AI Processing│◄──│External API │◄──│Service Layer│     │
│  │Integration  │   │& Formatting │   │Calls        │   │Processing   │     │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AUTHENTICATION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐  │
│  │   Login     │────►│  Validate   │────►│   Generate  │────►│  Return  │  │
│  │ Credentials │     │ Password    │     │ JWT Token   │     │   Token  │  │
│  └─────────────┘     └─────────────┘     └─────────────┘     └──────────┘  │
│                              │                   │                         │
│                              ▼                   ▼                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │   Error     │◄────│   bcrypt    │     │     JWT     │                   │
│  │  Response   │     │ Validation  │     │  Signature  │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                  │                         │
│                                                  ▼                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │ Protected   │◄────│ Middleware  │◄────│ Frontend    │                   │
│  │ Route Access│     │Auth Check   │     │ Stores Token│                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                              │                                             │
│                              ▼                                             │
│  ┌─────────────┐     ┌─────────────┐                                       │
│  │ Unauthorized│◄────│ Token       │                                       │
│  │ Response    │     │ Validation  │                                       │
│  └─────────────┘     └─────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## AI Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AI PROCESSING FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐  │
│  │   User      │────►│  Frontend   │────►│  Backend    │────►│ Service  │  │
│  │Preferences  │     │Validation   │     │ Processing  │     │ Layer    │  │
│  └─────────────┘     └─────────────┘     └─────────────┘     └──────────┘  │
│                                                                     │        │
│                                                                     ▼        │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐  │
│  │  Formatted  │◄────│   Parse     │◄────│  Gemini AI  │◄────│ API Call │  │
│  │ Itinerary   │     │ Response    │     │  Response   │     │ (Google) │  │
│  └─────────────┘     └─────────────┘     └─────────────┘     └──────────┘  │
│          │                                                                  │
│          ▼                                                                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │  Weather    │────►│  Enhanced   │────►│  Database   │                   │
│  │ Integration │     │ Itinerary   │     │   Storage   │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│          │                                       │                         │
│          ▼                                       ▼                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │OpenWeather  │     │  Cultural   │     │ Trip Record │                   │
│  │ API Call    │     │Information  │     │   Created   │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DEPLOYMENT ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐  │
│  │   GitHub    │────►│   Vercel    │     │   Render    │◄────│ GitHub   │  │
│  │ Repository  │     │ (Frontend)  │     │ (Backend)   │     │Repository│  │
│  │   (main)    │     │             │     │             │     │  (main)  │  │
│  └─────────────┘     └─────────────┘     └─────────────┘     └──────────┘  │
│          │                    │                   │                        │
│          │                    ▼                   ▼                        │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │   Auto      │     │   Build     │     │   Build     │                   │
│  │ Deployment  │     │  Process    │     │  Process    │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                              │                   │                         │
│                              ▼                   ▼                         │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │    CDN      │     │  React SPA  │     │   Node.js   │                   │
│  │Distribution │     │   Static    │     │   Server    │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                  │                         │
│                                                  ▼                         │
│                      ┌─────────────┐     ┌─────────────┐                   │
│                      │   MongoDB   │     │  External   │                   │
│                      │   Atlas     │     │    APIs     │                   │
│                      │ (Database)  │     │  (Google,   │                   │
│                      └─────────────┘     │OpenWeather) │                   │
│                                          └─────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Performance & Monitoring Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PERFORMANCE MONITORING                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐  │
│  │  Frontend   │────►│ Vercel      │────►│  Analytics  │────►│Dashboard │  │
│  │ Performance │     │Monitoring   │     │ Processing  │     │& Alerts  │  │
│  └─────────────┘     └─────────────┘     └─────────────┘     └──────────┘  │
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │  Backend    │────►│   Render    │────►│ Performance │                   │
│  │ Monitoring  │     │ Monitoring  │     │   Metrics   │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │  Database   │────►│  MongoDB    │────►│  Query      │                   │
│  │ Performance │     │ Monitoring  │     │Optimization │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │    API      │────►│  Response   │────►│  Latency    │                   │
│  │ Monitoring  │     │    Time     │     │  Analysis   │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

### Frontend Technologies
- **React 19**: Modern component-based UI library
- **Vite 6.3.5**: Fast build tool and development server
- **Tailwind CSS 4.1.11**: Utility-first CSS framework
- **React Router DOM 6.30.1**: Client-side routing
- **Axios 1.10.0**: HTTP client for API requests
- **Lucide React**: Modern icon library
- **React Hot Toast & Sonner**: Toast notification systems
- **TSParticles**: Interactive particle effects

### Backend Technologies
- **Node.js (v18+)**: JavaScript runtime environment
- **Express.js 4.18.2**: Web application framework
- **MongoDB Atlas**: Cloud NoSQL database
- **Mongoose 8.16.0**: ODM for MongoDB
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing
- **@google/generative-ai**: Google Gemini AI integration
- **axios & node-fetch**: HTTP client libraries

### External Integrations
- **Google Gemini AI**: Advanced AI for travel recommendations
- **OpenWeather API**: Real-time weather data and forecasts

### Development & Deployment
- **ESLint**: Code linting and formatting
- **Nodemon**: Development auto-reload
- **Vercel**: Frontend deployment platform
- **Render**: Backend deployment platform
- **Git & GitHub**: Version control and CI/CD

This comprehensive system documentation provides a complete technical overview of the JourneyAI application architecture, including detailed diagrams for understanding the system's components, data flow, and deployment strategy.
