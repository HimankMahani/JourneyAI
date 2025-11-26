import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTripContext } from '@/contexts/useTripContext';

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
      location: activity.location || { name: activity.location || 'TBD' },
      isFavorited: typeof activity.isFavorited === 'boolean'
        ? activity.isFavorited
        : (typeof activity.isFavorite === 'boolean' ? activity.isFavorite : false),
      notes: activity.notes || ''
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
  
  return destination ? destination.id : null;
};

// Function to get pre-generated itinerary for a destination
const getPreGeneratedItinerary = (destinationName) => {
  const destinationId = getDestinationId(destinationName);
  return destinationId ? preGeneratedItineraries[destinationId] : null;
};

const Planning = () => {
  const { tripId } = useParams(); // Get trip ID from URL
  const { currentTrip, fetchTripById, regenerateTripItinerary, updateItineraryActivity, updateTrip } = useTripContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('itinerary');
  // Packing list is now managed inside PackingTab; no external checked state required
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [packingList, setPackingList] = useState(null);
  const [destinationInfo, setDestinationInfo] = useState(null);
  const [weather, setWeather] = useState(null);
  const previousItineraryRef = useRef(null);

  // Clear local state when tripId changes to prevent showing stale data
  useEffect(() => {
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
        setIsLoading(true);
        fetchTripById(tripId)
          .then(fetchedTrip => {
            if (fetchedTrip) {
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

  useEffect(() => {
    // Only process currentTrip if we're not loading and it matches the requested tripId
    if (currentTrip && !isLoading) {
      
      const currentTripId = currentTrip._id || currentTrip.id;
      const tripIdsMatch = !tripId || currentTripId === tripId;
      
      if (tripIdsMatch) {
        setTrip(normalizeTrip(currentTrip));
        
        // If trip has itinerary, use it; otherwise fall back to pre-generated or mock data
        if (currentTrip.itinerary && Array.isArray(currentTrip.itinerary) && currentTrip.itinerary.length > 0) {
          const normalizedItinerary = normalizeItinerary(currentTrip.itinerary);
          setItinerary(normalizedItinerary);
        } else {
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
        // Don't use mismatched trip data - let the fetch effect handle it
      }
    } else if (!tripId && !currentTrip) {
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
      if (city) {
        weatherService.getCurrentWeather({ city })
          .then(weatherData => {
            setWeather(weatherData);
          })
          .catch(err => {
            console.error('Planning: Failed to fetch weather:', err);
            setWeather(null);
          });
      }
    }
  }, [trip]);

  // (Removed) togglePackingItem; internalized into PackingTab

  useEffect(() => {
    const itineraryChanged = itinerary && previousItineraryRef.current !== itinerary;

    if (!isRegenerating && !isLoading && itineraryChanged) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (itineraryChanged) {
      previousItineraryRef.current = itinerary;
    }
  }, [itinerary, isRegenerating, isLoading]);

  const applyItineraryChanges = (dayIndex, activityIndex, changes) => {
    setItinerary(prevItinerary => {
      if (!prevItinerary) return prevItinerary;

      const updatedItinerary = prevItinerary.map((day, idx) => {
        if (idx !== dayIndex) return day;

        const updatedActivities = (day.activities || []).map((activity, actIdx) => (
          actIdx === activityIndex ? { ...activity, ...changes } : activity
        ));

        return {
          ...day,
          activities: updatedActivities
        };
      });

      setTrip(prevTrip => (prevTrip ? { ...prevTrip, itinerary: updatedItinerary } : prevTrip));
      return updatedItinerary;
    });
  };

  const handleToggleFavoriteActivity = async (dayIndex, activityIndex, isFavorited) => {
    const previousValue = itinerary?.[dayIndex]?.activities?.[activityIndex]?.isFavorited || false;
    applyItineraryChanges(dayIndex, activityIndex, { isFavorited });

    if (!currentTrip?._id) {
      return true;
    }

    const response = await updateItineraryActivity(currentTrip._id, dayIndex, activityIndex, { isFavorited });

    if (response.success && response.trip) {
      setTrip(normalizeTrip(response.trip));
      setItinerary(normalizeItinerary(response.trip.itinerary));
      return true;
    }

    applyItineraryChanges(dayIndex, activityIndex, { isFavorited: previousValue });
    toast.error(response.error || 'Failed to update favorite');
    return false;
  };

  const handleNotesChange = async (dayIndex, activityIndex, note) => {
    const previousValue = itinerary?.[dayIndex]?.activities?.[activityIndex]?.notes || '';
    applyItineraryChanges(dayIndex, activityIndex, { notes: note });

    if (!currentTrip?._id) {
      return true;
    }

    const response = await updateItineraryActivity(currentTrip._id, dayIndex, activityIndex, { notes: note });

    if (response.success && response.trip) {
      setTrip(normalizeTrip(response.trip));
      setItinerary(normalizeItinerary(response.trip.itinerary));
      return true;
    }

    applyItineraryChanges(dayIndex, activityIndex, { notes: previousValue });
    toast.error(response.error || 'Failed to save note');
    return false;
  };

  const handlePackingListUpdate = async (newPackingList) => {
    setPackingList(newPackingList); // Optimistic update
    
    if (currentTrip?._id) {
      try {
        await updateTrip(currentTrip._id, { packingList: newPackingList });
      } catch (error) {
        console.error('Failed to update packing list:', error);
        toast.error('Failed to save packing list');
      }
    }
  };

  const handleRegenerateItinerary = async () => {
    if (!currentTrip || !currentTrip._id) {
      toast.error("No trip selected to regenerate");
      return;
    }
    
    setIsRegenerating(true);
    
    try {
      // Gather interests from any notes the user has added
      const interests = [];
      (itinerary || []).forEach(day => {
        (day.activities || []).forEach(activity => {
          if (activity?.notes) {
            const words = activity.notes.toLowerCase().split(/\s+/);
            interests.push(...words.filter(word => word.length > 3));
          }
        });
      });
      
      // Call the regenerate function with the trip ID and optional preferences
      const result = await regenerateTripItinerary(currentTrip._id, { 
        interests: Array.from(new Set(interests)) // Remove duplicates
      });
      
      if (result.success) {
        // Handle different response structures from TripContext
        const updatedTrip = result.data || result.trip || currentTrip;
        
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
              onToggleFavorite={handleToggleFavoriteActivity}
              onNotesChange={handleNotesChange}
            />
          )}

          {/* Packing Tab */}
          {activeTab === 'packing' && (
            <PackingTab 
              packingList={packingList} 
              onUpdate={handlePackingListUpdate}
            />
          )}

          {/* Destination Info Tab */}
          {activeTab === 'destination' && (
            <DestinationInfoTab 
              destinationInfo={destinationInfo}
              weather={weather}
              trip={trip}
              tripData={trip}
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
