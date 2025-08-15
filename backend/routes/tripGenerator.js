import express from 'express';
import dotenv from 'dotenv';
import { auth } from '../middleware/auth.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import { generateTravelItinerary, generateLocalTips } from '../services/ai.service.js';
import { 
  storeAIResponse, 
  retrieveAIResponse, 
  listAIResponses,
  getStorageStats,
  cleanupOldAIResponses 
} from '../services/aiResponse.service.js';
import { 
  parseStoredAIResponse, 
  validateItinerary, 
  normalizeItinerary 
} from '../services/itineraryParser.service.js';
import { 
  searchPlacePhotos, 
  getCachedPlacePhoto,
  getDestinationImage
} from '../services/places.service.js';
import { notifyItineraryGeneration } from '../services/discord.service.js';

// Ensure environment variables are loaded
dotenv.config();

const router = express.Router();

/**
 * Parse travelers count from various input formats
 * @param {string|number} travelers - Travelers input (e.g., "3-4", "5+", 2)
 * @returns {number} - Numeric travelers count
 */
function parseTravelersCount(travelers) {
  if (typeof travelers === 'number') {
    return Math.max(1, travelers);
  }
  
  if (typeof travelers === 'string') {
    // Handle "3-4" format - take the first number
    if (travelers.includes('-')) {
      const firstNumber = parseInt(travelers.split('-')[0], 10);
      return isNaN(firstNumber) ? 1 : Math.max(1, firstNumber);
    }
    
    // Handle "5+" format - take the number
    if (travelers.includes('+')) {
      const number = parseInt(travelers.replace('+', ''), 10);
      return isNaN(number) ? 1 : Math.max(1, number);
    }
    
    // Handle plain number string
    const number = parseInt(travelers, 10);
    return isNaN(number) ? 1 : Math.max(1, number);
  }
  
  return 1; // Default fallback
}

/**
 * Dynamic budget calculation based on destination, duration, and budget level
 * @param {string} budgetLevel - Economy, Budget, Mid-range, or Luxury
 * @param {string} destination - The trip destination
 * @param {string} startDate - Trip start date
 * @param {string} endDate - Trip end date
 * @param {number} travelers - Number of travelers (default: 1)
 * @returns {number} - Calculated budget amount
 */
function getBudgetAmount(budgetLevel, destination = '', startDate = null, endDate = null, travelers = 1) {
  // If it's already a number, return it
  if (typeof budgetLevel === 'number') {
    return budgetLevel;
  }
  
  // Base daily rates by budget level (per person in INR)
  const dailyRatesByLevel = {
    'economy': 3000,    // Lowered from 5000
    'budget': 5000,     // Lowered from 8000
    'mid-range': 8000,  // Lowered from 12000
    'luxury': 15000    // Lowered from 25000
  };
  
  // Destination cost factors (relative to 1.0 baseline)
  const destinationFactors = {
    'tokyo': 1.4,
    'hong kong': 1.3,
    'paris': 1.25,
    'london': 1.3,
    'new york': 1.4,
    'dubai': 1.2,
    'bangkok': 0.7,
    'bali': 0.6,
    'goa': 0.7,
    'mumbai': 0.9,
    'delhi': 0.85,
    'singapore': 1.15,
    'barcelona': 1.0
    // Default factor of 1.0 applied for unlisted destinations
  };
  
  // Calculate trip duration
  let tripDuration = 5; // Default duration if dates not provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    tripDuration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }
  
  // Get budget level (default to mid-range)
  const level = (budgetLevel || 'mid-range').toLowerCase();
  const dailyRate = dailyRatesByLevel[level] || dailyRatesByLevel['mid-range'];
  
  // Get destination factor
  let destinationFactor = 1.0; // Default factor
  const lowerDestination = destination.toLowerCase();
  for (const [key, factor] of Object.entries(destinationFactors)) {
    if (lowerDestination.includes(key)) {
      destinationFactor = factor;
      break;
    }
  }
  
  // Calculate travelers (ensure at least 1)
  const numTravelers = parseTravelersCount(travelers);
  
  // Calculate total budget
  const totalBudget = Math.round(dailyRate * tripDuration * numTravelers * destinationFactor);
  
  return totalBudget;
}

/**
 * @route   POST /api/generator/itinerary
 * @desc    Generate a new trip itinerary using Gemini API
 * @access  Private
 */
