import axios from 'axios';
import dotenv from 'dotenv';
import { getCuratedDestinationImage } from '../data/curatedDestinations.js';

dotenv.config();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * Get location photo from Unsplash API
 * @param {string} placeName - Name of the place
 * @returns {Promise<string|null>} - Photo URL or null
 */
export const getUnsplashPhoto = async (placeName) => {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('UNSPLASH_ACCESS_KEY is not set');
      return null;
    }

    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: placeName,
        per_page: 1,
        orientation: 'landscape'
      },
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error(`Error getting Unsplash photo for ${placeName}:`, error.message);
    return null;
  }
};

/**
 * Search for destination images using Unsplash API
 * @param {string} placeName - Name of the place to search for
 * @param {number} maxPhotos - Maximum number of photos to return (default: 1)
 * @returns {Promise<Object>} - Place photos data
 */
export const searchPlacePhotos = async (placeName, maxPhotos = 1) => {
  try {
    
    if (!placeName) {
      throw new Error('Place name is required');
    }

    const cleanPlaceName = placeName.trim();
    const photos = [];

    // Try Unsplash
    if (UNSPLASH_ACCESS_KEY) {
      try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
          params: {
            query: cleanPlaceName,
            per_page: maxPhotos,
            orientation: 'landscape'
          },
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        });

        if (response.data.results && response.data.results.length > 0) {
          response.data.results.forEach(photo => {
            photos.push({
              photoUrl: photo.urls.regular,
              source: 'unsplash',
              searchQuery: cleanPlaceName,
              photographer: photo.user.name,
              photographerUrl: photo.user.links.html
            });
          });
        }
      } catch (err) {
        console.error('Unsplash search error:', err.message);
      }
    }

    if (photos.length > 0) {
      return {
        success: true,
        place: {
          name: cleanPlaceName,
          searchQuery: cleanPlaceName
        },
        photos: photos
      };
    }
    
    return {
      success: false,
      message: 'No photos found',
      photos: []
    };

  } catch (error) {
    console.error('Error searching place photos:', error);
    return {
      success: false,
      message: error.message || 'Failed to search place photos',
      photos: []
    };
  }
};

/**
 * Get destination image with multiple sources prioritizing curated images first
 * @param {string} placeName - Name of the place
 * @returns {Promise<string>} - Image URL
 */
export const getDestinationImage = async (placeName) => {
  try {
    if (!placeName) {
      return getRandomTravelImage();
    }

    const cleanPlace = placeName.trim();

    // Priority 1: Try curated images first (highest quality, same as Destinations tab)
    const curatedImage = getCuratedDestinationImage(cleanPlace);
    if (curatedImage) {
      return curatedImage;
    }

    // Priority 2: Try Unsplash API
    const unsplashPhoto = await getUnsplashPhoto(cleanPlace);
    if (unsplashPhoto) {
      return unsplashPhoto;
    }

    // Priority 3: Smart fallback based on destination type
    const smartFallback = getSmartTravelFallback(cleanPlace);
    return smartFallback;

  } catch (error) {
    console.error(`Error getting image for ${placeName}:`, error);
    return getSmartTravelFallback(placeName);
  }
};



/**
 * Get a smart travel-themed fallback image based on destination characteristics
 * @param {string} placeName - Name of the place
 * @returns {string} - Fallback image URL
 */
export const getSmartTravelFallback = (placeName) => {
  if (!placeName) {
    return getRandomTravelImage();
  }

  const place = placeName.toLowerCase();
  
  // Beach/Island destinations
  if (place.includes('beach') || place.includes('island') || place.includes('maldives') || 
      place.includes('bali') || place.includes('hawaii') || place.includes('caribbean') ||
      place.includes('seychelles') || place.includes('fiji') || place.includes('goa') ||
      place.includes('coast') || place.includes('bay')) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
  
  // Mountain/Hill destinations
  if (place.includes('mountain') || place.includes('hill') || place.includes('himalaya') || 
      place.includes('alps') || place.includes('peak') || place.includes('valley') ||
      place.includes('summit') || place.includes('tibet') || place.includes('nepal') ||
      place.includes('switzerland') || place.includes('norway') || place.includes('iceland')) {
    return 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
  
  // City destinations
  if (place.includes('city') || place.includes('york') || place.includes('london') || 
      place.includes('paris') || place.includes('tokyo') || place.includes('mumbai') ||
      place.includes('delhi') || place.includes('bangalore') || place.includes('metro') ||
      place.includes('urban') || place.includes('downtown')) {
    return 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
  
  // Desert destinations
  if (place.includes('desert') || place.includes('sahara') || place.includes('dubai') ||
      place.includes('rajasthan') || place.includes('morocco') || place.includes('egypt') ||
      place.includes('arabia') || place.includes('sand')) {
    return 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
  
  // Forest/Jungle destinations
  if (place.includes('forest') || place.includes('jungle') || place.includes('amazon') ||
      place.includes('rainforest') || place.includes('safari') || place.includes('wildlife') ||
      place.includes('nature') || place.includes('national park')) {
    return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
  
  // Historical/Cultural destinations
  if (place.includes('temple') || place.includes('palace') || place.includes('fort') ||
      place.includes('heritage') || place.includes('historic') || place.includes('ancient') ||
      place.includes('museum') || place.includes('cultural') || place.includes('monument')) {
    return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
  
  // Default: Beautiful landscape
  return getRandomTravelImage();
};

/**
 * Get a random travel-themed image using high-quality Unsplash photos
 * @returns {string} - Random travel image URL
 */
export const getRandomTravelImage = () => {
  const travelImages = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Travel suitcase
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Beautiful landscape
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Forest path
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Tropical beach
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Mountain landscape
    'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Venice canals
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Desert sunset
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Ocean waves
  ];
  
  const randomIndex = Math.floor(Math.random() * travelImages.length);
  return travelImages[randomIndex];
};

/**
 * Get place photo (formerly cached)
 * @param {string} placeName - Name of the place
 * @returns {Promise<string>} - Photo URL or fallback image
 */
export const getCachedPlacePhoto = async (placeName) => {
  return getDestinationImage(placeName);
};
