/* eslint-env node */
// Load environment variables first, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import locationRoutes from './routes/locations.js';
import weatherRoutes from './routes/weather.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/users.js';
import tripGeneratorRoutes from './routes/tripGenerator.js';
import { fileURLToPath } from 'url';
import path from 'path';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({
  origin: [
    'https://journey-ai-beta.vercel.app',
    'https://journey-12u0xy4d3-himankmahanis-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174' 
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static files only for production
// app.use(express.static(path.join(__dirname, 'dist')));

// Connect to MongoDB with more robust connection options
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Increase timeout for slow connections
  socketTimeoutMS: 45000, // How long to wait for responses from MongoDB
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  family: 4 // Use IPv4, skip trying IPv6
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Don't crash the server if MongoDB connection fails
    console.log('Continuing without MongoDB connection...');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/generator', tripGeneratorRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'JourneyAI Backend API'
  });
});

// Serve React frontend for all other routes (only for production)
/*
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
*/

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process - just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.log('Uncaught Exception:', error);
  // Don't exit the process - just log the error
});

// Start server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
