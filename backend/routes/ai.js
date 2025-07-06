import express from 'express';
import axios from 'axios';
import { auth } from '../middleware/auth.js';
import Trip from '../models/Trip.js';

const router = express.Router();

// @route   POST /api/ai/trip-suggestions
// @desc    Get AI-generated trip suggestions
// @access  Private
router.post('/trip-suggestions', auth, async (req, res) => {
  try {
    const { tripId } = req.body;
    
    if (!tripId) {
      return res.status(400).json({ message: 'Please provide a tripId' });
    }
    
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if the trip belongs to the logged in user
    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this trip' });
    }
    
    // Calculate trip duration
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const tripDurationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Format the prompt for the AI
    const prompt = `Generate a detailed ${tripDurationInDays}-day travel itinerary for a trip to ${trip.destination.name}. 
    The trip is from ${new Date(trip.startDate).toLocaleDateString()} to ${new Date(trip.endDate).toLocaleDateString()}.
    Include recommended attractions, activities, restaurants, and any must-see places.
    Organize the suggestions by day, with 3-5 activities per day, including meal suggestions.
    For each activity, provide a brief description, approximate time needed, and estimated costs in Indian Rupees (INR).
    Please format all costs using the ₹ symbol (e.g., ₹500, ₹2,000).`;
    
    // Call Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.data.candidates || response.data.candidates.length === 0) {
      return res.status(500).json({ message: 'Failed to generate suggestions' });
    }
    
    const suggestion = response.data.candidates[0].content.parts[0].text;
    
    // Add suggestion to trip
    trip.aiSuggestions.push({
      content: suggestion,
      type: 'itinerary'
    });
    
    await trip.save();
    
    res.json({
      tripId,
      suggestions: suggestion,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/activity-recommendations
// @desc    Get AI-generated activity recommendations
// @access  Private
router.post('/activity-recommendations', auth, async (req, res) => {
  try {
    const { tripId, interests, dayIndex } = req.body;
    
    if (!tripId) {
      return res.status(400).json({ message: 'Please provide a tripId' });
    }
    
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Check if the trip belongs to the logged in user
    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this trip' });
    }
    
    // Format the prompt for the AI
    let prompt = `Recommend 5 interesting activities for a traveler visiting ${trip.destination.name}.`;
    
    if (interests && interests.length > 0) {
      prompt += ` The traveler is interested in ${interests.join(', ')}.`;
    }
    
    if (dayIndex !== undefined && trip.itinerary && trip.itinerary[dayIndex]) {
      const dayActivities = trip.itinerary[dayIndex].activities.map(a => a.title).join(', ');
      prompt += ` The traveler already has these activities planned for the day: ${dayActivities}.`;
      prompt += ` Suggest additional activities that would complement the existing plan.`;
    }
    
    prompt += ` For each activity, include a name, brief description, estimated time required, and best time of day to visit.`;
    
    // Call Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const suggestions = response.data.candidates[0].content.parts[0].text;
    
    // Add suggestion to trip
    trip.aiSuggestions.push({
      content: suggestions,
      type: 'activity'
    });
    
    await trip.save();
    
    res.json({
      tripId,
      suggestions,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/local-tips
// @desc    Get AI-generated local tips for a destination
// @access  Private
router.post('/local-tips', auth, async (req, res) => {
  try {
    const { destination } = req.body;
    
    if (!destination) {
      return res.status(400).json({ message: 'Please provide a destination' });
    }
    
    const prompt = `Provide 5-7 useful local tips for travelers visiting ${destination}. Include information about:
    1. Local customs and etiquette
    2. Transportation tips
    3. Safety advice
    4. Money-saving suggestions
    5. Best times to visit popular attractions
    6. Any local scams to be aware of
    7. Food and dining recommendations`;
    
    // Call Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const tips = response.data.candidates[0].content.parts[0].text;
    
    res.json({
      destination,
      tips,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
