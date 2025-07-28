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
      destination,
      budget,
      travelers,
      duration,
      status,
      activities,
      itinerary,
      estimatedCost,
      generatedBy
    } = req.body;
    

    // Calculate dates if not provided
    const tripStartDate = startDate ? new Date(startDate) : new Date();
    const tripEndDate = endDate ? new Date(endDate) : new Date(Date.now() + (duration || 7) * 24 * 60 * 60 * 1000);

    // Format destination properly
    const formattedDestination = typeof destination === 'string' 
      ? { name: destination }
      : destination || { name: 'Unknown Destination' };

    // Format budget properly
    const formattedBudget = typeof budget === 'number'
      ? { amount: budget, currency: 'INR' }
      : budget || { amount: 0, currency: 'INR' };

    // Create new trip
    const newTrip = new Trip({
      title: title || `Trip to ${formattedDestination.name}`,
      description,
      user: req.userId,
      startDate: tripStartDate,
      endDate: tripEndDate,
      destination: formattedDestination,
      budget: formattedBudget,
      travelers: travelers || 1,
      duration: duration || Math.ceil((tripEndDate - tripStartDate) / (1000 * 60 * 60 * 24)),
      status: status || 'planning',
      activities: activities || [],
      itinerary: itinerary || [],
      accommodation: [],
      transportation: [],
      notes: [],
      aiSuggestions: [],
      estimatedCost: estimatedCost,
      generatedBy: generatedBy || 'user'
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error('Error creating trip:', error);
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

export default router;
