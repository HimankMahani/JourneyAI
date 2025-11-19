import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import weatherRoutes from './routes/weather.js';
import tripGeneratorRoutes from './routes/tripGenerator.js';

const app = express();
const PORT = process.env.PORT || 5050;

// CORS: allow Vercel frontend and localhost for dev
const allowedOrigins = [
  // Prefer env-configured URL in production
  process.env.VERCEL_FRONTEND_URL,
  // Explicit beta URL to avoid env misconfig
  'https://journey-ai-beta.vercel.app',
  // Local dev (Vite default)
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // allow non-browser requests (no Origin) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
  credentials: false // set true only if using cookie-based auth
};

app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Increase timeout for slow connections
  socketTimeoutMS: 45000, // How long to wait for responses
  maxPoolSize: 10, // Max 10 connections
  family: 4 // Use IPv4
})
  .then(() => console.log('Connected to Database'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/generator', tripGeneratorRoutes);

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'JourneyAI Backend API'
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});