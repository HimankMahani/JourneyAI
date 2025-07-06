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
          maxOutputTokens: options.maxTokens || 4096,
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
 * Generate a travel itinerary
 * @param {Object} tripDetails - Details about the trip
 * @returns {Promise<string>} - The generated itinerary
 */
export const generateTravelItinerary = async (tripDetails) => {
  const { destination, startDate, endDate, interests = [], budget = 'medium' } = tripDetails;
  
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
  
  // Construct the prompt requesting structured JSON format
  let prompt = `Generate a detailed ${tripDurationInDays}-day travel itinerary for a trip to ${destination}. 
  The trip is from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`;
  
  if (interests && interests.length > 0) {
    prompt += ` The traveler is interested in ${interests.join(', ')}.`;
  }
  
  prompt += ` The traveler has a ${budget} budget.

  CRITICAL: You must respond with ONLY a valid JSON array. Do not include any other text, explanations, or markdown formatting. Start your response with [ and end with ]. Example format:

  [`;
  
  // Add example days based on actual trip duration
  for (let i = 0; i < tripDurationInDays; i++) {
    const dayDate = formatDateForAI(startDate, i);
    prompt += `
    {
      "day": ${i + 1},
      "date": "${dayDate}",
      "activities": [
        {
          "title": "Visit Red Fort",
          "description": "Explore the historic Red Fort complex",
          "type": "sightseeing",
          "time": "10:00",
          "duration": "2 hours",
          "cost": "₹50",
          "location": {
            "name": "Red Fort",
            "address": "Netaji Subhash Marg, Delhi"
          }
        },
        {
          "title": "Lunch at Karim's",
          "description": "Enjoy authentic Mughlai cuisine",
          "type": "food",
          "time": "13:00",
          "duration": "1.5 hours",
          "cost": "₹800",
          "location": {
            "name": "Karim's Restaurant",
            "address": "Gali Kababian, Jama Masjid, Delhi"
          }
        }
      ]
    }${i < tripDurationInDays - 1 ? ',' : ''}`;
  }
  
  prompt += `
  ]

  Important requirements:
  - Respond with ONLY the JSON array, no other text
  - Include 3-5 activities per day
  - Types must be: sightseeing, food, accommodation, transportation, activity, nightlife, other
  - Times in 24-hour format (10:00, 14:30, etc.)
  - Costs in INR with ₹ symbol
  - Valid JSON syntax - check your brackets and commas
  - Include real locations for ${destination}`;
  
  return generateContent(prompt, { temperature: 0.7 });
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
