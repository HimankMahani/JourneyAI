import express from 'express';
import { generateContent } from '../services/ai.service.js';

const router = express.Router();

// @route   POST /api/ai/destination-info
// @desc    Get AI-generated destination information
// @access  Public
router.post('/destination-info', async (req, res) => {
  try {
    const { destination } = req.body;
    
    if (!destination) {
      return res.status(400).json({ message: 'Please provide a destination' });
    }
    
    const prompt = `Provide comprehensive travel information about ${destination} in the following JSON format:
    
    {
      "overview": "A brief overview of the destination (2-3 sentences)",
      "bestTimeToVisit": "Best times of year to visit with reasons",
      "topAttractions": ["Attraction 1", "Attraction 2", "Attraction 3", "Attraction 4", "Attraction 5"],
      "localCuisine": "Description of local dishes and food culture",
      "culturalTips": ["Tip 1", "Tip 2", "Tip 3"],
      "safetyAdvice": ["Safety tip 1", "Safety tip 2", "Safety tip 3"],
      "transportation": "Information about local transportation options",
      "estimatedDailyCosts": {
        "budget": {
          "accommodation": "Cost for budget accommodation",
          "food": "Cost for budget meals",
          "activities": "Cost for budget activities"
        },
        "midRange": {
          "accommodation": "Cost for mid-range accommodation",
          "food": "Cost for mid-range meals",
          "activities": "Cost for mid-range activities"
        },
        "luxury": {
          "accommodation": "Cost for luxury accommodation",
          "food": "Cost for fine dining",
          "activities": "Cost for premium activities"
        }
      }
    }
    
    Please provide accurate and up-to-date information.`;
    
    const aiResponse = await generateContent(prompt, {
      maxTokens: 2048,
      temperature: 0.7
    });
    
    // Try to parse the JSON response
    try {
      const destinationInfo = JSON.parse(aiResponse);
      res.json({
        success: true,
        destination,
        ...destinationInfo,
        lastUpdated: new Date().toISOString()
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // If parsing fails, return the raw response
      res.json({
        success: true,
        destination,
        content: aiResponse,
        note: 'The response could not be parsed as JSON. Showing raw AI response.',
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error generating destination info:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate destination information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/estimate-enhanced-trip-costs
// @desc    Get enhanced AI-generated trip cost estimates with itinerary analysis
// @access  Public
router.post('/estimate-enhanced-trip-costs', async (req, res) => {
  try {
    const { fromLocation, toDestination, days = 7, travelers = 1, itinerary = null } = req.body;
    
    if (!toDestination) {
      return res.status(400).json({ message: 'Please provide a destination' });
    }

    // Generate a prompt for the AI to estimate costs
    const prompt = `Estimate the total cost for a trip from ${fromLocation || 'an origin'} to ${toDestination} 
    for ${travelers} traveler(s) over ${days} days. 
    
    ${
      itinerary ? `Here's the planned itinerary: ${JSON.stringify(itinerary, null, 2)}` : ''
    }
    
    Provide the response in the following JSON format:
    {
      "fromLocation": "${fromLocation || 'Origin'}",
      "toDestination": "${toDestination}",
      "days": ${days},
      "travelers": ${travelers},
      "breakdown": {
        "flights": "Estimated flight cost",
        "accommodation": "Estimated accommodation cost",
        "food": "Estimated food cost",
        "activities": "Estimated activities cost",
        "localTransport": "Estimated local transportation cost",
        "shopping": "Estimated shopping expenses",
        "misc": "Miscellaneous expenses"
      },
      "total": "Total estimated cost",
      "currency": "USD",
      "notes": ["Any important notes about the cost estimation"]
    }`;
    
    const aiResponse = await generateContent(prompt, {
      maxTokens: 2048,
      temperature: 0.5
    });
    
    try {
      const costEstimate = JSON.parse(aiResponse);
      res.json({
        success: true,
        ...costEstimate,
        lastUpdated: new Date().toISOString()
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      res.json({
        success: true,
        content: aiResponse,
        note: 'The response could not be parsed as JSON. Showing raw AI response.',
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error estimating enhanced trip costs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to estimate trip costs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
