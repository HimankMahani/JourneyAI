import { createContext, useState, useEffect, useCallback } from 'react';
import { tripService } from '@/services/api';
import { useAuth } from './useAuth';
import { preGeneratedItineraries } from '@/data/preGeneratedItineraries';

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
      setTrips(prev => prev.filter(trip => trip._id !== tripId));
      if (currentTrip?._id === tripId) {
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
      const response = await tripService.generateAIItinerary(preferences);
      
      // Handle different response structures:
      // 1. { success: true, data: { ...tripData } } - current format
      // 2. { success: true, trip: { ...tripData } } - previous format
      // 3. Direct trip object
      const trip = response.data || response.trip || response;
      
      // Immediately set the generated trip as current trip to avoid fetch issues
      if (trip) {
        setCurrentTrip(trip);
        
        // Also add to trips list if not already there
        setTrips(prev => {
          const exists = prev.some(t => t._id === trip._id);
          if (!exists) {
            return [...prev, trip];
          }
          return prev;
        });
        
        return { success: true, trip };
      }
      
      return { success: true, data: trip };
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

  const updateItineraryActivity = useCallback(async (tripId, dayIndex, activityIndex, updates) => {
    try {
      const response = await tripService.updateItineraryActivity(tripId, {
        dayIndex,
        activityIndex,
        updates
      });

      const updatedTrip = response.trip || response.data || response;

      if (updatedTrip) {
        setTrips(prev => prev.map(trip => (trip._id === updatedTrip._id ? updatedTrip : trip)));
        if (currentTrip?._id === updatedTrip._id) {
          setCurrentTrip(updatedTrip);
        }
      }

      return { success: true, trip: updatedTrip };
    } catch (err) {
      console.error('Error updating itinerary activity:', err);
      return { success: false, error: err.message || 'Failed to update activity' };
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

  const getAIResponses = useCallback(async (tripId, type = null) => {
    try {
      const response = await tripService.getAIResponses(tripId, type);
      return { success: true, data: response };
    } catch (err) {
      console.error('Error getting AI responses:', err);
      return { success: false, error: err.message || 'Failed to get AI responses' };
    }
  }, []);

  const createTripFromDestination = useCallback(async (destinationData) => {
    try {
      setLoading(true);
      
      // Check if we have a pre-generated itinerary for this destination
      const preGeneratedItinerary = preGeneratedItineraries[destinationData.id];
      
      if (preGeneratedItinerary) {
        // Use pre-generated itinerary
        const tripData = {
          destination: destinationData.destination,
          budget: destinationData.budget,
          travelers: 2, // Default
          duration: parseInt(preGeneratedItinerary.duration.split(' ')[0]), // Extract number from "7 days"
          title: `Trip to ${destinationData.destination}`,
          status: 'planning',
          itinerary: preGeneratedItinerary.itinerary,
          estimatedCost: preGeneratedItinerary.budget,
          generatedBy: 'pre-generated'
        };
        
        // Create trip with pre-generated itinerary
        const newTrip = await tripService.createTrip(tripData);
        setTrips(prev => [...prev, newTrip]);
        return newTrip;
      } else {
        // Fallback to AI generation for destinations without pre-generated itineraries
        const basicTripData = {
          destination: destinationData.destination,
          budget: destinationData.budget,
          travelers: 2, // Default
          duration: 7, // Default
          title: `Trip to ${destinationData.destination}`,
          status: 'planning'
        };
        
        const tripResult = await createTrip(basicTripData);
        
        if (!tripResult.success) {
          throw new Error(tripResult.error);
        }
        
        const newTrip = tripResult.data;
        
        // Generate AI itinerary for this destination
        const aiPreferences = {
          destination: destinationData.destination,
          budget: destinationData.budget,
          travelers: 2,
          duration: 7,
          activities: destinationData.activities || [],
          description: destinationData.description,
          rating: destinationData.rating
        };
        
        // Generate the itinerary
        const itineraryResult = await generateAIItinerary(aiPreferences);
        
        if (itineraryResult.success && itineraryResult.data.trip) {
          // Return the updated trip with itinerary
          return itineraryResult.data.trip;
        } else {
          // Return the basic trip even if itinerary generation fails
          console.warn('Itinerary generation failed, returning basic trip');
          return newTrip;
        }
      }
      
    } catch (err) {
      console.error('Error creating trip from destination:', err);
      throw new Error(err.message || 'Failed to create trip from destination');
    } finally {
      setLoading(false);
    }
  }, [createTrip, generateAIItinerary]);

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
    getAIResponses,
    createTripFromDestination,
    updateItineraryActivity
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export default TripContext;
