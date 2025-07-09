import express from 'express';
import axios from 'axios';

const router = express.Router();

// @route   POST /api/ai/destination-info
// @desc    Get AI-generated destination information
// @access  Public
router.post('/destination-info', async (req, res) => {
  try {
    const { fromLocation, toDestination, days, travelers } = req.body;
    
    if (!toDestination) {
      return res.status(400).json({ message: 'Please provide a destination' });
    }
    
    // Create a simple budget estimation response
    // In a real implementation, this would call an AI service
    const response = {
      fromLocation: fromLocation || 'Unknown',
      toDestination: toDestination,
      days: days || 7,
      travelers: travelers || 1,
      itinerary: days || 7,
      costEstimates: {
        accommodation: calculateAccommodationCost(toDestination, days || 7, travelers || 1),
        food: calculateFoodCost(toDestination, days || 7, travelers || 1),
        activities: calculateActivitiesCost(toDestination, days || 7, travelers || 1),
        transportation: calculateTransportationCost(toDestination, days || 7, travelers || 1),
        total: 0
      },
      recommendations: [
        `Consider visiting ${toDestination} during the shoulder season for better prices and fewer crowds.`,
        `${toDestination} is known for its excellent public transportation, which can save you money on taxis.`,
        `Many museums in ${toDestination} offer free admission on certain days of the week.`
      ],
      localTips: [
        `Always greet locals with a polite hello in their language when entering shops in ${toDestination}.`,
        `Tipping customs in ${toDestination} may differ from what you're used to - research before you go.`,
        `Weather in ${toDestination} can change quickly, so pack layers regardless of the season.`
      ]
    };
    
    // Calculate the total
    response.costEstimates.total = 
      response.costEstimates.accommodation + 
      response.costEstimates.food + 
      response.costEstimates.activities + 
      response.costEstimates.transportation;
    
    res.json(response);
  } catch (error) {
    console.error('Error generating destination info:', error);
    res.status(500).json({ message: 'Failed to generate destination information' });
  }
});

// Helper functions for cost estimation
function calculateAccommodationCost(destination, days, travelers) {
  // Very basic estimation based on destination
  let baseCost = 100; // Default per night per person
  
  if (destination.toLowerCase().includes('tokyo') || 
      destination.toLowerCase().includes('paris') ||
      destination.toLowerCase().includes('new york')) {
    baseCost = 200;
  } else if (destination.toLowerCase().includes('bali') ||
             destination.toLowerCase().includes('thailand') ||
             destination.toLowerCase().includes('mexico')) {
    baseCost = 50;
  } else if (destination.toLowerCase().includes('korea') ||
             destination.toLowerCase().includes('japan')) {
    baseCost = 150;
  }
  
  return Math.round(baseCost * days * Math.ceil(travelers / 2)); // Assuming double occupancy
}

function calculateFoodCost(destination, days, travelers) {
  // Estimate food cost per person per day
  let dailyCost = 50; // Default
  
  if (destination.toLowerCase().includes('tokyo') || 
      destination.toLowerCase().includes('paris') ||
      destination.toLowerCase().includes('new york')) {
    dailyCost = 80;
  } else if (destination.toLowerCase().includes('bali') ||
             destination.toLowerCase().includes('thailand') ||
             destination.toLowerCase().includes('mexico')) {
    dailyCost = 30;
  } else if (destination.toLowerCase().includes('korea') ||
             destination.toLowerCase().includes('japan')) {
    dailyCost = 60;
  }
  
  return Math.round(dailyCost * days * travelers);
}

