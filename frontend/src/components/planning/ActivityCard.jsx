import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, MapPin, Plane, Hotel, Utensils, Camera, Heart, StickyNote
} from 'lucide-react';

const ActivityCard = ({ 
  activity = {}, 
  index, 
  day, 
  onChangeRequest
}) => {
  const [isFavorited, setIsFavorited] = useState(activity?.isFavorited || false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(activity?.notes || '');

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // Here you could also call an API to save the favorite status
  };

  const toggleNotes = () => {
    setShowNotes(!showNotes);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    // Here you could debounce and save notes to API
  };
  const getActivityIcon = (type) => {
    switch (type) {
      case 'transport': return <Plane className="h-4 w-4" />;
      case 'accommodation': return <Hotel className="h-4 w-4" />;
      case 'meal': return <Utensils className="h-4 w-4" />;
      case 'activity': return <Camera className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'transport': return 'bg-blue-100 text-blue-800';
      case 'accommodation': return 'bg-purple-100 text-purple-800';
      case 'meal': return 'bg-orange-100 text-orange-800';
      case 'activity': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activityType = activity?.type || activity?.category || 'activity';
  const activityTitle = activity?.title || 'Untitled Activity';
  const activityTime = activity?.time || activity?.startTime || 'Time TBD';
  const activityDuration = activity?.duration || 'Duration TBD';
  const activityLocation = activity?.location?.name || activity?.location || 'Location TBD';
  
  let formattedCost = 'Cost TBD';
  if (activity?.cost) {
    formattedCost = typeof activity.cost === 'number' 
      ? `₹${activity.cost.toLocaleString()}` 
      : activity.cost;
  }

  return (
    <div className="p-6 bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-2xl border">
      <div className="flex items-start space-x-6">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          {getActivityIcon(activityType)}
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={`${getActivityColor(activityType)} px-4 py-2 font-semibold`}>
              {activityType.charAt(0).toUpperCase() + activityType.slice(1)}
            </Badge>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-bold">{activityTime}</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">{activityDuration}</span>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full">
              <span className="font-bold text-green-700">
                {formattedCost}
              </span>
            </div>
          </div>
          <h4 className="font-bold text-gray-900 text-xl">{activityTitle}</h4>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-3 text-blue-500" />
            <span className="font-semibold">{activityLocation}</span>
          </div>
          
          <div className="flex flex-wrap gap-3 pt-3">
            {onChangeRequest && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onChangeRequest(day, index, 'time')}
                className="flex items-center space-x-2 hover:bg-gray-50"
              >
                <span>Change Time</span>
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={toggleFavorite}
              className={`flex items-center space-x-2 hover:bg-red-50 ${
                isFavorited ? 'bg-red-50 text-red-600 border-red-200' : ''
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              <span>{isFavorited ? 'Favorited' : 'Add to Favorites'}</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={toggleNotes}
              className="flex items-center space-x-2 hover:bg-yellow-50"
            >
              <StickyNote className="h-4 w-4" />
              <span>{showNotes ? 'Hide Notes' : 'Add Notes'}</span>
            </Button>
          </div>
          
          {showNotes && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add your notes about this activity..."
                className="w-full p-3 border border-yellow-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                rows={3}
              />
              {notes && (
                <p className="text-xs text-gray-500 mt-2">
                  Notes are saved automatically
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
