import { useState, useEffect, useCallback } from 'react';
import { tripService } from '../services/api';

export const usePlacePhoto = (placeName) => {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlacePhoto = useCallback(async (place) => {
    if (!place) {
      setPhotoUrl('https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await tripService.getPlacePhoto(place);
      
      if (response.success && response.photoUrl) {
        setPhotoUrl(response.photoUrl);
      } else {
        // Use high-quality fallback
        const fallbackUrl = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        setPhotoUrl(fallbackUrl);
      }
    } catch (err) {
      setError(err.message);
      
      // Use high-quality fallback on error
      const fallbackUrl = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
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
      const response = await tripService.getPlacePhotos(placeList);
      
      let newPhotos = {};
      if (response.success && response.photos) {
        response.photos.forEach(({ placeName, photoUrl }) => {
          newPhotos[placeName] = photoUrl;
        });
      }

      // Set high-quality fallbacks for any missing photos
      placeList.forEach(place => {
        if (!newPhotos[place]) {
          newPhotos[place] = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
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
