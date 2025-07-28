import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlacePhoto } from '../hooks/usePlacePhoto';
import { Calendar, MapIcon, Users, IndianRupee, Edit3, Trash2 } from 'lucide-react';

const TripCard = ({ trip, formatDate, getStatusColor, getDestinationName, getBudgetAmount, onDelete, deleting }) => {
  const destinationName = getDestinationName(trip.destination);
  const { photoUrl, loading: photoLoading } = usePlacePhoto(destinationName);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    // Set a high-quality fallback
    e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white">
      <div className="relative overflow-hidden">
        {photoLoading && !imageLoaded ? (
          <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading image...</div>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={photoUrl} 
              alt={destinationName || 'Trip destination'} 
              className={`w-full h-48 object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            )}
            
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        
        {/* Status badge overlay */}
        {trip.status && (
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${getStatusColor(trip.status)}`}>
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 line-clamp-1 text-gray-900">
          {trip.title || destinationName || 'Untitled Trip'}
        </h2>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <MapIcon className="h-4 w-4 mr-2 text-blue-500" />
            <span className="line-clamp-1">{destinationName || 'Destination not set'}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="h-4 w-4 mr-2 text-green-500" />
            <span>
              {trip.startDate 
                ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}` 
                : 'Dates not set'
              }
            </span>
          </div>
          
          {trip.travelers && (
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              <span>{trip.travelers} traveler(s)</span>
            </div>
          )}
          
          {getBudgetAmount(trip.budget) && (
            <div className="flex items-center text-gray-600 text-sm">
              <IndianRupee className="h-4 w-4 mr-2 text-emerald-500" />
              <span>₹{getBudgetAmount(trip.budget).toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link 
            to={`/planning/${trip._id}`}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-center hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
          >
            View Details
          </Link>
          
          {trip.status === 'planning' && (
            <Link 
              to={`/planning/${trip._id}`}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
              title="Edit Trip"
            >
              <Edit3 className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            </Link>
          )}
          {onDelete && (
            <button
              className={`px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200 group flex items-center justify-center ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Delete Trip"
              onClick={() => onDelete(trip._id)}
              disabled={deleting}
              type="button"
            >
              <Trash2 className="h-4 w-4 text-red-500 group-hover:text-red-700" />
              {deleting && <span className="ml-2 text-xs text-red-500">Deleting...</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCard;
