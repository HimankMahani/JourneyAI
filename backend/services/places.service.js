import axios from 'axios';
import dotenv from 'dotenv';
import { getCuratedDestinationImage } from '../data/curatedDestinations.js';

dotenv.config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Get location photo from Google Places API
 * @param {string} placeName - Name of the place
 * @returns {Promise<string|null>} - Photo URL or null
 */
export const getGooglePlacesPhoto = async (placeName) => {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      console.log('Google Maps API key not configured');
      return null;
    }

    console.log(`Searching Google Places for: ${placeName}`);

    // First, search for the place to get place_id
    const searchResponse = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: placeName,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (searchResponse.data.results && searchResponse.data.results.length > 0) {
      const place = searchResponse.data.results[0];
      
      if (place.photos && place.photos.length > 0) {
        const photoReference = place.photos[0].photo_reference;
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
        
        console.log(`Found Google Places photo for: ${placeName}`);
        return photoUrl;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error getting Google Places photo for ${placeName}:`, error.message);
    return null;
  }
};

/**
 * Get location photo from Wikimedia Commons (free, location-specific photos)
 * @param {string} placeName - Name of the place
 * @returns {Promise<string|null>} - Photo URL or null
 */
export const getWikimediaPhoto = async (placeName) => {
  try {
    console.log(`Searching Wikimedia for: ${placeName}`);

    // Search for Wikipedia article about the place
    const searchResponse = await axios.get('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(placeName));
    
    if (searchResponse.data && searchResponse.data.originalimage) {
      console.log(`Found Wikimedia photo for: ${placeName}`);
      return searchResponse.data.originalimage.source;
    }

    // Alternative: Try searching with different variations
    const variations = [
      `${placeName} city`,
      `${placeName}`,
      placeName.split(',')[0]?.trim()
    ];

    for (const variation of variations) {
      try {
        const response = await axios.get('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(variation));
        if (response.data && response.data.originalimage) {
          console.log(`Found Wikimedia photo for: ${placeName} (using variation: ${variation})`);
          return response.data.originalimage.source;
        }
      } catch (err) {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error getting Wikimedia photo for ${placeName}:`, error.message);
    return null;
  }
};

/**
 * Search for destination images using Pexels API
 * @param {string} placeName - Name of the place to search for
 * @param {number} maxPhotos - Maximum number of photos to return (default: 1)
 * @returns {Promise<Object>} - Place photos data
 */
/**
 * Search for destination images using multiple sources
 * @param {string} placeName - Name of the place to search for
 * @param {number} maxPhotos - Maximum number of photos to return (default: 1)
 * @returns {Promise<Object>} - Place photos data
 */
export const searchPlacePhotos = async (placeName, maxPhotos = 1) => {
  try {
    console.log(`Searching for place photos: ${placeName}`);
    
    if (!placeName) {
      throw new Error('Place name is required');
    }

    const cleanPlaceName = placeName.trim();
    const photos = [];

    // Try Google Places first
    const googlePhoto = await getGooglePlacesPhoto(cleanPlaceName);
    if (googlePhoto) {
      photos.push({
        photoUrl: googlePhoto,
        source: 'google_places',
        searchQuery: cleanPlaceName
      });
    }

    // Try Wikimedia if we need more photos or Google failed
    if (photos.length < maxPhotos) {
      const wikimediaPhoto = await getWikimediaPhoto(cleanPlaceName);
      if (wikimediaPhoto) {
        photos.push({
          photoUrl: wikimediaPhoto,
          source: 'wikimedia',
          searchQuery: cleanPlaceName
        });
      }
    }

    // Try Pexels if we still need more photos
    if (photos.length < maxPhotos && PEXELS_API_KEY) {
      const pexelsPhoto = await getPexelsLocationPhoto(cleanPlaceName);
      if (pexelsPhoto) {
        photos.push({
          photoUrl: pexelsPhoto,
          source: 'pexels',
          searchQuery: cleanPlaceName
        });
      }
    }

    if (photos.length > 0) {
      console.log(`Found ${photos.length} photos for: ${placeName}`);
      return {
        success: true,
        place: {
          name: cleanPlaceName,
          searchQuery: cleanPlaceName
        },
        photos: photos.slice(0, maxPhotos)
      };
    }
    
    console.log(`No photos found for: ${placeName}`);
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
    console.log(`Getting destination image for: ${cleanPlace}`);

    // Priority 1: Try curated images first (highest quality, same as Destinations tab)
    const curatedImage = getCuratedDestinationImage(cleanPlace);
    if (curatedImage) {
      console.log(`Using curated image for: ${cleanPlace}`);
      return curatedImage;
    }

    // Priority 2: Try Google Places API (most accurate for locations)
    const googlePhoto = await getGooglePlacesPhoto(cleanPlace);
    if (googlePhoto) {
      console.log(`Using Google Places photo for: ${cleanPlace}`);
      return googlePhoto;
    }

    // Priority 3: Try Wikimedia Commons (Wikipedia photos)
    const wikimediaPhoto = await getWikimediaPhoto(cleanPlace);
    if (wikimediaPhoto) {
      console.log(`Using Wikimedia photo for: ${cleanPlace}`);
      return wikimediaPhoto;
    }

    // Priority 4: Try Pexels with very specific location-based search
    if (PEXELS_API_KEY) {
      const pexelsPhoto = await getPexelsLocationPhoto(cleanPlace);
      if (pexelsPhoto) {
        console.log(`Using Pexels photo for: ${cleanPlace}`);
        return pexelsPhoto;
      }
    }

    // Priority 5: Smart fallback based on destination type
    const smartFallback = getSmartTravelFallback(cleanPlace);
    console.log(`Using smart fallback for "${placeName}": ${smartFallback}`);
    return smartFallback;

  } catch (error) {
    console.error(`Error getting image for ${placeName}:`, error);
    return getSmartTravelFallback(placeName);
  }
};

