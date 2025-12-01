import { useState, useEffect, useCallback } from 'react';
import { tripService } from '../services/api';

// In-memory cache for place photos
const photoCache = new Map();

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

      // Get cached photos first
      placeList.forEach(place => {
        const cacheKey = place.toLowerCase().trim();
        if (photoCache.has(cacheKey)) {
          newPhotos[place] = photoCache.get(cacheKey);
        }
      });

      // Fetch uncached photos
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
        fallbackPhotos[place] = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
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