router.post('/itinerary', auth, async (req, res) => {
  try {
    const { 
      from,
      destination, 
      startDate, 
      endDate, 
      interests = [], 
      budget = 'mid-range',
      travelers = 1,
      title 
    } = req.body;

    // Validate required fields
    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: destination, startDate, and endDate are required' 
      });
    }

    // Fetch user information including location
    const user = await User.findById(req.userId);
    const userLocation = user?.location || null;

    // Use 'from' from request if provided, else fallback to userLocation
    let fromLocation = from || userLocation;
    
    // If fromLocation is a string, convert it to the expected object format
    if (typeof fromLocation === 'string') {
      const locationParts = fromLocation.split(',').map(part => part.trim());
      fromLocation = {
        city: locationParts[0] || 'Unknown',
        country: locationParts[locationParts.length - 1] || 'Unknown',
        full: fromLocation
      };
    } else if (!fromLocation) {
      // If still no location, use a default
      fromLocation = {
        city: 'Unknown',
        country: 'Unknown',
        full: 'Unknown'
      };
    }

    // Step 1: Generate travel itinerary using Gemini API with fromLocation
    let generatedItinerary;
    let generatedLocalTips;
    
    try {
      generatedItinerary = await generateTravelItinerary({
        from: fromLocation,
        destination,
        startDate,
        endDate,
        interests,
        budget,
        travelers
      }, fromLocation);
      
      // Step 2: Generate local tips
      generatedLocalTips = await generateLocalTips(destination);
    } catch (error) {
      console.error('Error using Gemini API:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate content using AI service',
        error: error.message
      });
    }

    // Step 3: Create a new trip with the generated itinerary
    const tripTitle = title || `Trip from ${fromLocation ? (fromLocation.full || fromLocation.city || fromLocation) : 'Unknown'} to ${destination}`;
    
    const budgetAmount = getBudgetAmount(budget, destination, startDate, endDate, travelers);
    
    const newTrip = new Trip({
      title: tripTitle,
      description: `AI-generated itinerary for a trip from ${fromLocation ? (fromLocation.full || fromLocation.city || fromLocation) : 'Unknown'} to ${destination}`,
      user: req.userId,
      userEmail: req.user?.email || req.userEmail, // Add userEmail for easier querying
      startDate,
      endDate,
      destination: { name: destination },
      from: fromLocation,
      budget: { 
        amount: budgetAmount,
        currency: 'INR'
      },
      travelers: parseTravelersCount(travelers), // Parse travelers properly
      aiSuggestions: [
        {
          content: generatedItinerary,
          type: 'itinerary'
        },
        {
          content: generatedLocalTips,
          type: 'safety'
        }
      ]
    });

    // Save the trip first to get the ID
    const savedTrip = await newTrip.save();
    const tripId = savedTrip._id.toString();


    // Step 4: Store the AI response in MongoDB
    try {
      const itineraryResponse = await storeAIResponse(
        tripId, 
        req.userId,
        generatedItinerary, 
        'itinerary', 
        {
          from: fromLocation,
          destination,
          startDate,
          endDate,
          interests,
          budget,
          travelers,
          userLocation: fromLocation,
          prompt: 'AI-generated travel itinerary'
        }
      );
      
      const tipsResponse = await storeAIResponse(
        tripId, 
        req.userId,
        generatedLocalTips, 
        'tips', 
        {
          destination,
          prompt: 'AI-generated local tips',
          userLocation: fromLocation
        }
      );
      
    } catch (storageError) {
      console.error('Failed to store AI responses:', storageError);
      // Continue with trip creation even if storage fails
    }

    // Parse the itinerary from MongoDB storage
    let parsedItinerary = [];
    try {
      const storedItinerary = await retrieveAIResponse(tripId, 'itinerary');
      
      if (storedItinerary) {
        
        parsedItinerary = parseStoredAIResponse(storedItinerary, startDate);
        
        if (parsedItinerary && parsedItinerary.length > 0) {
          // Validate the parsed itinerary
          const validation = validateItinerary(parsedItinerary);
          if (validation.isValid) {
            savedTrip.itinerary = parsedItinerary;
          } else {
            console.warn('Itinerary validation failed:', validation.errors);
            // Normalize the itinerary to fix issues
            const normalizedItinerary = normalizeItinerary(parsedItinerary, startDate);
            savedTrip.itinerary = normalizedItinerary;
          }
        } else {
        }
      } else {
        console.warn('Could not retrieve stored AI response for parsing');
      }
    } catch (parseError) {
      console.error("Error parsing itinerary from stored document:", parseError.message);
      console.error("Full parse error:", parseError);
    }

    // Save the updated trip with parsed itinerary
    const finalTrip = await savedTrip.save();

    // Send Discord notification for itinerary generation
    try {
      await notifyItineraryGeneration({
        destination,
        startDate,
        endDate,
        travelers,
        budget,
        userEmail: req.user?.email || req.userEmail,
        from: fromLocation,
        interests
      });
    } catch (discordError) {
      console.error('Failed to send Discord notification:', discordError);
      // Don't fail the request if Discord notification fails
    }

    // Ensure the response always includes the itinerary (even if empty)
    const responseData = {
      success: true,
      message: 'Trip itinerary generated successfully',
      trip: finalTrip.toObject()
    };

    // Only send the response after parsing and saving the itinerary
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Trip generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate trip itinerary',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/generator/update-itinerary/:id
 * @desc    Update an existing trip with a new AI-generated itinerary
 * @access  Private
 */
