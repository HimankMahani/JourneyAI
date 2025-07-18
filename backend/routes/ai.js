import express from 'express';
import { auth } from '../middleware/auth.js';
import Trip from '../models/Trip.js';
import { generateContent } from '../services/ai.service.js';

const router = express.Router();

// Helper function to call Gemini API through the service layer
const callGeminiAPI = async (prompt, maxOutputTokens = 1024, temperature = 0.7) => {
  return await generateContent(prompt, {
    maxTokens: maxOutputTokens,
    temperature
  });
};

const parseJsonFromText = (text, fallback) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return fallback;
  } catch {
    return fallback;
  }
};

const validateTripAccess = async (tripId, userId) => {
  if (!tripId) {
    throw new Error('Please provide a tripId');
  }
  
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }
  
  if (trip.user.toString() !== userId.toString()) {
    throw new Error('Not authorized to access this trip');
  }
  
  return trip;
};

const calculateTripDuration = (startDate, endDate) => {
  return Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
};

const formatDestinationName = (destination) => {
  if (typeof destination === 'string') return destination;
  if (typeof destination === 'object' && destination.name) return destination.name;
  return String(destination);
};

// @route   POST /api/ai/trip-suggestions
// @desc    Get AI-generated trip suggestions
// @access  Private
router.post('/trip-suggestions', auth, async (req, res) => {
  try {
    const trip = await validateTripAccess(req.body.tripId, req.userId);
    const tripDurationInDays = calculateTripDuration(trip.startDate, trip.endDate);
    
    const prompt = `Generate a detailed ${tripDurationInDays}-day travel itinerary for a trip to ${trip.destination.name}. 
    The trip is from ${new Date(trip.startDate).toLocaleDateString()} to ${new Date(trip.endDate).toLocaleDateString()}.
    Include recommended attractions, activities, restaurants, and any must-see places.
    Organize the suggestions by day, with 3-5 activities per day, including meal suggestions.
    For each activity, provide a brief description, approximate time needed, and estimated costs in Indian Rupees (INR).
    Please format all costs using the ₹ symbol (e.g., ₹500, ₹2,000).`;
    
    const suggestion = await callGeminiAPI(prompt, 2048);
    
    trip.aiSuggestions.push({
      content: suggestion,
      type: 'itinerary'
    });
    await trip.save();
    
    res.json({
      tripId: req.body.tripId,
      suggestions: suggestion,
      timestamp: new Date()
    });
  } catch (error) {
    const statusCode = error.message.includes('provide a tripId') ? 400 :
                      error.message.includes('not found') ? 404 :
                      error.message.includes('Not authorized') ? 403 : 500;
    res.status(statusCode).json({ message: error.message });
  }
});

