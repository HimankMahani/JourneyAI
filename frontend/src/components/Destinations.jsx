import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Calendar, ChevronRight, Filter, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTripContext } from '../contexts/useTripContext';
import { useAuth } from '../contexts/useAuth';
import { toast } from 'sonner';
import { preGeneratedItineraries } from '@/data/preGeneratedItineraries';

const destinations = [
  {
    id: 1,
    name: 'Bali, Indonesia',
    description: 'Explore temples, beaches, and lush rice terraces on this tropical paradise island.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    price: '₹75,000',
    activities: ['Beach', 'Culture', 'Nature'],
    duration: '7-10 days'
  },
  {
    id: 2,
    name: 'Santorini, Greece',
    description: 'Iconic white-washed buildings, stunning sunsets, and crystal-clear Mediterranean waters.',
    image: 'https://images.unsplash.com/photo-1469796466635-455ede028aca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    price: '₹1,10,000',
    activities: ['Culture', 'Food', 'Romance'],
    duration: '5-8 days'
  },
  {
    id: 3,
    name: 'Kyoto, Japan',
    description: 'Ancient temples, traditional tea houses, and picturesque gardens in Japan\'s cultural heart.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    price: '₹90,000',
    activities: ['Culture', 'History', 'Food'],
    duration: '6-9 days'
  },
  {
    id: 4,
    name: 'Amalfi Coast, Italy',
    description: 'Dramatic coastline, colorful cliffside villages, and incredible Italian cuisine.',
    image: 'https://images.unsplash.com/photo-1533165850316-2d0024c25091?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    price: '₹1,25,000',
    activities: ['Food', 'Romance', 'Nature'],
    duration: '7-10 days'
  },
  {
    id: 5,
    name: 'Rajasthan, India',
    description: 'Majestic forts, ornate palaces, and vibrant cities showcasing India\'s royal heritage.',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    price: '₹45,000',
    activities: ['Culture', 'History', 'Photography'],
    duration: '8-12 days'
  },
  {
    id: 6,
    name: 'Machu Picchu, Peru',
    description: 'Ancient Incan citadel set high in the Andes mountains, surrounded by cloud forests.',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    price: '₹1,50,000',
    activities: ['Adventure', 'History', 'Nature'],
    duration: '10-14 days'
  },
  {
    id: 7,
    name: 'Maldives',
    description: 'Pristine white beaches, overwater bungalows, and unparalleled marine life.',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    price: '₹1,80,000',
    activities: ['Beach', 'Relaxation', 'Romance'],
    duration: '5-8 days'
  },
  {
    id: 8,
    name: 'New Zealand',
    description: 'Dramatic landscapes from mountains and fjords to pristine lakes and lush forests.',
    image: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    price: '₹2,00,000',
    activities: ['Adventure', 'Nature', 'Photography'],
    duration: '12-16 days'
  },
  {
    id: 9,
    name: 'Paris, France',
    description: 'City of Light with iconic landmarks, world-class museums, and romantic atmosphere.',
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    price: '₹1,20,000',
    activities: ['Culture', 'Food', 'Romance'],
    duration: '5-7 days'
  },
  {
    id: 10,
    name: 'Tokyo, Japan',
    description: 'Modern metropolis blending ancient traditions with cutting-edge technology.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    price: '₹95,000',
    activities: ['Culture', 'Food', 'Technology'],
    duration: '6-8 days'
  },
  {
    id: 11,
    name: 'Dubai, UAE',
    description: 'Futuristic city with luxury shopping, modern architecture, and desert adventures.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    price: '₹85,000',
    activities: ['Luxury', 'Shopping', 'Adventure'],
    duration: '4-6 days'
  },
  {
    id: 12,
    name: 'Iceland',
    description: 'Land of fire and ice with stunning waterfalls, geysers, and Northern Lights.',
    image: 'https://images.unsplash.com/photo-1539066319246-4ae5e4ca9c97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    price: '₹1,40,000',
    activities: ['Nature', 'Adventure', 'Photography'],
    duration: '7-10 days'
  }
];

const regions = [
  { name: 'Asia', count: 14 },
  { name: 'Europe', count: 18 },
  { name: 'North America', count: 12 },
  { name: 'South America', count: 9 },
  { name: 'Africa', count: 11 },
  { name: 'Australia & Oceania', count: 8 }
];

