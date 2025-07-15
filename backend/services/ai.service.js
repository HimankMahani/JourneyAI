/**
 * Service for handling AI requests using Google's Gemini API
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate content using Gemini AI
 * @param {string} prompt - The text prompt to send to Gemini
 * @param {Object} options - Additional options for the request
 * @returns {Promise<string>} - The generated text response
 */
export const generateContent = async (prompt, options = {}) => {
  try {
    // Verify if API key exists
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing or empty');
      throw new Error('Gemini API key is not configured');
    }

    console.log('Calling Gemini API with prompt:', prompt.substring(0, 100) + '...');
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
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
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 8192,  // Increased from 4096 to 8192
          topP: options.topP || 0.8,
          topK: options.topK || 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.candidates || response.data.candidates.length === 0) {
      console.error('No candidates in Gemini API response:', JSON.stringify(response.data));
      throw new Error('No response from Gemini API');
    }
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data));
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

/**
 * Generate a travel itinerary with transportation costs from user location
 * @param {Object} tripDetails - Details about the trip
 * @param {Object} userLocation - User's location information
 * @returns {Promise<string>} - The generated itinerary
 */
export const generateTravelItinerary = async (tripDetails, userLocation = null) => {
  const { destination, startDate, endDate, interests = [], budget = 'mid-range', travelers = 1 } = tripDetails;
  
  // Calculate trip duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const tripDurationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  // Helper function to format date for AI prompt
  const formatDateForAI = (date, dayOffset = 0) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dayOffset);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Build budget context
  const budgetContext = {
    'economy': 'Economy options, budget transport, hostels/budget hotels, affordable dining',
    'budget': 'Budget-friendly options, local transport, hostels/budget hotels, street food',
    'mid-range': 'Mid-range options, mix of public and private transport, 3-star hotels, good restaurants',
    'luxury': 'Luxury options, private transport, 5-star hotels, fine dining experiences'
  };

  // Build user location context
  let locationContext = '';
  let transportationPrompt = '';
  if (userLocation && userLocation.full) {
    locationContext = ` The traveler is coming from ${userLocation.full}.`;
    transportationPrompt = `

TRANSPORTATION TO DESTINATION:
Include transportation costs and options from ${userLocation.full} to ${destination}:
- Flight costs (economy, business if luxury budget)
- Alternative transport options (train, bus if applicable)
- Airport/station transfers
- Visa requirements if international travel
- Travel time and recommendations`;
  }
  
  // Construct the enhanced prompt
  let prompt = `Generate a comprehensive ${tripDurationInDays}-day travel itinerary for ${travelers} traveler(s) visiting ${destination}.${locationContext}
  
Trip Details:
- Dates: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}
- Budget Level: ${budget} (${budgetContext[budget] || budgetContext['mid-range']})
- Interests: ${interests.length > 0 ? interests.join(', ') : 'General sightseeing'}
- Travelers: ${travelers} person(s)

${transportationPrompt}

CRITICAL FORMATTING: Respond with ONLY a valid JSON array. No markdown, no explanations, no text before or after. Start with [ and end with ].

JSON Structure Required:
[`;
  
  // Add detailed example structure
  for (let i = 0; i < Math.min(tripDurationInDays, 2); i++) {
    const dayDate = formatDateForAI(startDate, i);
    const isFirstDay = i === 0;
    
    prompt += `
  {
    "day": ${i + 1},
    "date": "${dayDate}",
    "activities": [`;
    
    if (isFirstDay && userLocation) {
      prompt += `
      {
        "title": "Travel from ${userLocation.city || userLocation.full} to ${destination}",
        "description": "Flight/transport from origin to destination including transfers",
        "type": "transportation",
        "time": "06:00",
        "duration": "varies",
        "cost": "₹25000",
        "location": {
          "name": "Airport/Station",
          "address": "${destination}"
        }
      },`;
    }
    
    prompt += `
      {
        "title": "Check-in at Hotel",
        "description": "Arrive and settle into accommodation",
        "type": "accommodation",
        "time": "${isFirstDay ? '14:00' : '09:00'}",
        "duration": "1 hour",
        "cost": "₹3000",
        "location": {
          "name": "Hotel Name",
          "address": "Address in ${destination}"
        }
      },
      {
        "title": "Visit Famous Landmark",
        "description": "Explore the iconic attractions",
        "type": "sightseeing",
        "time": "16:00",
        "duration": "3 hours",
        "cost": "₹500",
        "location": {
          "name": "Landmark Name",
          "address": "Address in ${destination}"
        }
      },
      {
        "title": "Local Cuisine Experience",
        "description": "Try authentic local dishes",
        "type": "food",
        "time": "19:30",
        "duration": "2 hours",
        "cost": "₹1200",
        "location": {
          "name": "Restaurant Name",
          "address": "Address in ${destination}"
        }
      }
    ]
  }${i < Math.min(tripDurationInDays, 2) - 1 ? ',' : ''}`;
  }
  
  if (tripDurationInDays > 2) {
    prompt += `,
  ...continue for all ${tripDurationInDays} days`;
  }
  
  prompt += `
]

STRICT REQUIREMENTS:
1. ONLY return the JSON array - no other text, explanations, or formatting
2. Include ${userLocation ? 'transportation costs from ' + userLocation.full : 'local transportation'}
3. Include 3-6 activities per day based on ${budget} budget level
4. Activity types: sightseeing, food, accommodation, transportation, activity, nightlife, shopping
5. Times in 24-hour format (09:00, 14:30, etc.)
6. Costs in INR with ₹ symbol, realistic for ${budget} budget
7. Real locations and attractions in ${destination}
8. Consider ${interests.join(', ') || 'general tourism'} interests
9. Valid JSON syntax - proper brackets, commas, quotes
10. Include estimated costs for meals, attractions, transportation within ${destination}
11. Account for ${travelers} traveler(s) in group activities and costs`;

  return generateContent(prompt, { 
    temperature: 0.7,
    maxTokens: 8192 // Ensure we have enough tokens for detailed responses
  });
};