function calculateActivitiesCost(destination, days, travelers) {
  // Estimate activities cost per person per day
  let dailyCost = 40; // Default
  
  if (destination.toLowerCase().includes('tokyo') || 
      destination.toLowerCase().includes('paris') ||
      destination.toLowerCase().includes('new york')) {
    dailyCost = 70;
  } else if (destination.toLowerCase().includes('bali') ||
             destination.toLowerCase().includes('thailand') ||
             destination.toLowerCase().includes('mexico')) {
    dailyCost = 25;
  } else if (destination.toLowerCase().includes('korea') ||
             destination.toLowerCase().includes('japan')) {
    dailyCost = 50;
  }
  
  // Not every day will have paid activities
  const activeDays = Math.ceil(days * 0.7);
  return Math.round(dailyCost * activeDays * travelers);
}

function calculateTransportationCost(destination, days, travelers) {
  // Estimate local transportation cost
  let dailyCost = 20; // Default
  
  if (destination.toLowerCase().includes('tokyo') || 
      destination.toLowerCase().includes('paris') ||
      destination.toLowerCase().includes('new york')) {
    dailyCost = 30;
  } else if (destination.toLowerCase().includes('bali') ||
             destination.toLowerCase().includes('thailand') ||
             destination.toLowerCase().includes('mexico')) {
    dailyCost = 15;
  } else if (destination.toLowerCase().includes('korea') ||
             destination.toLowerCase().includes('japan')) {
    dailyCost = 25;
  }
  
  return Math.round(dailyCost * days * travelers);
}

// @route   POST /api/ai/estimate-enhanced-trip-costs
// @desc    Get enhanced AI-generated trip cost estimates with itinerary analysis
// @access  Public
router.post('/estimate-enhanced-trip-costs', async (req, res) => {
  try {
    const { fromLocation, toDestination, days = 7, travelers = 1, itinerary = null } = req.body;
    
    if (!toDestination) {
      return res.status(400).json({ message: 'Please provide a destination' });
    }
    
    // Enhanced cost estimation with itinerary analysis
    const response = {
      fromLocation: fromLocation || 'Unknown',
      toDestination: toDestination,
      days: days || 7,
      travelers: travelers || 1,
      itinerary: days || 7,
      breakdown: {
        flights: calculateFlightCost(fromLocation, toDestination, travelers),
        accommodation: calculateAccommodationCost(toDestination, days, travelers),
        food: calculateFoodCost(toDestination, days, travelers),
        activities: calculateActivitiesCost(toDestination, days, travelers),
        localTransport: calculateTransportationCost(toDestination, days, travelers),
        shopping: Math.round((calculateFoodCost(toDestination, days, travelers) * 0.3)),
        misc: Math.round((calculateFoodCost(toDestination, days, travelers) * 0.2))
      }
    };
    
    // Calculate the total
    response.total = 
      response.breakdown.flights + 
      response.breakdown.accommodation + 
      response.breakdown.food + 
      response.breakdown.activities + 
      response.breakdown.localTransport +
      response.breakdown.shopping +
      response.breakdown.misc;
    
    res.json(response);
  } catch (error) {
    console.error('Error estimating enhanced trip costs:', error);
    res.status(500).json({ message: 'Failed to estimate trip costs' });
  }
});

// Helper function for flight cost calculation
function calculateFlightCost(fromLocation, toDestination, travelers) {
  // Very basic flight cost estimation
  let baseCost = 500; // Default per person
  
  if ((fromLocation?.toLowerCase().includes('us') || fromLocation?.toLowerCase().includes('united states')) && 
      (toDestination?.toLowerCase().includes('asia') || 
       toDestination?.toLowerCase().includes('japan') || 
       toDestination?.toLowerCase().includes('korea'))) {
    baseCost = 1200;
  } else if ((fromLocation?.toLowerCase().includes('india')) && 
             (toDestination?.toLowerCase().includes('europe') || 
              toDestination?.toLowerCase().includes('paris') || 
              toDestination?.toLowerCase().includes('london'))) {
    baseCost = 800;
  } else if (toDestination?.toLowerCase().includes('japan') || 
             toDestination?.toLowerCase().includes('korea')) {
    baseCost = 700;
  }
  
  return Math.round(baseCost * travelers);
}

export default router;
