import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import weatherRoutes from './routes/weather.js';
import aiRoutes from './routes/ai.js';
import tripGeneratorRoutes from './routes/tripGenerator.js';

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS for all routes
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://journey-ai-beta.vercel.app',
      'https://journey-12u0xy4d3-himankmahanis-projects.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5000', // For local testing
      'http://localhost'       // For local testing
    ];
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
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
app.use('/api/ai', aiRoutes);
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