/**
 * Generate local travel tips for a destination
 * @param {string} destination - The destination to get tips for
 * @returns {Promise<string>} - The generated tips
 */
export const generateLocalTips = async (destination) => {
  const prompt = `Provide 5-7 useful local tips for travelers visiting ${destination}. Include information about:
  1. Local customs and etiquette
  2. Transportation tips
  3. Safety advice
  4. Money-saving suggestions
  5. Best times to visit popular attractions
  6. Any local scams to be aware of
  7. Food and dining recommendations`;
  
  return generateContent(prompt, { temperature: 0.6 });
};

/**
 * Generate activity recommendations
 * @param {string} destination - The destination
 * @param {Array} interests - Array of user interests
 * @param {string} weatherCondition - Current weather (optional)
 * @returns {Promise<string>} - The generated recommendations
 */
export const generateActivityRecommendations = async (destination, interests = [], weatherCondition = null) => {
  let prompt = `Recommend 5 interesting activities for a traveler visiting ${destination}.`;
  
  if (interests && interests.length > 0) {
    prompt += ` The traveler is interested in ${interests.join(', ')}.`;
  }
  
  if (weatherCondition) {
    prompt += ` The current weather is ${weatherCondition}.`;
  }
  
  prompt += ` For each activity, include a name, brief description, estimated time required, and best time of day to visit.`;
  
  return generateContent(prompt, { temperature: 0.7 });
};

/**
 * Enhanced comprehensive trip cost estimation with detailed breakdown
 * @param {string} fromLocation - Origin location
 * @param {string} toDestination - Destination location
 * @param {number} days - Number of days
 * @param {number} travelers - Number of travelers
 * @param {Array} itinerary - Detailed itinerary if available
 * @returns {Promise<Object>} - Complete cost breakdown
 */
