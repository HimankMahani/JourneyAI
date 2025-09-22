/**
 * Service for handling AI requests using Google's Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 8192,
  },
});

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

    // Override default generation config with any provided options
    const generationConfig = {
      temperature: options.temperature || 0.7,
      topP: options.topP || 0.8,
      topK: options.topK || 40,
      maxOutputTokens: options.maxTokens || 8192,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
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