router.post('/update-itinerary/:id', auth, async (req, res) => {
  try {
    const tripId = req.params.id;
    const { interests = [] } = req.body;
    
    // Find the trip
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Ensure the user owns this trip
    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this trip' });
    }

    // Generate new itinerary using the trip's existing data plus new interests
    const existingBudget = trip.budget?.amount || 'mid-range';
    
    // Convert budget back to string if it's a number (for the AI prompt)
    let budgetForAI = existingBudget;
    if (typeof existingBudget === 'number') {
      // Reverse lookup to get budget level from amount
      const budgetMap = {
        5000: 'economy',
        8000: 'budget', 
        12000: 'mid-range',
        25000: 'luxury'
      };
      budgetForAI = budgetMap[existingBudget] || 'mid-range';
    }
    
    const generatedItinerary = await generateTravelItinerary({
      destination: trip.destination.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      interests,
      budget: budgetForAI,
      travelers: trip.travelers || 1 // Use existing travelers count or default to 1
    });

    // Store the new AI response in MongoDB
    try {
      const aiResponse = await storeAIResponse(
        tripId, 
        req.userId,
        generatedItinerary, 
        'itinerary', 
        {
          destination: trip.destination.name,
          startDate: trip.startDate,
          endDate: trip.endDate,
          interests,
          budget: budgetForAI,
          prompt: 'AI-regenerated travel itinerary',
          regenerated: true
        }
      );
      
      
      // Clean up old responses (keep only latest 3)
      await cleanupOldAIResponses(tripId, 'itinerary', 3);
    } catch (storageError) {
      console.error('Failed to store regenerated AI response:', storageError);
      // Continue with regeneration even if storage fails
    }

    // Add the new suggestion to the trip
    trip.aiSuggestions.push({
      content: generatedItinerary,
      type: 'itinerary'
    });

    // Parse the itinerary from the stored file
    try {
      const storedItinerary = await retrieveAIResponse(tripId, 'itinerary');
      
      if (storedItinerary) {
        
        const parsedItinerary = parseStoredAIResponse(storedItinerary, trip.startDate);
        
        if (parsedItinerary && parsedItinerary.length > 0) {
          
          // Validate and normalize the parsed itinerary
          const validation = validateItinerary(parsedItinerary);
          if (validation.isValid) {
            trip.itinerary = parsedItinerary;
          } else {
            console.warn('Regenerated itinerary validation failed:', validation.errors);
            const normalizedItinerary = normalizeItinerary(parsedItinerary, trip.startDate);
            trip.itinerary = normalizedItinerary;
          }
        } else {
        }
      } else {
        console.warn('Could not retrieve stored AI response for regeneration parsing');
      }
    } catch (parseError) {
      console.error("Error parsing regenerated itinerary from stored file:", parseError);
    }

    // Save the updated trip
    const updatedTrip = await trip.save();
    
    res.json({
      success: true,
      message: 'Trip itinerary updated successfully',
      trip: updatedTrip
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update trip itinerary',
      error: error.message 
    });
  }
});



/**
 * @route   POST /api/generator/reparse-itinerary/:id
 * @desc    Reparse an existing trip's itinerary from stored AI response in MongoDB
 * @access  Private
 */