export const estimateEnhancedTripCosts = async (fromLocation, toDestination, days = 1, travelers = 1, itinerary = null) => {
  let prompt = `Provide a comprehensive and realistic cost estimate for a ${days}-day trip from ${fromLocation} to ${toDestination} for ${travelers} traveler(s).
  
  Please provide REALISTIC 2025 prices in Indian Rupees (INR) for:
  
  1. FLIGHTS:
     - Round-trip economy class flights only (no business/luxury)
     - Consider current airline prices, fuel costs, and seasonal variations
     - Include airport taxes and fees
  
  2. ACCOMMODATION:
     - Budget to mid-range hotels/stays for ${days-1} nights
     - Include taxes and service charges
     - Consider location and seasonality
  
  3. FOOD & DINING:
     - Breakfast: Mix of hotel and local cafes
     - Lunch: Local restaurants and street food
     - Dinner: Budget to mid-range dining
     - Snacks and beverages throughout the day
     - Consider local cost of living
  
  4. LOCAL TRANSPORTATION:
     - Airport transfers (both ways)
     - Daily local transport (metro, taxis, buses, auto-rickshaws)
     - Inter-location transport within the city
     - Consider distance between attractions
  
  5. ACTIVITIES & SIGHTSEEING:
     - Entry fees to major attractions and museums
     - Guided tours and experiences
     - Entertainment and cultural activities
     - Photography fees where applicable
  
  6. SHOPPING & MISCELLANEOUS:
     - Souvenirs and local purchases
     - Tips and service charges
     - Emergency fund
     - Communication (SIM cards, WiFi)
     - Travel insurance

  CRITICAL REQUIREMENTS:
  - Use only economy/budget options for all categories.
  - Use local prices for all estimates.
  - If an itinerary is provided, the 'activities' cost in the breakdown should match the sum of the activity costs in the itinerary.
  - Ensure the sum of all breakdown categories equals totalTripCost.
  - If any category is missing, set its value to 0.
  - In the explanation, state how you calculated each category and why the total is reasonable for an economy traveler.

  Convert all costs to INR and provide response in JSON format:
  {
    "totalTripCost": [total cost in INR],
    "breakdown": {
      "flights": [detailed flight cost in INR],
      "accommodation": [total accommodation cost in INR],
      "food": [total food cost for all days in INR],
      "localTransport": [local transportation cost in INR],
      "activities": [activities and sightseeing cost in INR],
      "shopping": [shopping and souvenirs cost in INR],
      "misc": [miscellaneous expenses like tips, communication, emergency fund in INR]
    },
    "dailyBreakdown": {
      "accommodationPerNight": [cost per night in INR],
      "foodPerPersonPerDay": [food cost per person per day in INR],
      "transportPerDay": [local transport per day in INR],
      "activitiesPerDay": [average activities cost per day in INR]
    },
    "costFactors": [
      "factor1: explanation",
      "factor2: explanation",
      "factor3: explanation"
    ],
    "explanation": "Brief explanation of the cost calculation methodology and sanity check."
  }`;
  
  if (itinerary && Array.isArray(itinerary)) {
    const itineraryDetails = itinerary.map((day, index) => {
      const activities = day.activities || [];
      const dayActivities = activities.map(activity => 
        `- ${activity.activity || activity.title || 'Activity'} at ${activity.location || 'location'} (cost: ${activity.cost || 0})`
      ).join('\n');
      return `Day ${index + 1}: ${day.date || `Day ${index + 1}`}` + (dayActivities ? `\n${dayActivities}` : '');
    }).join('\n\n');
    
    prompt += `\n\nItinerary Details:\n${itineraryDetails}\n\nBased on this itinerary, calculate transportation costs between locations, specific attraction fees, and meal costs at mentioned restaurants. The sum of all activity costs in the itinerary should be used for the 'activities' category in the breakdown.`;
  }

  const response = await generateContent(prompt, { temperature: 0.2 });
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    let aiResult = null;
    if (jsonMatch) {
      aiResult = JSON.parse(jsonMatch[0]);
      // --- POST-PROCESSING LOGIC ---
      // If itinerary is provided, override activities cost
      if (itinerary && Array.isArray(itinerary)) {
        let itineraryActivitiesCost = 0;
        itinerary.forEach(day => {
          (day.activities || []).forEach(activity => {
            let cost = activity.cost;
            if (typeof cost === 'string') {
              cost = parseInt(String(cost).replace(/[^\d]/g, ''), 10) || 0;
            }
            if (typeof cost === 'number' && !isNaN(cost)) {
              itineraryActivitiesCost += cost;
            }
          });
        });
        if (aiResult.breakdown) {
          aiResult.breakdown.activities = itineraryActivitiesCost;
        }
      }
      // Ensure totalTripCost is the sum of breakdown
      if (aiResult.breakdown) {
        const sum = Object.values(aiResult.breakdown).reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
        aiResult.totalTripCost = sum;
      }
      return aiResult;
    }
    // ... fallback logic ...
  } catch (error) {
    console.error('Error parsing enhanced cost response:', error);
    // Return the fallback calculation
    const baseFlightCost = getFlightCostByDistance(fromLocation, toDestination) * travelers;
    const accommodationCost = getAccommodationCost(toDestination, days - 1);
    const foodCost = getFoodCost(toDestination, days, travelers);
    const transportCost = getLocalTransportCost(toDestination, days, travelers);
    const activitiesCost = getActivitiesCost(toDestination, days, travelers);
    const shoppingCost = getShoppingCost(toDestination, days, travelers);
    
    return {
      totalTripCost: baseFlightCost + accommodationCost + foodCost + transportCost + activitiesCost + shoppingCost,
      breakdown: {
        flights: baseFlightCost,
        accommodation: accommodationCost,
        food: foodCost,
        localTransport: transportCost,
        activities: activitiesCost,
        shopping: Math.round(shoppingCost * 0.7), // 70% for shopping
        misc: Math.round(shoppingCost * 0.3) // 30% for miscellaneous
      },
      dailyBreakdown: {
        accommodationPerNight: Math.round(accommodationCost / (days - 1)),
        foodPerPersonPerDay: Math.round(foodCost / (days * travelers)),
        transportPerDay: Math.round(transportCost / days),
        activitiesPerDay: Math.round(activitiesCost / days)
      },
      costFactors: [
        "Distance: Flight cost based on route distance and popularity",
        "Seasonality: Peak/off-season pricing variations",
        "Local economy: Cost of living in destination",
        "Tourist density: Price premiums in popular tourist areas"
      ],
      explanation: "Comprehensive cost estimation using enhanced calculation model"
    };
  }
};

