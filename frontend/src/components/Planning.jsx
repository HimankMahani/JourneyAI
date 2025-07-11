import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '@/contexts/useTrip';

// Import individual components directly
import TripHeader from '@/components/planning/TripHeader';
import TabNavigation from '@/components/planning/TabNavigation';
import ItineraryTab from '@/components/planning/tabs/ItineraryTab';
import PackingTab from '@/components/planning/tabs/PackingTab';
import DestinationInfoTab from '@/components/planning/tabs/DestinationInfoTab';
import { TripGenerationLoader } from '@/components/ui/PlanningPageSkeleton';
import { toast } from 'sonner';
import { preGeneratedItineraries } from '@/data/preGeneratedItineraries';
import { weatherService } from '@/services/api';

// Use mock data as fallback or for development
import {
  selectedTrip as mockTrip,
  itinerary as mockItinerary,
  packingList as mockPackingList,
  destinationInfo as mockDestinationInfo
} from '@/data/tripData';

// Utility function to ensure itinerary has proper structure
const normalizeItinerary = (itinerary) => {
  if (!itinerary || !Array.isArray(itinerary)) {
    return itinerary;
  }
  
  return itinerary.map(day => ({
    ...day,
    // Format the date properly
    date: day.date ? formatDate(day.date) : `Day ${day.day}`,
    activities: (day.activities || []).map(activity => ({
      title: activity.title || activity.name || activity.activity || 'Activity',
      description: activity.description || '',
      type: activity.type || activity.category || 'activity',
      time: activity.time || activity.startTime || '09:00',
      duration: activity.duration || '1 hour',
      cost: activity.cost || 0, // Keep as number for TripHeader to handle
      location: activity.location || { name: activity.location || 'TBD' }
    }))
  }));
};

// Utility function to format dates properly
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    // Check if it's a valid date
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if error
  }
};

// Utility function to ensure trip has proper structure
const normalizeTrip = (trip) => {
  if (!trip) return trip;
  
  return {
    ...trip,
    // Ensure travelers is a number
    travelers: parseInt(trip.travelers || trip.travellers || trip.numberOfTravelers || trip.numTravelers || 1, 10),
    // Ensure dates are properly formatted
    startDate: trip.startDate || trip.dates?.start || trip.dates?.startDate,
    endDate: trip.endDate || trip.dates?.end || trip.dates?.endDate,
    // Ensure destination is properly formatted
    destination: typeof trip.destination === 'string' 
      ? { name: trip.destination } 
      : trip.destination || { name: 'Unknown Destination' },
    // Ensure budget is properly formatted
    budget: typeof trip.budget === 'string'
      ? { amount: parseInt(trip.budget.replace(/[^\d]/g, ''), 10) || 0, currency: '₹' }
      : trip.budget || { amount: 0, currency: '₹' }
  };
};

// Function to get destination ID from destination name
const getDestinationId = (destinationName) => {
  console.log('Planning: Looking for destination ID for:', destinationName);
  
  const destinations = [
    { id: 1, name: 'Bali, Indonesia' },
    { id: 2, name: 'Santorini, Greece' },
    { id: 3, name: 'Kyoto, Japan' },
    { id: 4, name: 'Amalfi Coast, Italy' },
    { id: 5, name: 'Rajasthan, India' },
    { id: 6, name: 'Machu Picchu, Peru' },
    { id: 7, name: 'Maldives' },
    { id: 8, name: 'New Zealand' },
    { id: 9, name: 'Paris, France' },
    { id: 10, name: 'Tokyo, Japan' },
    { id: 11, name: 'Dubai, UAE' },
    { id: 12, name: 'Iceland' }
  ];
  
  const destination = destinations.find(d => 
    d.name.toLowerCase() === destinationName.toLowerCase() ||
    destinationName.toLowerCase().includes(d.name.toLowerCase()) ||
    d.name.toLowerCase().includes(destinationName.toLowerCase())
  );
  
  console.log('Planning: Found destination:', destination);
  return destination ? destination.id : null;
};

// Function to get pre-generated itinerary for a destination
const getPreGeneratedItinerary = (destinationName) => {
  const destinationId = getDestinationId(destinationName);
  return destinationId ? preGeneratedItineraries[destinationId] : null;
};