const activities = [
  'Beach', 'Adventure', 'Culture', 'Food', 'Nature', 'History', 'Romance', 'Photography', 'Wildlife', 'Relaxation'
];

const DestinationCard = ({ destination }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTripFromDestination } = useTripContext();
  const [isCreating, setIsCreating] = useState(false);

  // Check if there's a pre-generated itinerary for this destination
  const hasPreGeneratedItinerary = preGeneratedItineraries[destination.id];

  const handleViewDetails = async () => {
    if (!user) {
      toast.error('Please sign in to create a trip');
      navigate('/signin');
      return;
    }

    try {
      setIsCreating(true);
      console.log('Creating trip for destination:', destination.name);
      
      // Create a trip from the destination
      const tripData = {
        id: destination.id, // Add destination ID for pre-generated itinerary lookup
        destination: destination.name,
        budget: parseInt(destination.price.replace(/[₹,]/g, '')),
        activities: destination.activities,
        estimatedDuration: destination.duration,
        rating: destination.rating,
        description: destination.description,
        presetImage: destination.image
      };

      console.log('Trip data:', tripData);
      const newTrip = await createTripFromDestination(tripData);
      console.log('Created trip:', newTrip);
      
      if (newTrip) {
        if (newTrip.generatedBy === 'pre-generated') {
          toast.success(`Pre-planned itinerary for ${destination.name} loaded successfully!`);
        } else {
          toast.success(`Trip to ${destination.name} created successfully!`);
        }
        navigate(`/planning/${newTrip._id}`);
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Failed to create trip. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl flex flex-col h-full">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={destination.image} 
          alt={destination.name} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          onError={(e) => {
            console.error(`Failed to load image for ${destination.name}:`, e.target.src);
            e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold ml-1">{destination.rating}</span>
        </div>
        {hasPreGeneratedItinerary && (
          <div className="absolute top-3 left-3 bg-green-500 text-white rounded-full px-2 py-1 flex items-center">
            <span className="text-xs font-bold">Ready to Go!</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
          <div className="text-lg font-bold text-purple-700">{destination.price}</div>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{destination.description}</p>
        <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
          {destination.activities.map(activity => (
            <span 
              key={activity} 
              className="flex items-center text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full justify-center"
            >
              {activity}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{destination.duration}</span>
          </div>
          <Button 
            size="sm" 
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleViewDetails}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {hasPreGeneratedItinerary ? 'Loading Itinerary...' : 'Creating...'}
              </>
            ) : (
              <>
                {hasPreGeneratedItinerary ? 'View Itinerary' : 'Create Trip'} <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Destinations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter destinations based on search query
  const filteredDestinations = destinations.filter(destination =>
    destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.activities.some(activity => 
      activity.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const featuredDestinations = filteredDestinations.slice(0, 8);
  const moreDestinations = filteredDestinations.slice(8, 12);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Discover Amazing <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Destinations</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore our curated collection of the world's most stunning destinations, from pristine beaches to historic wonders.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search destinations, cities, or experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />
          </div>
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Regions</h3>
                <div className="space-y-2">
                  {regions.map(region => (
                    <label key={region.name} className="flex items-center">
                      <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 mr-2" />
                      <span>{region.name}</span>
                      <span className="text-gray-500 text-sm ml-1">({region.count})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 mr-2" />
                    <span>Budget (Under ₹60,000)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 mr-2" />
                    <span>Mid-range (₹60,000-₹1,20,000)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 mr-2" />
                    <span>Luxury (₹1,20,000+)</span>
                  </label>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Activities</h3>
                <div className="flex flex-wrap gap-2">
                  {activities.map(activity => (
                    <div key={activity} className="flex items-center border rounded-full px-3 py-1 text-sm hover:bg-purple-50 cursor-pointer">
                      <span>{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Featured Destinations Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Destinations</h2>
          <Button variant="link" className="text-purple-600 hover:text-purple-700 flex items-center">
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDestinations.map(destination => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </div>

      {/* More Destinations Section */}
      {moreDestinations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">More Amazing Destinations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {moreDestinations.map(destination => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {filteredDestinations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            No destinations found matching "{searchQuery}"
          </div>
          <div className="text-gray-400 text-sm mt-2">
            Try adjusting your search terms or browse all destinations
          </div>
        </div>
      )}

    </div>
  );
};

export default Destinations;
