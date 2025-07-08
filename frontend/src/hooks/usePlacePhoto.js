import { useState, useEffect, useCallback } from 'react';
import { tripService } from '../services/api';

// In-memory cache for place photos
const photoCache = new Map();

// Curated images from the same source as Destinations tab
const curatedImages = {
  // Popular Asian destinations
  'hong kong': 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'bangkok': 'https://images.unsplash.com/photo-1552550049-db097c9480d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  
  // Popular European destinations  
  'paris': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'rome': 'https://images.unsplash.com/photo-1552832230-c0197047daf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'santorini': 'https://images.unsplash.com/photo-1469796466635-455ede028aca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'amsterdam': 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'venice': 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  
  // Popular American destinations
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'los angeles': 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'san francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'las vegas': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'miami': 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  
  // Popular Indian destinations
  'mumbai': 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'bangalore': 'https://images.unsplash.com/photo-1624360001411-52159d8b2b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'rajasthan': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'agra': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'jaipur': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  
  // Special destinations
  'maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'machu picchu': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'amalfi coast': 'https://images.unsplash.com/photo-1533165850316-2d0024c25091?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
};

// Function to get curated image
const getCuratedImage = (placeName) => {
  if (!placeName) return null;
  
  const normalized = placeName.toLowerCase().trim();
  
  // Direct match
  if (curatedImages[normalized]) {
    return curatedImages[normalized];
  }
  
  // Try variations
  const variations = [
    normalized.split(',')[0]?.trim(), // Part before comma
    normalized.split(' ')[0], // First word
    normalized.replace(/\s+(city|state|country)$/i, '') // Remove suffixes
  ].filter(Boolean);
  
  for (const variation of variations) {
    if (curatedImages[variation]) {
      return curatedImages[variation];
    }
  }
  
  // Partial matches
  for (const [key, imageUrl] of Object.entries(curatedImages)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return imageUrl;
    }
  }
  
  return null;
};

export const usePlacePhoto = (placeName) => {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlacePhoto = useCallback(async (place) => {
    if (!place) {
      setPhotoUrl('https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
      return;
    }

    const cacheKey = place.toLowerCase().trim();
    
    // Check cache first
    if (photoCache.has(cacheKey)) {
      setPhotoUrl(photoCache.get(cacheKey));
      return;
    }

    // Check curated images first (same as Destinations tab)
    const curatedImage = getCuratedImage(place);
    if (curatedImage) {
      photoCache.set(cacheKey, curatedImage);
      setPhotoUrl(curatedImage);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await tripService.getPlacePhoto(place);
      
      if (response.success && response.photoUrl) {
        photoCache.set(cacheKey, response.photoUrl);
        setPhotoUrl(response.photoUrl);
      } else {
        // Use high-quality fallback
        const fallbackUrl = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        photoCache.set(cacheKey, fallbackUrl);
        setPhotoUrl(fallbackUrl);
      }
    } catch (err) {
      setError(err.message);
      
      // Use high-quality fallback on error
      const fallbackUrl = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      photoCache.set(cacheKey, fallbackUrl);
      setPhotoUrl(fallbackUrl);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlacePhoto(placeName);
  }, [placeName, fetchPlacePhoto]);

  return { photoUrl, loading, error, refetch: () => fetchPlacePhoto(placeName) };
};

export const usePlacePhotos = (places) => {
  const [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlacePhotos = useCallback(async (placeList) => {
    if (!placeList || placeList.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let newPhotos = {};

      // Get cached photos and curated images first
      placeList.forEach(place => {
        const cacheKey = place.toLowerCase().trim();
        if (photoCache.has(cacheKey)) {
          newPhotos[place] = photoCache.get(cacheKey);
        } else {
          // Check for curated image
          const curatedImage = getCuratedImage(place);
          if (curatedImage) {
            photoCache.set(cacheKey, curatedImage);
            newPhotos[place] = curatedImage;
          }
        }
      });

      // Fetch uncached photos for places without curated images
      const placesToFetch = placeList.filter(place => !newPhotos[place]);
      
      if (placesToFetch.length > 0) {
        const response = await tripService.getPlacePhotos(placesToFetch);
        
        if (response.success && response.photos) {
          response.photos.forEach(({ placeName, photoUrl }) => {
            const cacheKey = placeName.toLowerCase().trim();
            photoCache.set(cacheKey, photoUrl);
            newPhotos[placeName] = photoUrl;
          });
        }
      }

      // Set high-quality fallbacks for any missing photos
      placeList.forEach(place => {
        if (!newPhotos[place]) {
          const fallbackUrl = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
          const cacheKey = place.toLowerCase().trim();
          photoCache.set(cacheKey, fallbackUrl);
          newPhotos[place] = fallbackUrl;
        }
      });

      setPhotos(newPhotos);
    } catch (err) {
      setError(err.message);
      
      // Set high-quality fallbacks for all places on error
      const fallbackPhotos = {};
      placeList.forEach(place => {
        const curatedImage = getCuratedImage(place);
        fallbackPhotos[place] = curatedImage || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
      });
      setPhotos(fallbackPhotos);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlacePhotos(places);
  }, [places, fetchPlacePhotos]);

  return { photos, loading, error, refetch: () => fetchPlacePhotos(places) };
};