/**
 * Get location photo from Pexels with very specific search terms
 * @param {string} placeName - Name of the place
 * @returns {Promise<string|null>} - Photo URL or null
 */
export const getPexelsLocationPhoto = async (placeName) => {
  try {
    if (!PEXELS_API_KEY) {
      return null;
    }

    // Very specific location-based search terms
    const searchTerms = [
      `${placeName} skyline`,
      `${placeName} cityscape`,
      `${placeName} downtown`,
      `${placeName} landmark`,
      `${placeName} architecture famous`
    ];

    for (const term of searchTerms) {
      try {
        const response = await axios.get('https://api.pexels.com/v1/search', {
          headers: {
            'Authorization': PEXELS_API_KEY
          },
          params: {
            query: term,
            per_page: 5,
            orientation: 'landscape'
          }
        });
        
        if (response.data.photos && response.data.photos.length > 0) {
          // Find the most relevant photo
          const relevantPhoto = response.data.photos.find(photo => {
            const altText = (photo.alt || '').toLowerCase();
            const placeLower = placeName.toLowerCase();
            
            // Must contain the place name and architectural/city terms
            return altText.includes(placeLower) && 
                   (altText.includes('building') || 
                    altText.includes('city') || 
                    altText.includes('skyline') ||
                    altText.includes('architecture') ||
                    altText.includes('landmark') ||
                    altText.includes('tower') ||
                    altText.includes('bridge'));
          });
          
          if (relevantPhoto) {
            console.log(`Found relevant Pexels photo for ${placeName}: ${relevantPhoto.alt}`);
            return relevantPhoto.src.medium;
          }
        }
      } catch (searchError) {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error getting Pexels photo for ${placeName}:`, error);
    return null;
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
 * Cache for place photos to avoid repeated API calls
 */
const photoCache = new Map();

/**
 * Clear the photo cache (useful for testing or when images need to be refreshed)
 */
export const clearPhotoCache = () => {
  photoCache.clear();
  console.log('Photo cache cleared');
};

/**
 * Get place photo with caching
 * @param {string} placeName - Name of the place
 * @returns {Promise<string>} - Photo URL or fallback image
 */
export const getCachedPlacePhoto = async (placeName) => {
  if (!placeName) {
    return getRandomTravelImage();
  }

  const cacheKey = placeName.toLowerCase().trim();
  
  // Check cache first
  if (photoCache.has(cacheKey)) {
    console.log(`Using cached photo for: ${placeName}`);
    return photoCache.get(cacheKey);
  }

  try {
    const imageUrl = await getDestinationImage(placeName);
    photoCache.set(cacheKey, imageUrl);
    console.log(`Cached new photo for: ${placeName}`);
    return imageUrl;
  } catch (error) {
    console.error(`Error fetching photo for ${placeName}:`, error);
    
    // Fallback to random travel image
    const fallbackUrl = await getRandomTravelImage();
    photoCache.set(cacheKey, fallbackUrl);
    return fallbackUrl;
  }
};
