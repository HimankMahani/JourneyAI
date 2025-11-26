import express from 'express';
import { auth } from '../middleware/auth.js';
import Trip from '../models/Trip.js';
import { getUnsplashPhoto } from '../services/places.service.js';

const router = express.Router();

// @route   GET /api/trips/popular
// @desc    Get most popular destinations based on trip data
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const popularDestinations = await Trip.aggregate([
      {
        $match: { "destination.name": { $exists: true, $ne: null } }
      },
      {
        // Calculate duration for each trip first
        $addFields: {
          tripDuration: {
            $divide: [
              { $subtract: ["$endDate", "$startDate"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: "$destination.name",
          count: { $sum: 1 },
          avgBudget: { $avg: "$budget.amount" },
          avgDuration: { $avg: "$tripDuration" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const results = await Promise.all(popularDestinations.map(async (dest) => {
      const image = await getUnsplashPhoto(dest._id);
      
      // Format the average budget (e.g. 15000 -> 15k or 15,000)
      const avgCost = Math.round(dest.avgBudget || 0);
      const formattedPrice = avgCost > 0 
        ? '₹' + avgCost.toLocaleString('en-IN') 
        : 'Variable';

      // Format duration
      const avgDays = Math.round(dest.avgDuration || 5);
      
      return {
        id: dest._id,
        name: dest._id,
        stats: `${dest.count}+ people planned`,
        image: image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
        description: `Join ${dest.count} other travelers exploring ${dest._id}.`,
        rating: (4 + Math.random() * 1).toFixed(1), // Ratings are still simulated as we don't have post-trip reviews yet
        price: formattedPrice,
        duration: `${avgDays}-${avgDays + 2} days`,
        activities: ['Culture', 'Sightseeing', 'Food'] // Generic tags
      };
    }));

    res.json(results);
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    res.status(500).json({ message: error.message });
  }
});

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
      generatedBy: generatedBy || 'manual'
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
      budget,
      packingList
    } = req.body;
    
    if (title) trip.title = title;
    if (description !== undefined) trip.description = description;
    if (startDate) trip.startDate = startDate;
    if (endDate) trip.endDate = endDate;
    if (destination) trip.destination = destination;
    if (isPublic !== undefined) trip.isPublic = isPublic;
    if (budget) trip.budget = budget;
    if (packingList) trip.packingList = packingList;
    
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

// @route   PATCH /api/trips/:id/itinerary/activity
// @desc    Update a specific activity within a trip's itinerary
// @access  Private
router.patch('/:id/itinerary/activity', auth, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this trip' });
    }

    const dayIndex = Number(req.body.dayIndex);
    const activityIndex = Number(req.body.activityIndex);
    const updates = req.body.updates || {};

    if (Number.isNaN(dayIndex) || Number.isNaN(activityIndex)) {
      return res.status(400).json({ message: 'Valid dayIndex and activityIndex are required' });
    }

    if (!trip.itinerary || !Array.isArray(trip.itinerary) || !trip.itinerary[dayIndex]) {
      return res.status(404).json({ message: 'Itinerary day not found' });
    }

    const day = trip.itinerary[dayIndex];

    if (!day.activities || !Array.isArray(day.activities) || !day.activities[activityIndex]) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const activity = day.activities[activityIndex];
    const allowedFields = ['isFavorited', 'notes'];

    let modified = false;
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        if (field === 'isFavorited') {
          activity[field] = Boolean(updates[field]);
        } else if (field === 'notes') {
          activity[field] = typeof updates[field] === 'string' ? updates[field].trim() : '';
        }
        modified = true;
      }
    });

    if (!modified) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    trip.markModified('itinerary');
    const updatedTrip = await trip.save();

    res.json({ success: true, trip: updatedTrip });
  } catch (error) {
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