// Helper functions for realistic cost calculations
const getFlightCostByDistance = (from, to) => {
  const domesticRoutes = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad'];
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();
  
  // Domestic flights
  if (domesticRoutes.some(city => fromLower.includes(city)) && 
      domesticRoutes.some(city => toLower.includes(city))) {
    return 8000; // Average domestic round-trip
  }
  
  // International flights - by region
  if (toLower.includes('europe') || toLower.includes('paris') || toLower.includes('london') || 
      toLower.includes('germany') || toLower.includes('italy') || toLower.includes('spain')) {
    return 65000; // Europe
  }
  
  if (toLower.includes('usa') || toLower.includes('america') || toLower.includes('new york') || 
      toLower.includes('california') || toLower.includes('canada')) {
    return 80000; // North America
  }
  
  if (toLower.includes('dubai') || toLower.includes('uae') || toLower.includes('qatar') || 
      toLower.includes('saudi')) {
    return 25000; // Middle East
  }
  
  if (toLower.includes('singapore') || toLower.includes('thailand') || toLower.includes('bali') || 
      toLower.includes('malaysia') || toLower.includes('vietnam')) {
    return 35000; // Southeast Asia
  }
  
  if (toLower.includes('japan') || toLower.includes('korea') || toLower.includes('china')) {
    return 45000; // East Asia
  }
  
  return 50000; // Default international
};

