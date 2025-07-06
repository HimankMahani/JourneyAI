/**
 * Service for handling Google Maps API requests
 */

import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Search for places using Google Places API
 * @param {string} query - Search query
 * @param {string} location - Location in "lat,lng" format (optional)
 * @param {number} radius - Search radius in meters (optional)
 * @param {string} type - Place type (optional)
 * @returns {Promise<Array>} - Array of place results
 */
export const searchPlaces = async (query, location, radius, type) => {
  try {
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${GOOGLE_MAPS_API_KEY}`;
    
    if (query) {
      url += `&query=${encodeURIComponent(query)}`;
    }
    
    if (location) {
      url += `&location=${location}`; 
    }
    
    if (radius) {
      url += `&radius=${radius}`;
    }
    
    if (type) {
      url += `&type=${type}`;
    }
    
    const response = await axios.get(url);
    
    return response.data.results;
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
};

/**
 * Get details for a specific place
 * @param {string} placeId - The Google Place ID
 * @returns {Promise<Object>} - Place details
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,place_id,rating,user_ratings_total,formatted_phone_number,website,opening_hours,price_level,types,photos,reviews&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await axios.get(url);
    
    return response.data.result;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
};

/**
 * Get directions between two points
 * @param {string} origin - Origin place ID or coordinates
 * @param {string} destination - Destination place ID or coordinates
 * @param {string} mode - Travel mode (driving, walking, bicycling, transit)
 * @returns {Promise<Object>} - Directions result
 */
export const getDirections = async (origin, destination, mode = 'driving') => {
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await axios.get(url);
    
    return response.data;
  } catch (error) {
    console.error('Error getting directions:', error);
    throw error;
  }
};
