import express from 'express';
import { auth } from '../middleware/auth.js';
import Trip from '../models/Trip.js';

const router = express.Router();

// @route   GET /api/trips
// @desc    Get all trips for the logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.userId }).sort({ startDate: 1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      destination
    } = req.body;

    // Validate required fields
    if (!title || !startDate || !endDate || !destination || !destination.name) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create new trip
    const newTrip = new Trip({
      title,
      description,
      user: req.userId,
      startDate,
      endDate,
      destination
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/trips/:id
// @desc    Get a trip by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if the trip belongs to the logged in user
    if (trip.user.toString() !== req.userId.toString() && !trip.isPublic) {
      return res.status(403).json({ message: 'Not authorized to access this trip' });
    }
    
    res.json(trip);
  } catch (error) {
    // Check if error is due to invalid ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/trips/:id
// @desc    Update a trip
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if the trip belongs to the logged in user
    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this trip' });
    }
    
    // Update fields
    const {
      title,
      description,
      startDate,
      endDate,
      destination,
      isPublic,
      budget
    } = req.body;
    
    if (title) trip.title = title;
    if (description !== undefined) trip.description = description;
    if (startDate) trip.startDate = startDate;
    if (endDate) trip.endDate = endDate;
    if (destination) trip.destination = destination;
    if (isPublic !== undefined) trip.isPublic = isPublic;
    if (budget) trip.budget = budget;
    
    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    // Check if error is due to invalid ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/trips/:id
// @desc    Delete a trip
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if the trip belongs to the logged in user
    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this trip' });
    }
    
    await Trip.deleteOne({ _id: trip._id });
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    // Check if error is due to invalid ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/trips/:id/itinerary
// @desc    Add activity to trip itinerary
// @access  Private
router.post('/:id/itinerary', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if the trip belongs to the logged in user
    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this trip' });
    }
    
    const { day, date, activities } = req.body;
    
    // Check if day already exists in itinerary
    const existingDayIndex = trip.itinerary.findIndex(item => item.day === day);
    
    if (existingDayIndex !== -1) {
      // Add activities to existing day
      activities.forEach(activity => {
        trip.itinerary[existingDayIndex].activities.push(activity);
      });
    } else {
      // Add new day to itinerary
      trip.itinerary.push({
        day,
        date,
        activities
      });
      
      // Sort itinerary by day
      trip.itinerary.sort((a, b) => a.day - b.day);
    }
    
    const updatedTrip = await trip.save();
    res.json(updatedTrip.itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/trips/:id/itinerary/:dayIndex
// @desc    Update activities for a specific day
// @access  Private
router.put('/:id/itinerary/:dayIndex', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    const dayIndex = parseInt(req.params.dayIndex);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    if (dayIndex < 0 || dayIndex >= trip.itinerary.length) {
      return res.status(404).json({ message: 'Day not found in itinerary' });
    }
    
    // Check if the trip belongs to the logged in user
    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this trip' });
    }
    
    const { activities } = req.body;
    
    if (activities) {
      trip.itinerary[dayIndex].activities = activities;
    }
    
    const updatedTrip = await trip.save();
    res.json(updatedTrip.itinerary[dayIndex]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/trips/:id/ai-suggest
// @desc    Get AI suggestions for a trip
// @access  Private
router.get('/:id/ai-suggest', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if the trip belongs to the logged in user
    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this trip' });
    }
    
    // This will be handled by the AI routes, just return existing suggestions for now
    res.json(trip.aiSuggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