router.post('/reparse-itinerary/:id', auth, async (req, res) => {
  try {
    const tripId = req.params.id;
    
    // Find the trip
    const trip = await Trip.findById(tripId);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    // Ensure the user owns this trip
    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this trip' });
    }

    // Retrieve the stored AI response
    const storedItinerary = await retrieveAIResponse(tripId, 'itinerary');
    
    if (!storedItinerary) {
      return res.status(404).json({
        success: false,
        message: 'No stored AI response found for this trip'
      });
    }
    
    // Parse the itinerary from the stored MongoDB document
    try {
      
      const parsedItinerary = parseStoredAIResponse(storedItinerary, trip.startDate);
      
      if (parsedItinerary && parsedItinerary.length > 0) {
        
        // Validate and normalize the parsed itinerary
        const validation = validateItinerary(parsedItinerary);
        if (validation.isValid) {
          trip.itinerary = parsedItinerary;
        } else {
          console.warn('Reparsed itinerary validation failed:', validation.errors);
          const normalizedItinerary = normalizeItinerary(parsedItinerary, trip.startDate);
          trip.itinerary = normalizedItinerary;
        }
        
        // Save the updated trip
        const updatedTrip = await trip.save();
        
        res.json({
          success: true,
          message: 'Trip itinerary reparsed successfully',
          trip: updatedTrip,
          validationErrors: validation.isValid ? [] : validation.errors
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to parse stored AI response'
        });
      }
    } catch (parseError) {
      console.error("Error reparsing itinerary from stored document:", parseError);
      res.status(500).json({
        success: false,
        message: 'Failed to reparse itinerary',
        error: parseError.message
      });
    }
  } catch (error) {
    console.error('Reparse itinerary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reparse trip itinerary',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/generator/storage-stats
 * @desc    Get MongoDB storage statistics
 * @access  Private
 */
router.get('/storage-stats', auth, async (req, res) => {
  try {
    const stats = await getStorageStats();
    res.json({
      success: true,
      message: 'Storage statistics retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Error getting storage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get storage statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/generator/ai-responses/:tripId
 * @desc    List AI response records for a specific trip
 * @access  Private
 */
router.get('/ai-responses/:tripId', auth, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { type } = req.query; // Optional filter by type
    
    // Verify trip exists and user owns it
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this trip' });
    }
    
    const responses = await listAIResponses(tripId, type);
    
    res.json({
      success: true,
      message: 'AI response records retrieved successfully',
      tripId,
      responses,
      count: responses.length
    });
  } catch (error) {
    console.error('Error listing AI responses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list AI response records',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/generator/ai-response/:tripId/:type
 * @desc    Get the latest AI response for a trip
 * @access  Private
 */
router.get('/ai-response/:tripId/:type', auth, async (req, res) => {
  try {
    const { tripId, type } = req.params;
    
    // Verify trip exists and user owns it
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    if (trip.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this trip' });
    }
    
    const storedResponse = await retrieveAIResponse(tripId, type);
    
    if (!storedResponse) {
      return res.status(404).json({
        success: false,
        message: `No AI response found for trip ${tripId} type ${type}`
      });
    }
    
    res.json({
      success: true,
      message: 'AI response retrieved successfully',
      data: storedResponse
    });
  } catch (error) {
    console.error('Error retrieving AI response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve AI response',
      error: error.message
    });
  }
});









/**
 * @route   GET /api/generator/place-photo/:placeName
 * @desc    Get place photo using Google Places API
 * @access  Private
 */
router.get('/place-photo/:placeName', auth, async (req, res) => {
  try {
    const { placeName } = req.params;
    
    if (!placeName) {
      return res.status(400).json({
        success: false,
        message: 'Place name is required'
      });
    }

    
    const photoUrl = await getCachedPlacePhoto(placeName);
    
    res.json({
      success: true,
      placeName: placeName,
      photoUrl: photoUrl
    });

  } catch (error) {
    console.error('Error fetching place photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch place photo',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/generator/place-photos
 * @desc    Get photos for multiple places
 * @access  Private
 */
router.post('/place-photos', auth, async (req, res) => {
  try {
    const { places } = req.body;
    
    if (!places || !Array.isArray(places)) {
      return res.status(400).json({
        success: false,
        message: 'Places array is required'
      });
    }

    
    const photoPromises = places.map(async (place) => {
      const photoUrl = await getCachedPlacePhoto(place);
      return {
        placeName: place,
        photoUrl: photoUrl
      };
    });

    const photos = await Promise.all(photoPromises);
    
    res.json({
      success: true,
      photos: photos
    });

  } catch (error) {
    console.error('Error fetching place photos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch place photos',
      error: error.message
    });
  }
});





export default router;
