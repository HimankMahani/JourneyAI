import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '@/contexts/useTrip';

// Import individual components directly
import TripHeader from '@/components/planning/TripHeader';
import TabNavigation from '@/components/planning/TabNavigation';
import ItineraryTab from '@/components/planning/tabs/ItineraryTab';
import PackingTab from '@/components/planning/tabs/PackingTab';
import DestinationInfoTab from '@/components/planning/tabs/DestinationInfoTab';
import OverviewTab from '@/components/planning/tabs/OverviewTab';
import { toast } from 'sonner';
import { preGeneratedItineraries } from '@/data/preGeneratedItineraries';

// Use mock data as fallback or for development
import {
  selectedTrip as mockTrip,
  itinerary as mockItinerary,
  packingList as mockPackingList,
  destinationInfo as mockDestinationInfo,
  travelTimeline,
  budgetBreakdown,
  documentChecklist,
  emergencyContacts,
  weatherOverview
} from '@/data/tripData';

// Utility function to ensure itinerary has proper structure
const normalizeItinerary = (itinerary) => {
  if (!itinerary || !Array.isArray(itinerary)) {
    return itinerary;
  }
  
  return itinerary.map(day => ({
    ...day,
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
  
  const [isLoading, setIsLoading] = useState(true);
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
  const [tripLoaded, setTripLoaded] = useState(false);

  const loadTrip = useCallback(async (tripId) => {
    console.log('Planning: Loading trip with ID:', tripId);
    
    // First check if currentTrip already matches the requested tripId
    if (currentTrip && (currentTrip._id === tripId || currentTrip.id === tripId)) {
      console.log('Planning: Using existing currentTrip, no fetch needed');
      setTripLoaded(true);
      setIsLoading(false);
      return currentTrip;
    }
    
    setIsLoading(true);
    try {
      const fetchedTrip = await fetchTripById(tripId);
      console.log('Planning: Trip loaded successfully:', fetchedTrip);
      if (fetchedTrip) {
        console.log('Planning: Trip itinerary structure:', fetchedTrip.itinerary);
        if (fetchedTrip.itinerary) {
          console.log('Planning: First activity in itinerary:', fetchedTrip.itinerary[0]?.activities[0]);
        }
        setTripLoaded(true);
        return fetchedTrip;
      } else {
        console.error('Planning: fetchTripById returned null');
        toast.error('Trip not found');
        return null;
      }
    } catch (error) {
      console.error('Planning: Failed to load trip:', error);
      toast.error('Failed to load trip details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTripById, currentTrip]);

  useEffect(() => {
    // Only fetch if we have a tripId, don't have a matching currentTrip, and haven't loaded this trip yet
    if (tripId && !tripLoaded) {
      // Check if currentTrip already matches
      if (currentTrip && (currentTrip._id === tripId || currentTrip.id === tripId)) {
        console.log('Planning: currentTrip already matches tripId, no fetch needed');
        setTripLoaded(true);
        setIsLoading(false);
      } else {
        console.log('Planning: Need to fetch trip, currentTrip does not match tripId');
        loadTrip(tripId);
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
        setTrip(fallbackTrip);
        setPackingList(mockPackingList);
        setDestinationInfo(mockDestinationInfo);
        setIsLoading(false);
        setTripLoaded(true);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [tripId, tripLoaded, loadTrip, isLoading, currentTrip]);
  
  useEffect(() => {
    console.log('Planning: currentTrip changed:', currentTrip);
    console.log('Planning: tripId:', tripId);
    
    // Use backend data if available, otherwise fall back to mock data
    if (currentTrip) {
      console.log('Planning: Using currentTrip data');
      console.log('Planning: currentTrip.itinerary:', currentTrip.itinerary);
      
      // Check if currentTrip matches the requested tripId
      if (tripId && (currentTrip._id === tripId || currentTrip.id === tripId)) {
        console.log('Planning: currentTrip matches requested tripId, using directly');
        setTrip(currentTrip);
        
        // If trip has itinerary, use it; otherwise fall back to mock data
        if (currentTrip.itinerary && Array.isArray(currentTrip.itinerary) && currentTrip.itinerary.length > 0) {
          console.log('Planning: Using real itinerary from trip');
          setItinerary(normalizeItinerary(currentTrip.itinerary));
        } else {
          console.log('Planning: Trip has no itinerary, checking for pre-generated itinerary');
          
          // Try to get pre-generated itinerary for this destination
          const destinationName = currentTrip.destination?.name || currentTrip.destination || '';
          console.log('Planning: Destination name from trip:', destinationName);
          
          const preGeneratedItinerary = getPreGeneratedItinerary(destinationName);
          console.log('Planning: Pre-generated itinerary found:', !!preGeneratedItinerary);
          
          if (preGeneratedItinerary) {
            console.log('Planning: Using pre-generated itinerary for:', destinationName);
            console.log('Planning: Pre-generated itinerary has', preGeneratedItinerary.itinerary.length, 'days');
            setItinerary(normalizeItinerary(preGeneratedItinerary.itinerary));
            
            // Show a toast about using pre-generated itinerary
            setTimeout(() => {
              toast.success(`Using pre-planned itinerary for ${destinationName}!`, {
                duration: 5000
              });
            }, 1000);
          } else {
            console.log('Planning: No pre-generated itinerary found, using mock data');
            setItinerary(normalizeItinerary(mockItinerary));
            
            // Show a toast suggesting to generate itinerary for this trip
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
        setTripLoaded(true);
      } else if (!tripId) {
        console.log('Planning: No tripId provided, using currentTrip');
        // No tripId but we have currentTrip, use it
        setTrip(currentTrip);
        
        if (currentTrip.itinerary && Array.isArray(currentTrip.itinerary) && currentTrip.itinerary.length > 0) {
          setItinerary(normalizeItinerary(currentTrip.itinerary));
        } else {
          // Try to get pre-generated itinerary for this destination
          const destinationName = currentTrip.destination?.name || currentTrip.destination || '';
          const preGeneratedItinerary = getPreGeneratedItinerary(destinationName);
          
          if (preGeneratedItinerary) {
            console.log('Planning: Using pre-generated itinerary for:', destinationName);
            setItinerary(normalizeItinerary(preGeneratedItinerary.itinerary));
          } else {
            console.log('Planning: No pre-generated itinerary found, using mock data');
            setItinerary(normalizeItinerary(mockItinerary));
          }
        }
        
        setPackingList(currentTrip.packingList || mockPackingList);
        setDestinationInfo(currentTrip.destinationInfo || mockDestinationInfo);
        setIsLoading(false);
        setTripLoaded(true);
      }
    } else if (!tripId) {
      console.log('Planning: Using mock data (no tripId and no currentTrip)');
      // Only use mock data if there's no tripId and no currentTrip
      setTrip(mockTrip);
      setItinerary(normalizeItinerary(mockItinerary));
      setPackingList(mockPackingList);
      setDestinationInfo(mockDestinationInfo);
      setIsLoading(false);
      setTripLoaded(true);
    }
  }, [currentTrip, tripId]);

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
      
      if (result.success) {
        // Update the local state with the new data
        setTrip(result.data);
        setItinerary(normalizeItinerary(result.data.itinerary) || normalizeItinerary(mockItinerary));
        toast.success("Itinerary regenerated successfully!");
        // Switch to the itinerary tab to show the new plan
        setActiveTab('itinerary');
      } else {
        toast.error(result.error || "Failed to regenerate itinerary");
      }
    } catch (error) {
      console.error("Error regenerating itinerary:", error);
      toast.error("An error occurred while regenerating the itinerary");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
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
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
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
            <DestinationInfoTab destinationInfo={destinationInfo} />
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <OverviewTab 
              travelTimeline={travelTimeline}
              budgetBreakdown={budgetBreakdown}
              documentChecklist={documentChecklist}
              emergencyContacts={emergencyContacts}
              weatherOverview={weatherOverview}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Planning;
