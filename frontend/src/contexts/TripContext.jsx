import { createContext, useState, useEffect, useCallback } from 'react';
import { tripService } from '@/services/api';
import { useAuth } from './useAuth';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchAllTrips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tripService.getAllTrips();
      setTrips(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTripById = useCallback(async (tripId) => {
    try {
      setLoading(true);
      const data = await tripService.getTripById(tripId);
      setCurrentTrip(data);
      setError(null);
      return data;
    } catch (err) {
      console.error(`Error fetching trip ${tripId}:`, err);
      setError(err.message || 'Failed to load trip details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrip = useCallback(async (tripData) => {
    try {
      setLoading(true);
      const newTrip = await tripService.createTrip(tripData);
      setTrips(prev => [...prev, newTrip]);
      return { success: true, data: newTrip };
    } catch (err) {
      console.error('Error creating trip:', err);
      return { success: false, error: err.message || 'Failed to create trip' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTrip = useCallback(async (tripId, tripData) => {
    try {
      setLoading(true);
      const updatedTrip = await tripService.updateTrip(tripId, tripData);
      setTrips(prev => prev.map(trip => trip.id === tripId ? updatedTrip : trip));
      if (currentTrip?.id === tripId) {
        setCurrentTrip(updatedTrip);
      }
      return { success: true, data: updatedTrip };
    } catch (err) {
      console.error(`Error updating trip ${tripId}:`, err);
      return { success: false, error: err.message || 'Failed to update trip' };
    } finally {
      setLoading(false);
    }
  }, [currentTrip]);

  const deleteTrip = useCallback(async (tripId) => {
    try {
      setLoading(true);
      await tripService.deleteTrip(tripId);
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      if (currentTrip?.id === tripId) {
        setCurrentTrip(null);
      }
      return { success: true };
    } catch (err) {
      console.error(`Error deleting trip ${tripId}:`, err);
      return { success: false, error: err.message || 'Failed to delete trip' };
    } finally {
      setLoading(false);
    }
  }, [currentTrip]);

  const generateAIItinerary = useCallback(async (preferences) => {
    try {
      setLoading(true);
      const itinerary = await tripService.generateAIItinerary(preferences);
      
      // Immediately set the generated trip as current trip to avoid fetch issues
      if (itinerary && itinerary.trip) {
        setCurrentTrip(itinerary.trip);
        console.log('TripContext: Set generated trip as current trip:', itinerary.trip._id);
        
        // Also add to trips list if not already there
        setTrips(prev => {
          const existingTrip = prev.find(t => t._id === itinerary.trip._id);
          if (!existingTrip) {
            return [...prev, itinerary.trip];
          }
          return prev.map(t => t._id === itinerary.trip._id ? itinerary.trip : t);
        });
      }
      
      return { success: true, data: itinerary };
    } catch (err) {
      console.error('Error generating AI itinerary:', err);
      // Return more detailed error information
      return { 
        success: false, 
        error: err.message || 'Failed to generate itinerary',
        details: err.response?.data || {},
        statusCode: err.response?.status
      };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const regenerateTripItinerary = useCallback(async (tripId, preferences = {}) => {
    try {
      setLoading(true);
      const response = await tripService.regenerateTripItinerary(tripId, preferences);
      
      if (response.success && currentTrip?.id === tripId) {
        setCurrentTrip(response.trip);
      }
      
      return { success: true, data: response.trip };
    } catch (err) {
      console.error('Error regenerating trip itinerary:', err);
      return { success: false, error: err.message || 'Failed to regenerate itinerary' };
    } finally {
      setLoading(false);
    }
  }, [currentTrip]);

  const reparseItinerary = useCallback(async (tripId) => {
    try {
      setLoading(true);
      const response = await tripService.reparseItinerary(tripId);
      
      if (response.success && currentTrip?.id === tripId) {
        setCurrentTrip(response.trip);
      }
      
      return { success: true, data: response.trip };
    } catch (err) {
      console.error('Error reparsing trip itinerary:', err);
      return { success: false, error: err.message || 'Failed to reparse itinerary' };
    } finally {
      setLoading(false);
    }
  }, [currentTrip]);

  const getStorageStats = useCallback(async () => {
    try {
      const response = await tripService.getStorageStats();
      return { success: true, data: response.stats };
    } catch (err) {
      console.error('Error getting storage stats:', err);
      return { success: false, error: err.message || 'Failed to get storage stats' };
    }
  }, []);

  const getAIResponseFiles = useCallback(async (tripId, type = null) => {
    try {
      const response = await tripService.getAIResponseFiles(tripId, type);
      return { success: true, data: response };
    } catch (err) {
      console.error('Error getting AI response files:', err);
      return { success: false, error: err.message || 'Failed to get AI response files' };
    }
  }, []);

  // useEffect should come after all function definitions to avoid reference errors
  useEffect(() => {
    // Check if we're in test mode
    const isTestMode = window.location.search.includes('test=true') || 
                      localStorage.getItem('testMode') === 'true';
    
    if (isAuthenticated || isTestMode) {
      fetchAllTrips();
    } else {
      setTrips([]);
      setCurrentTrip(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchAllTrips]);

  const value = {
    trips,
    currentTrip,
    loading,
    error,
    fetchAllTrips,
    fetchTripById,
    createTrip,
    updateTrip,
    deleteTrip,
    generateAIItinerary,
    regenerateTripItinerary,
    reparseItinerary,
    getStorageStats,
    getAIResponseFiles
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export default TripContext;
