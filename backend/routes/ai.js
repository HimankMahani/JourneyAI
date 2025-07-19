import express from 'express';
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

const formatDestinationName = (destination) => {
  if (typeof destination === 'string') return destination;
  if (typeof destination === 'object' && destination.name) return destination.name;
  return String(destination);
};

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