const Planning = () => {
  const { tripId } = useParams(); // Get trip ID from URL
  const { currentTrip, fetchTripById, regenerateTripItinerary } = useTrip();
  
  console.log('Planning: Component loaded with tripId:', tripId);
  console.log('Planning: currentTrip available:', !!currentTrip);
  if (currentTrip) {
    console.log('Planning: currentTrip ID:', currentTrip._id || currentTrip.id);
    console.log('Planning: currentTrip has itinerary:', !!(currentTrip.itinerary && currentTrip.itinerary.length > 0));
  }
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [checkedItems, setCheckedItems] = useState({});
  const [favoriteActivities, setFavoriteActivities] = useState({});
  const [notes, setNotes] = useState({});
  const [showNoteForm, setShowNoteForm] = useState({});
  const [showSuggestions, setShowSuggestions] = useState({});
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [packingList, setPackingList] = useState(null);
  const [destinationInfo, setDestinationInfo] = useState(null);
  const [weather, setWeather] = useState(null);

  // Clear local state when tripId changes to prevent showing stale data
  useEffect(() => {
    console.log('Planning: tripId changed, clearing local state');
    setTrip(null);
    setItinerary(null);
    setPackingList(null);
    setDestinationInfo(null);
    setWeather(null);
  }, [tripId]);

  // Handle initial trip loading when tripId is provided but currentTrip is not set or doesn't match
  useEffect(() => {
    if (tripId && !isLoading) {
      const currentTripId = currentTrip?._id || currentTrip?.id;
      const tripIdsMatch = currentTripId === tripId;
      
      // If we have a tripId but no currentTrip OR currentTrip doesn't match, fetch the trip
      if (!currentTrip || !tripIdsMatch) {
        console.log('Planning: Need to fetch trip - tripId:', tripId, 'currentTripId:', currentTripId, 'match:', tripIdsMatch);
        setIsLoading(true);
        fetchTripById(tripId)
          .then(fetchedTrip => {
            if (fetchedTrip) {
              console.log('Planning: Successfully fetched trip:', fetchedTrip);
              // The context should update currentTrip automatically
            } else {
              console.error('Planning: Failed to fetch trip');
              toast.error('Trip not found');
              // Fall back to mock data
              setTrip(normalizeTrip(mockTrip));
              setItinerary(normalizeItinerary(mockItinerary));
              setPackingList(mockPackingList);
              setDestinationInfo(mockDestinationInfo);
            }
          })
          .catch(error => {
            console.error('Planning: Error fetching trip:', error);
            toast.error('Failed to load trip details');
            // Fall back to mock data
            setTrip(normalizeTrip(mockTrip));
            setItinerary(normalizeItinerary(mockItinerary));
            setPackingList(mockPackingList);
            setDestinationInfo(mockDestinationInfo);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, [tripId, currentTrip, isLoading, fetchTripById]);

  /*
  useEffect(() => {
    // Only fetch if we have a tripId, don't have a matching currentTrip, and haven't loaded this trip yet
    if (tripId && !tripLoaded) {
      // Check if currentTrip already matches AND has itinerary data
      if (currentTrip && (currentTrip._id === tripId || currentTrip.id === tripId)) {
        const hasItinerary = currentTrip.itinerary && Array.isArray(currentTrip.itinerary) && currentTrip.itinerary.length > 0;
        
        if (hasItinerary) {
          console.log('Planning: currentTrip already matches tripId with itinerary, no fetch needed');
          setTripLoaded(true);
          setIsLoading(false);
        } else {
          console.log('Planning: currentTrip matches tripId but has no itinerary, fetching fresh data');
          // Inline the loadTrip logic to avoid circular dependency
          setIsLoading(true);
          setTripLoaded(true); // Set this immediately to prevent race conditions
          fetchTripById(tripId)
            .then(fetchedTrip => {
              if (fetchedTrip) {
                console.log('Planning: Successfully fetched trip with itinerary');
              } else {
                console.error('Planning: fetchTripById returned null');
                toast.error('Trip not found');
              }
            })
            .catch(error => {
              console.error('Planning: Failed to load trip:', error);
              toast.error('Failed to load trip details');
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      } else {
        console.log('Planning: Need to fetch trip, currentTrip does not match tripId');
        // Inline the loadTrip logic to avoid circular dependency
        setIsLoading(true);
        setTripLoaded(true); // Set this immediately to prevent race conditions
        fetchTripById(tripId)
          .then(fetchedTrip => {
            if (fetchedTrip) {
              console.log('Planning: Successfully fetched trip with itinerary');
            } else {
              console.error('Planning: fetchTripById returned null');
              toast.error('Trip not found');
            }
          })
          .catch(error => {
            console.error('Planning: Failed to load trip:', error);
            toast.error('Failed to load trip details');
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading && !currentTrip && !tripLoaded) {
        console.log('Planning: Loading timeout, using fallback data');
        
        // Try to determine the destination from URL or use mock data
        const urlPath = window.location.pathname;
        let fallbackItinerary = mockItinerary;
        let fallbackTrip = mockTrip;
        
        // If we're in a planning page, try to extract destination info from URL context
        if (urlPath.includes('/planning/')) {
          // For now, use mock data, but in future could extract from localStorage or other sources
          fallbackItinerary = mockItinerary;
          fallbackTrip = mockTrip;
        }
        
        setItinerary(normalizeItinerary(fallbackItinerary));
        setTrip(normalizeTrip(fallbackTrip));
        setPackingList(mockPackingList);
        setDestinationInfo(mockDestinationInfo);
        setIsLoading(false);
        setTripLoaded(true);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [tripId, tripLoaded, isLoading, currentTrip, fetchTripById]);
  */

  useEffect(() => {
    // Only process currentTrip if we're not loading and it matches the requested tripId
    if (currentTrip && !isLoading) {
      console.log('Planning: Processing currentTrip data');
      console.log('Planning: currentTrip:', currentTrip);
      console.log('Planning: currentTrip.itinerary:', currentTrip.itinerary);
      
      const currentTripId = currentTrip._id || currentTrip.id;
      const tripIdsMatch = !tripId || currentTripId === tripId;
      
      if (tripIdsMatch) {
        console.log('Planning: currentTrip matches requested tripId (or no tripId), using directly');
        setTrip(normalizeTrip(currentTrip));
        
        // If trip has itinerary, use it; otherwise fall back to pre-generated or mock data
        if (currentTrip.itinerary && Array.isArray(currentTrip.itinerary) && currentTrip.itinerary.length > 0) {
          console.log('Planning: Using real itinerary from trip');
          console.log('Planning: Raw itinerary:', currentTrip.itinerary);
          const normalizedItinerary = normalizeItinerary(currentTrip.itinerary);
          console.log('Planning: Normalized itinerary:', normalizedItinerary);
          setItinerary(normalizedItinerary);
        } else {
          console.log('Planning: Trip has no itinerary, using fallback');
          // Try to get pre-generated itinerary for this destination
          const destinationName = currentTrip.destination?.name || currentTrip.destination || '';
          const preGeneratedItinerary = getPreGeneratedItinerary(destinationName);
          
          if (preGeneratedItinerary) {
            setItinerary(normalizeItinerary(preGeneratedItinerary.itinerary));
            setTimeout(() => {
              toast.success(`Using pre-planned itinerary for ${destinationName}!`, {
                duration: 5000
              });
            }, 1000);
          } else {
            setItinerary(normalizeItinerary(mockItinerary));
            setTimeout(() => {
              toast.info('This trip doesn\'t have an AI-generated itinerary. Click "Regenerate" to create one!', {
                duration: 8000
              });
            }, 1000);
          }
        }
        
        setPackingList(currentTrip.packingList || mockPackingList);
        setDestinationInfo(currentTrip.destinationInfo || mockDestinationInfo);
        setIsLoading(false);
      } else {
        console.log('Planning: currentTrip does not match requested tripId, waiting for correct trip');
        console.log('Planning: tripId:', tripId, 'currentTripId:', currentTripId);
        // Don't use mismatched trip data - let the fetch effect handle it
      }
    } else if (!tripId && !currentTrip) {
      console.log('Planning: Using mock data (no tripId and no currentTrip)');
      // Only use mock data if there's no tripId and no currentTrip
      setTrip(normalizeTrip(mockTrip));
      setItinerary(normalizeItinerary(mockItinerary));
      setPackingList(mockPackingList);
      setDestinationInfo(mockDestinationInfo);
      setIsLoading(false);
    }
  }, [currentTrip, tripId, isLoading, fetchTripById]);

  useEffect(() => {
    // Fetch weather info when trip is loaded
    if (trip && trip.destination) {
      const city = typeof trip.destination === 'string' ? trip.destination : trip.destination.name;
      console.log('Planning: Fetching weather for city:', city);
      if (city) {
        weatherService.getCurrentWeather({ city })
          .then(weatherData => {
            console.log('Planning: Weather data received:', weatherData);
            setWeather(weatherData);
          })
          .catch(err => {
            console.error('Planning: Failed to fetch weather:', err);
            setWeather(null);
          });
      }
    }
  }, [trip]);

  const togglePackingItem = (category, index) => {
    const key = `${category}-${index}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFavoriteActivity = (day, index) => {
    const key = `day-${day}-activity-${index}`;
    setFavoriteActivities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addNote = (day, activityIndex, note) => {
    const key = `day-${day}-activity-${activityIndex}`;
    setNotes(prev => ({ ...prev, [key]: note }));
    setShowNoteForm(prev => ({ ...prev, [key]: false }));
  };

  const handleChangeRequest = (day, activityIndex, type) => {
    console.log(`Change request for Day ${day}, Activity ${activityIndex}, Type: ${type}`);
    // This would typically call an API to get alternative suggestions
    const key = `day-${day}-activity-${activityIndex}`;
    setShowSuggestions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRegenerateItinerary = async () => {
    if (!currentTrip || !currentTrip._id) {
      toast.error("No trip selected to regenerate");
      return;
    }
    
    setIsRegenerating(true);
    
    try {
      // Get interests from notes or favorites, if any
      const interests = Object.values(notes)
        .filter(note => note && typeof note === 'string')
        .map(note => {
          // Extract keywords from notes
          const words = note.toLowerCase().split(/\s+/);
          return words.filter(word => word.length > 3);
        })
        .flat();
      
      // Call the regenerate function with the trip ID and optional preferences
      const result = await regenerateTripItinerary(currentTrip._id, { 
        interests: Array.from(new Set(interests)) // Remove duplicates
      });
      
      console.log('Planning: Regenerate result:', result);
      
      if (result.success) {
        // Handle different response structures from TripContext
        const updatedTrip = result.data || result.trip || currentTrip;
        console.log('Planning: Updated trip from regenerate:', updatedTrip);
        
        if (updatedTrip) {
          // Update the local state with the new data
          setTrip(normalizeTrip(updatedTrip));
          
          // Check if the updated trip has an itinerary
          if (updatedTrip.itinerary && Array.isArray(updatedTrip.itinerary) && updatedTrip.itinerary.length > 0) {
            setItinerary(normalizeItinerary(updatedTrip.itinerary));
            toast.success("Itinerary regenerated successfully!");
          } else {
            // Fallback to mock data if no itinerary in response
            setItinerary(normalizeItinerary(mockItinerary));
            toast.success("Trip updated successfully! Using fallback itinerary.");
          }
          
          // Switch to the itinerary tab to show the new plan
          setActiveTab('itinerary');
        } else {
          console.error('Planning: No trip data in regenerate response');
          toast.error("Failed to get updated trip data");
        }
      } else {
        console.error('Planning: Regenerate failed:', result.error);
        toast.error(result.error || "Failed to regenerate itinerary");
      }
    } catch (error) {
      console.error("Error regenerating itinerary:", error);
      toast.error("An error occurred while regenerating the itinerary");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading || (tripId && !trip)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trip details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Trip Header */}
        <TripHeader 
          trip={trip || mockTrip} 
          onRegenerateClick={handleRegenerateItinerary}
          isRegenerating={isRegenerating}
        />

        {/* Tabs Section */}
        <div className="space-y-8">
          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          {/* Tab Content */}
          
          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && (
            <ItineraryTab 
              itinerary={itinerary}
              toggleFavoriteActivity={toggleFavoriteActivity}
              favoriteActivities={favoriteActivities}
              notes={notes}
              showNoteForm={showNoteForm}
              setShowNoteForm={setShowNoteForm}
              addNote={addNote}
              handleChangeRequest={handleChangeRequest}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
              onRegenerateItinerary={handleRegenerateItinerary}
              isRegenerating={isRegenerating}
            />
          )}

          {/* Packing Tab */}
          {activeTab === 'packing' && (
            <PackingTab 
              packingList={packingList}
              checkedItems={checkedItems}
              togglePackingItem={togglePackingItem}
            />
          )}

          {/* Destination Info Tab */}
          {activeTab === 'destination' && (
            <DestinationInfoTab 
              destinationInfo={destinationInfo}
              weather={weather}
              trip={trip}
            />
          )}
        </div>
      </div>
      
      {/* Show loader when regenerating */}
      {isRegenerating && <TripGenerationLoader />}
    </div>
  );
};

export default Planning;
