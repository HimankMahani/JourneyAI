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
    'https://journey-ai-beta.vercel.app/login',
    'http://localhost:5173',
    'http://localhost:5174' 
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static files only for production
// app.use(express.static(path.join(__dirname, 'dist')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/generator', tripGeneratorRoutes);

// Serve React frontend for all other routes (only for production)
/*
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
*/

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