// @route   POST /api/ai/activity-recommendations
// @desc    Get AI-generated activity recommendations
// @access  Private
router.post('/activity-recommendations', auth, async (req, res) => {
  try {
    const { tripId, interests, dayIndex } = req.body;
    const trip = await validateTripAccess(tripId, req.userId);
    
    let prompt = `Recommend 5 interesting activities for a traveler visiting ${trip.destination.name}.`;
    
    if (interests?.length > 0) {
      prompt += ` The traveler is interested in ${interests.join(', ')}.`;
    }
    
    if (dayIndex !== undefined && trip.itinerary?.[dayIndex]) {
      const dayActivities = trip.itinerary[dayIndex].activities.map(a => a.title).join(', ');
      prompt += ` The traveler already has these activities planned for the day: ${dayActivities}.`;
      prompt += ` Suggest additional activities that would complement the existing plan.`;
    }
    
    prompt += ` For each activity, include a name, brief description, estimated time required, and best time of day to visit.`;
    
    const suggestions = await callGeminiAPI(prompt);
    
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
    const statusCode = error.message.includes('provide a tripId') ? 400 :
                      error.message.includes('not found') ? 404 :
                      error.message.includes('Not authorized') ? 403 : 500;
    res.status(statusCode).json({ message: error.message });
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
    
    const tips = await callGeminiAPI(prompt);
    
    res.json({
      destination,
      tips,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/estimate-flight-cost
// @desc    Get AI-powered flight cost estimation
// @access  Private
router.post('/estimate-flight-cost', auth, async (req, res) => {
  try {
    const { fromLocation, toDestination, travelers = 1 } = req.body;
    
    if (!fromLocation || !toDestination) {
      return res.status(400).json({ message: 'Please provide both fromLocation and toDestination' });
    }
    
    const { estimateFlightCost } = await import('../services/ai.service.js');
    const costEstimate = await estimateFlightCost(fromLocation, toDestination, travelers);
    
    res.json({
      fromLocation,
      toDestination,
      travelers,
      ...costEstimate,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Flight cost estimation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/estimate-food-cost
// @desc    Get AI-powered food cost estimation
// @access  Private
router.post('/estimate-food-cost', auth, async (req, res) => {
  try {
    const { destination, days = 1, travelers = 1 } = req.body;
    
    if (!destination) {
      return res.status(400).json({ message: 'Please provide destination' });
    }
    
    const { estimateFoodCost } = await import('../services/ai.service.js');
    const costEstimate = await estimateFoodCost(destination, days, travelers);
    
    res.json({
      destination,
      days,
      travelers,
      ...costEstimate,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Food cost estimation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/estimate-trip-costs
// @desc    Get comprehensive AI-powered trip cost estimation
// @access  Private
router.post('/estimate-trip-costs', auth, async (req, res) => {
  try {
    const { fromLocation, toDestination, days = 1, travelers = 1 } = req.body;
    
    if (!fromLocation || !toDestination) {
      return res.status(400).json({ message: 'Please provide both fromLocation and toDestination' });
    }
    
    const { estimateComprehensiveTripCosts } = await import('../services/ai.service.js');
    const costEstimate = await estimateComprehensiveTripCosts(fromLocation, toDestination, days, travelers);
    
    res.json({
      fromLocation,
      toDestination,
      days,
      travelers,
      ...costEstimate,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Trip cost estimation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/estimate-enhanced-trip-costs
// @desc    Get AI-generated cost estimates with itinerary details
// @access  Public
router.post('/estimate-enhanced-trip-costs', async (req, res) => {
  try {
    const { fromLocation, toDestination, days, travelers, itinerary } = req.body;
    
    if (!fromLocation || !toDestination) {
      return res.status(400).json({ message: 'Please provide both origin and destination locations' });
    }
    
    const numDays = parseInt(days) || 5;
    const numTravelers = parseInt(travelers) || 1;
    
    // Format itinerary text if provided
    let itineraryText = '';
    if (itinerary?.length > 0) {
      itineraryText = 'Based on the following itinerary:\n\n';
      itinerary.forEach((day, idx) => {
        itineraryText += `Day ${idx + 1}:\n`;
        day.activities?.forEach(activity => {
          const title = activity.activity || activity.title || 'Activity';
          const type = activity.type || '';
          itineraryText += `- ${title} (${type})\n`;
        });
        itineraryText += '\n';
      });
    }
    
    const prompt = `
    ${itineraryText}
    Please provide a detailed cost estimate for a trip from ${fromLocation} to ${toDestination} for ${numTravelers} traveler(s) over ${numDays} days.
    
    Return the response as a JSON object with:
    1. totalEstimate: The total estimated cost in INR (₹)
    2. breakdown: A breakdown of costs by category:
       - flights: Round-trip flight costs
       - accommodation: Hotel or lodging costs for the entire stay
       - food: Total food costs for all meals
       - localTransport: Costs for local transportation (taxis, buses, trains)
       - activities: Costs for attractions, tours, and activities
       - shopping: Estimated shopping expenses
       - misc: Other miscellaneous expenses
    
    Format the output as valid JSON like this:
    {
      "totalEstimate": 150000,
      "breakdown": {
        "flights": 60000,
        "accommodation": 40000,
        "food": 20000,
        "localTransport": 10000,
        "activities": 15000,
        "shopping": 5000,
        "misc": 2000
      },
      "currency": "INR"
    }
    `;
    
    const aiText = await callGeminiAPI(prompt);
    
    const defaultEstimate = {
      totalEstimate: 150000,
      breakdown: {
        flights: 60000,
        accommodation: 40000,
        food: 20000,
        localTransport: 10000,
        activities: 15000,
        shopping: 5000,
        misc: 2000
      },
      currency: "INR",
      note: "Default estimate. AI could not generate a specific estimate."
    };
    
    const result = parseJsonFromText(aiText, defaultEstimate);
    res.json(result);
  } catch (error) {
    console.error('Error in cost estimation endpoint:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/destination-info
// @desc    Get AI-generated destination information
// @access  Public
router.post('/destination-info', async (req, res) => {
  try {
    const { destination } = req.body;
    
    if (!destination) {
      return res.status(400).json({ message: 'Please provide a destination' });
    }
    
    const destinationName = formatDestinationName(destination);
    
    const prompt = `
    Please provide the following information about ${destinationName} as a travel destination:
    1. A brief description of the cultural aspects and interesting facts (2-3 sentences)
    2. Three practical local tips for travelers visiting this destination
    3. A list of three must-visit attractions or experiences
    
    Format the response as JSON with these fields:
    {
      "culturalInfo": "Cultural information here...",
      "localTips": "Local tips here...",
      "mustVisit": ["Attraction 1", "Attraction 2", "Attraction 3"]
    }
    `;
    
    const aiText = await callGeminiAPI(prompt);
    
    const defaultResponse = {
      culturalInfo: `${destinationName} is a fascinating travel destination with rich history and culture.`,
      localTips: `When visiting ${destinationName}, be sure to try the local cuisine, respect local customs, and check weather conditions before your trip.`,
      mustVisit: [`${destinationName} Old Town`, `${destinationName} Museum`, `${destinationName} Gardens`]
    };
    
    const result = parseJsonFromText(aiText, defaultResponse);
    res.json(result);
  } catch (error) {
    console.error('Error in destination-info endpoint:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
