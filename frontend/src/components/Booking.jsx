import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTripContext } from '../contexts/useTripContext'
import TripCard from './TripCard'
import AIButton from './ui/ai-button';
import { Calendar, MapIcon, Backpack, Users, IndianRupee, Search, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Booking = () => {
  const { trips, loading, deleteTrip } = useTripContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Helper function to extract destination name from object or string
  const getDestinationName = (destination) => {
    if (!destination) return '';
    if (typeof destination === 'string') return destination;
    if (typeof destination === 'object' && destination.name) return destination.name;
    return '';
  };

  // Helper function to extract budget amount from object or number
  const getBudgetAmount = (budget) => {
    if (!budget) return null;
    if (typeof budget === 'number') return budget;
    if (typeof budget === 'object' && budget.amount) return budget.amount;
    return null;
  };

  // Filter trips based on search term
  const filteredTrips = useMemo(() => {
    if (!searchTerm) return trips;
    return trips.filter(trip => {
      const title = trip.title || '';
      const destination = getDestinationName(trip.destination);
      const searchLower = searchTerm.toLowerCase();
      
      return (typeof title === 'string' && title.toLowerCase().includes(searchLower)) ||
             (typeof destination === 'string' && destination.toLowerCase().includes(searchLower));
    });
  }, [trips, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'planning': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return;
    setDeletingId(tripId);
    const result = await deleteTrip(tripId);
    if (result.success) {
      toast.success('Trip deleted successfully');
    } else {
      toast.error(result.error || 'Failed to delete trip');
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-40">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
            <p className="text-gray-600">Loading your trips...</p>
          </div>
        </div>
      </div>
    );
  }

      
  return (
    <div className="container mx-auto py-10 px-4 md:px-40">
      {/* Header with title and create button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 py-5">
        <div className="mb-6 md:mb-0">
          <h1 className="text-4xl font-bold mb-2">My Trips</h1>
          <p className="text-lg text-gray-600">Plan, organize, and track your travel adventures</p>
        </div>
        <Link to="/">
          <AIButton 
            className="flex items-center gap-2 px-6 py-3"
          >
            <span>Create a new Trip</span>
          </AIButton>
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="text-gray-500 absolute top-3 left-3 size-4.5" />
        <input 
          type="text" 
          placeholder="Search trips by name or destinations..." 
          className="border rounded-lg p-2 pl-10 w-full" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Trip cards */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <Backpack className="mx-auto h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {trips.length === 0 ? 'No trips yet' : 'No trips found'}
          </h3>
          <p className="text-gray-500 mb-6">
            {trips.length === 0 
              ? 'Start planning your next adventure!' 
              : 'Try adjusting your search terms.'
            }
          </p>
          {trips.length === 0 && (
            <Link to="/">
              <AIButton className="inline-flex items-center gap-2 px-6 py-3">
                <span>Plan Your First Trip</span>
              </AIButton>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard 
              key={trip._id}
              trip={trip}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getDestinationName={getDestinationName}
              getBudgetAmount={getBudgetAmount}
              onDelete={handleDeleteTrip}
              deleting={deletingId === trip._id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Booking