const getAccommodationCost = (destination, nights) => {
  const destLower = destination.toLowerCase();
  let perNightCost = 3000; // Default
  
  if (destLower.includes('paris') || destLower.includes('london') || destLower.includes('new york')) {
    perNightCost = 8000; // Expensive cities
  } else if (destLower.includes('dubai') || destLower.includes('singapore')) {
    perNightCost = 6000; // Luxury destinations
  } else if (destLower.includes('thailand') || destLower.includes('bali') || destLower.includes('vietnam')) {
    perNightCost = 2500; // Budget-friendly destinations
  } else if (destLower.includes('mumbai') || destLower.includes('delhi') || destLower.includes('bangalore')) {
    perNightCost = 4000; // Indian metros
  }
  
  return perNightCost * nights;
};

const getFoodCost = (destination, days, travelers) => {
  const destLower = destination.toLowerCase();
  let perPersonPerDay = 1500; // Default
  
  if (destLower.includes('paris') || destLower.includes('london') || destLower.includes('new york')) {
    perPersonPerDay = 4000; // Expensive cities
  } else if (destLower.includes('dubai') || destLower.includes('singapore')) {
    perPersonPerDay = 3000; // Mid-high cost
  } else if (destLower.includes('thailand') || destLower.includes('bali') || destLower.includes('vietnam')) {
    perPersonPerDay = 1000; // Budget-friendly
  } else if (destLower.includes('mumbai') || destLower.includes('delhi')) {
    perPersonPerDay = 1800; // Indian metros
  }
  
  return perPersonPerDay * days * travelers;
};

const getLocalTransportCost = (destination, days, travelers) => {
  const destLower = destination.toLowerCase();
  let perPersonPerDay = 800; // Default
  
  if (destLower.includes('paris') || destLower.includes('london')) {
    perPersonPerDay = 1500; // Expensive public transport
  } else if (destLower.includes('dubai') || destLower.includes('singapore')) {
    perPersonPerDay = 1200; // Good public transport
  } else if (destLower.includes('thailand') || destLower.includes('bali')) {
    perPersonPerDay = 600; // Cheap transport
  } else if (destLower.includes('mumbai') || destLower.includes('delhi')) {
    perPersonPerDay = 500; // Indian transport
  }
  
  return perPersonPerDay * days * travelers;
};

const getActivitiesCost = (destination, days, travelers) => {
  const destLower = destination.toLowerCase();
  let perPersonPerDay = 2000; // Default
  
  if (destLower.includes('paris') || destLower.includes('london')) {
    perPersonPerDay = 3500; // Expensive attractions
  } else if (destLower.includes('dubai') || destLower.includes('singapore')) {
    perPersonPerDay = 3000; // Tourist attractions
  } else if (destLower.includes('thailand') || destLower.includes('bali')) {
    perPersonPerDay = 1500; // Budget activities
  } else if (destLower.includes('mumbai') || destLower.includes('delhi')) {
    perPersonPerDay = 1200; // Indian attractions
  }
  
  return perPersonPerDay * days * travelers;
};

const getShoppingCost = (destination, days, travelers) => {
  const destLower = destination.toLowerCase();
  let baseAmount = 5000; // Default per person
  
  if (destLower.includes('dubai') || destLower.includes('singapore')) {
    baseAmount = 8000; // Shopping destinations
  } else if (destLower.includes('paris') || destLower.includes('london')) {
    baseAmount = 7000; // Fashion capitals
  } else if (destLower.includes('thailand') || destLower.includes('bali')) {
    baseAmount = 3000; // Bargain shopping
  }
  
  return baseAmount * travelers;
};

/**
 * Estimate flight costs between two locations
 * @param {string} fromLocation - Origin location
 * @param {string} toDestination - Destination location
 * @param {number} travelers - Number of travelers
 * @returns {Promise<Object>} - Cost estimation with breakdown
 */
