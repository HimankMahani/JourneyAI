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
import debugRoutes from './routes/debug.js';
import visitRoutes from './routes/visit.js';

const app = express();
const PORT = process.env.PORT || 5050;

// CORS: allow Vercel frontend (via env) and localhost for dev
import cors from 'cors';

const allowedOrigins = [
  process.env.VERCEL_FRONTEND_URL,
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false
};

app.use(cors(corsOptions));
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
app.use('/api/debug', debugRoutes);
app.use('/api/visit', visitRoutes);

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