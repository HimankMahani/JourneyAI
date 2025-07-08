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
  getDestinationImage,
  clearPhotoCache 
} from '../services/places.service.js';

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
    'economy': 5000,
    'budget': 8000,
    'mid-range': 12000,
    'luxury': 25000
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
  
  console.log('Dynamic budget calculation:', { 
    level, 
    destination,
    destinationFactor,
    tripDuration,
    travelers: numTravelers,
    dailyRate,
    totalBudget
  });
  
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

    // Step 1: Generate travel itinerary using Gemini API with user location
    let generatedItinerary;
    let generatedLocalTips;
    
    try {
      console.log('Generating itinerary for destination:', destination);
      if (userLocation?.full) {
        console.log('Including user location in generation:', userLocation.full);
      }
      
      generatedItinerary = await generateTravelItinerary({
        destination,
        startDate,
        endDate,
        interests,
        budget,
        travelers
      }, userLocation);
      console.log('Itinerary generated successfully');
      
      // Step 2: Generate local tips
      console.log('Generating local tips for destination:', destination);
      generatedLocalTips = await generateLocalTips(destination);
      console.log('Local tips generated successfully');
    } catch (error) {
      console.error('Error using Gemini API:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate content using AI service',
        error: error.message
      });
    }

    // Step 3: Create a new trip with the generated itinerary
    const tripTitle = title || `Trip to ${destination}`;
    
    // Debug logging for travelers
    console.log('Trip generation - travelers data:', {
      originalTravelers: travelers,
      type: typeof travelers,
      parsed: parseInt(travelers, 10) || 1
    });
    
    const budgetAmount = getBudgetAmount(budget, destination, startDate, endDate, travelers);
    
    const newTrip = new Trip({
      title: tripTitle,
      description: `AI-generated itinerary for a trip to ${destination}`,
      user: req.userId,
      userEmail: req.user?.email || req.userEmail, // Add userEmail for easier querying
      startDate,
      endDate,
      destination: { name: destination },
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

    console.log('Created trip with ID:', tripId);

    // Step 4: Store the AI response in MongoDB
    try {
      const itineraryResponse = await storeAIResponse(
        tripId, 
        req.userId,
        generatedItinerary, 
        'itinerary', 
        {
          destination,
          startDate,
          endDate,
          interests,
          budget,
          travelers,
          userLocation,
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
          prompt: 'AI-generated local tips'
        }
      );
      
      console.log('Stored AI responses:', { 
        itineraryId: itineraryResponse._id, 
        tipsId: tipsResponse._id 
      });
    } catch (storageError) {
      console.error('Failed to store AI responses:', storageError);
      // Continue with trip creation even if storage fails
    }

    // Parse the itinerary from MongoDB storage
    try {
      const storedItinerary = await retrieveAIResponse(tripId, 'itinerary');
      
      if (storedItinerary) {
        console.log('Retrieved stored AI response for parsing');
        
        const parsedItinerary = parseStoredAIResponse(storedItinerary, startDate);
        
        if (parsedItinerary && parsedItinerary.length > 0) {
          console.log('Successfully parsed itinerary with', parsedItinerary.length, 'days');
          
          // Validate the parsed itinerary
          const validation = validateItinerary(parsedItinerary);
          if (validation.isValid) {
            savedTrip.itinerary = parsedItinerary;
          } else {
            console.warn('Itinerary validation failed:', validation.errors);
            // Normalize the itinerary to fix issues
            const normalizedItinerary = normalizeItinerary(parsedItinerary, startDate);
            savedTrip.itinerary = normalizedItinerary;
            console.log('Applied normalization to fix itinerary issues');
          }
        } else {
          console.log('parseStoredAIResponse returned empty or null result');
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

    console.log('Final trip structure:', {
      _id: finalTrip._id,
      title: finalTrip.title,
      destination: finalTrip.destination,
      budget: finalTrip.budget,
      itineraryDays: finalTrip.itinerary ? finalTrip.itinerary.length : 0
    });

    const responseData = {
      success: true,
      message: 'Trip itinerary generated successfully',
      trip: finalTrip.toObject()
    };

    console.log('Sending response:', {
      success: responseData.success,
      message: responseData.message,
      tripId: responseData.trip._id,
      tripExists: !!responseData.trip
    });

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
      
      console.log('Stored regenerated AI response:', aiResponse._id);
      
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
        console.log('Retrieved stored AI response for regeneration parsing');
        
        const parsedItinerary = parseStoredAIResponse(storedItinerary, trip.startDate);
        
        if (parsedItinerary && parsedItinerary.length > 0) {
          console.log('Successfully parsed regenerated itinerary with', parsedItinerary.length, 'days');
          
          // Validate and normalize the parsed itinerary
          const validation = validateItinerary(parsedItinerary);
          if (validation.isValid) {
            trip.itinerary = parsedItinerary;
          } else {
            console.warn('Regenerated itinerary validation failed:', validation.errors);
            const normalizedItinerary = normalizeItinerary(parsedItinerary, trip.startDate);
            trip.itinerary = normalizedItinerary;
            console.log('Applied normalization to fix regenerated itinerary issues');
          }
        } else {
          console.log('parseStoredAIResponse returned empty result for regeneration');
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
 * @route   GET /api/generator/debug
 * @desc    Debug endpoint to verify API key and configuration
 * @access  Private
 */
router.get('/debug', auth, (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  res.json({
    hasGeminiKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyPreview: apiKey ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}` : null,
    envVars: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY') && !key.includes('PASSWORD')),
    message: apiKey ? 'Gemini API key is configured' : 'Gemini API key is missing'
  });
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
      console.log('Reparsing itinerary from stored MongoDB document for trip:', tripId);
      
      const parsedItinerary = parseStoredAIResponse(storedItinerary, trip.startDate);
      
      if (parsedItinerary && parsedItinerary.length > 0) {
        console.log('Successfully reparsed itinerary with', parsedItinerary.length, 'days');
        
        // Validate and normalize the parsed itinerary
        const validation = validateItinerary(parsedItinerary);
        if (validation.isValid) {
          trip.itinerary = parsedItinerary;
        } else {
          console.warn('Reparsed itinerary validation failed:', validation.errors);
          const normalizedItinerary = normalizeItinerary(parsedItinerary, trip.startDate);
          trip.itinerary = normalizedItinerary;
          console.log('Applied normalization to fix reparsed itinerary issues');
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

// Health check endpoint (no auth required)
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Trip Generator API is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to get trips for a specific user by email (temporary for testing)
router.get('/test-user-trips/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('Fetching trips for user:', email);
    
    const trips = await Trip.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    console.log('Found trips:', trips.length);
    res.json({
      success: true,
      userEmail: email,
      tripsCount: trips.length,
      trips
    });
  } catch (error) {
    console.error('Error fetching user trips:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Test endpoint to get all trips (temporary for testing)
router.get('/test-all-trips', async (req, res) => {
  try {
    console.log('Fetching all trips from database');
    
    const trips = await Trip.find({})
      .sort({ createdAt: -1 })
      .lean(); // Use lean() to get plain objects
    
    console.log('Found total trips:', trips.length);
    
    // Basic trip summary without detailed processing
    const tripSummary = trips.map(trip => ({
      _id: trip._id,
      destination: trip.destination?.name || trip.destination,
      userEmail: trip.userEmail,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: typeof trip.budget === 'object' ? trip.budget.amount : trip.budget,
      hasItinerary: !!(trip.itinerary && trip.itinerary.length > 0),
      createdAt: trip.createdAt
    }));
    
    res.json({
      success: true,
      totalTrips: trips.length,
      tripSummary
    });
  } catch (error) {
    console.error('Error fetching all trips:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
});

// Test endpoint to update trips with userEmail (temporary for testing)
router.post('/update-test-trips', async (req, res) => {
  try {
    console.log('Updating trips with test userEmail...');
    
    // Find trips with valid itineraries but no userEmail
    const tripsToUpdate = await Trip.find({ 
      'itinerary.0': { $exists: true },
      userEmail: { $exists: false }
    }).limit(3);

    console.log(`Found ${tripsToUpdate.length} trips to update`);
    
    const updatedTrips = [];
    for (const trip of tripsToUpdate) {
      const updated = await Trip.findByIdAndUpdate(
        trip._id, 
        { userEmail: 'websitetest@example.com' },
        { new: true }
      );
      updatedTrips.push({
        id: updated._id,
        destination: updated.destination?.name || updated.destination,
        userEmail: updated.userEmail
      });
    }
    
    res.json({
      success: true,
      message: `Updated ${updatedTrips.length} trips`,
      updatedTrips
    });
  } catch (error) {
    console.error('Error updating trips:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Test endpoint to get trips for frontend testing (temporary)
router.get('/test-frontend-trips/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('Fetching trips for frontend test:', email);
    
    const trips = await Trip.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    console.log('Found trips for frontend:', trips.length);
    
    // Format trips for frontend consumption
    const formattedTrips = trips.map(trip => ({
      _id: trip._id,
      title: trip.title,
      description: trip.description,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
      itinerary: trip.itinerary,
      userEmail: trip.userEmail,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt
    }));
    
    res.json(formattedTrips);
  } catch (error) {
    console.error('Error fetching trips for frontend:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Test endpoint for Hong Kong trip generation (no auth required)
router.post('/test-hong-kong-trip', async (req, res) => {
  try {
    const { 
      destination = 'Hong Kong', 
      startDate = '2025-07-16', 
      endDate = '2025-07-20', 
      interests = ['Culture', 'Food', 'Nightlife'], 
      budget = 'luxury',
      title = 'Test Trip to Hong Kong',
      travelers = '5+'
    } = req.body;

    console.log('Test endpoint: Generating Hong Kong trip with interests:', interests);
    console.log('Using budget:', budget);
    
    // Generate itinerary
    let generatedItinerary;
    let generatedLocalTips;
    
    try {
      generatedItinerary = await generateTravelItinerary({
        destination, startDate, endDate, interests, budget
      });
      
      console.log('Itinerary generated successfully');
      
      // Generate local tips
      generatedLocalTips = await generateLocalTips(destination);
      console.log('Local tips generated successfully');
      
    } catch (aiError) {
      console.error('AI Service Error:', aiError);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate content using AI service',
        error: aiError.message
      });
    }

    // Parse the generated itinerary
    try {
      // Parse the AI-generated itinerary
      const parsedItinerary = parseStoredAIResponse(generatedItinerary, {
        destination, startDate, endDate, interests
      });
      
      console.log('Parsed itinerary successfully, days:', parsedItinerary?.length || 0);
      
      // Validate and normalize the itinerary
      const { isValid, errors } = validateItinerary(parsedItinerary);
      if (!isValid) {
        console.log('Itinerary validation failed:', errors);
        return res.status(400).json({
          success: false,
          message: 'Generated itinerary failed validation',
          errors
        });
      }
      
      const normalizedItinerary = normalizeItinerary(parsedItinerary, startDate);
      
      // Return successful response
      res.json({
        success: true,
        message: 'Trip itinerary generated successfully',
        tripData: {
          title,
          destination: { name: destination },
          startDate,
          endDate,
          budget: {
            currency: 'INR',
            amount: getBudgetAmount(budget, destination, startDate, endDate, travelers)
          },
          itinerary: normalizedItinerary,
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
        }
      });
      
    } catch (parseError) {
      console.error('Itinerary parsing error:', parseError);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse generated itinerary',
        error: parseError.message
      });
    }
  } catch (error) {
    console.error('Test trip generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating test trip',
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

    console.log(`Fetching photo for place: ${placeName}`);
    
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

    console.log(`Fetching photos for ${places.length} places`);
    
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

/**
 * @route   POST /api/generator/clear-photo-cache
 * @desc    Clear the photo cache (for testing/debugging)
 * @access  Private
 */
router.post('/clear-photo-cache', auth, (req, res) => {
  try {
    clearPhotoCache();
    res.json({
      success: true,
      message: 'Photo cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing photo cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear photo cache',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/generator/test-destination-images
 * @desc    Test destination image fetching for multiple places
 * @access  Private
 */
router.post('/test-destination-images', auth, async (req, res) => {
  try {
    const { places } = req.body;
    
    if (!places || !Array.isArray(places)) {
      return res.status(400).json({
        success: false,
        message: 'Places array is required'
      });
    }

    console.log(`Testing destination images for: ${places.join(', ')}`);
    
    const results = [];
    
    for (const place of places) {
      try {
        const imageUrl = await getCachedPlacePhoto(place);
        results.push({
          place: place,
          imageUrl: imageUrl,
          source: 'Fetched successfully'
        });
      } catch (error) {
        results.push({
          place: place,
          imageUrl: null,
          source: 'Error',
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Destination image test completed',
      results: results
    });

  } catch (error) {
    console.error('Error testing destination images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test destination images',
      error: error.message
    });
  }
});

export default router;