export const estimateFlightCost = async (fromLocation, toDestination, travelers = 1) => {
  const prompt = `Estimate the average flight cost from ${fromLocation} to ${toDestination} for ${travelers} traveler(s).
  
  Consider:
  - Economy class round-trip tickets
  - Current market prices (2025)
  - Seasonal variations
  - Distance and popular routes
  - Local currency (convert to INR - Indian Rupees)
  
  Provide response in JSON format:
  {
    "estimatedCost": [total cost in INR],
    "costPerPerson": [cost per person in INR],
    "explanation": "Brief explanation of the estimate",
    "factors": ["factor1", "factor2", "factor3"]
  }`;
  
  const response = await generateContent(prompt, { temperature: 0.3 });
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    const costPerPerson = getFlightCostByDistance(fromLocation, toDestination);
    return {
      estimatedCost: costPerPerson * travelers,
      costPerPerson: costPerPerson,
      explanation: "Average flight cost estimation",
      factors: ["Distance", "Seasonality", "Route popularity"]
    };
  } catch (error) {
    console.error('Error parsing flight cost response:', error);
    const costPerPerson = getFlightCostByDistance(fromLocation, toDestination);
    return {
      estimatedCost: costPerPerson * travelers,
      costPerPerson: costPerPerson,
      explanation: "Default flight cost estimation",
      factors: ["Distance", "Seasonality", "Route popularity"]
    };
  }
};

/**
 * Estimate food costs for a destination
 * @param {string} destination - The destination
 * @param {number} days - Number of days
 * @param {number} travelers - Number of travelers
 * @returns {Promise<Object>} - Food cost estimation
 */
export const estimateFoodCost = async (destination, days = 1, travelers = 1) => {
  const prompt = `Estimate the average daily food cost for ${travelers} traveler(s) in ${destination} for ${days} day(s).
  
  Consider:
  - Mix of local restaurants, street food, and mid-range dining
  - Breakfast, lunch, and dinner costs
  - Local cost of living
  - Tourist areas vs local areas
  - Convert to INR - Indian Rupees
  
  Provide response in JSON format:
  {
    "totalCost": [total cost for all days and travelers in INR],
    "dailyCostPerPerson": [daily cost per person in INR],
    "breakdown": {
      "breakfast": [cost in INR],
      "lunch": [cost in INR],
      "dinner": [cost in INR]
    },
    "explanation": "Brief explanation of the estimate"
  }`;
  
  const response = await generateContent(prompt, { temperature: 0.3 });
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    const dailyCostPerPerson = getFoodCost(destination, 1, 1);
    return {
      totalCost: dailyCostPerPerson * days * travelers,
      dailyCostPerPerson: dailyCostPerPerson,
      breakdown: {
        breakfast: Math.round(dailyCostPerPerson * 0.2),
        lunch: Math.round(dailyCostPerPerson * 0.4),
        dinner: Math.round(dailyCostPerPerson * 0.4)
      },
      explanation: "Average food cost estimation"
    };
  } catch (error) {
    console.error('Error parsing food cost response:', error);
    const dailyCostPerPerson = getFoodCost(destination, 1, 1);
    return {
      totalCost: dailyCostPerPerson * days * travelers,
      dailyCostPerPerson: dailyCostPerPerson,
      breakdown: {
        breakfast: Math.round(dailyCostPerPerson * 0.2),
        lunch: Math.round(dailyCostPerPerson * 0.4),
        dinner: Math.round(dailyCostPerPerson * 0.4)
      },
      explanation: "Default food cost estimation"
    };
  }
};

/**
 * Estimate comprehensive trip costs (using the enhanced version)
 * @param {string} fromLocation - Origin location
 * @param {string} toDestination - Destination location
 * @param {number} days - Number of days
 * @param {number} travelers - Number of travelers
 * @returns {Promise<Object>} - Complete cost breakdown
 */
export const estimateComprehensiveTripCosts = async (fromLocation, toDestination, days = 1, travelers = 1) => {
  return estimateEnhancedTripCosts(fromLocation, toDestination, days, travelers);
};
