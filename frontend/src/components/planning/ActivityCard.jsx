import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, MapPin, Heart, StickyNote, Lightbulb, RefreshCw, X, 
  IndianRupee, Plane, Hotel, Utensils, Camera
} from 'lucide-react';

const ActivityCard = ({ 
  activity, 
  index, 
  day, 
  // We don't directly use favoriteKey in this component
  noteKey, 
  suggestionKey,
  isFavorite,
  hasNote,
  showingNoteForm,
  showingSuggestions,
  toggleFavoriteActivity,
  setShowNoteForm,
  addNote,
  handleChangeRequest,
  notes,
  setShowSuggestions
}) => {
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

  return (
    <div className="p-6 bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-2xl border">
      <div className="flex items-start space-x-6">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          {getActivityIcon(activity.type || activity.category || 'activity')}
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={`${getActivityColor(activity.type || activity.category || 'activity')} px-4 py-2 font-semibold`}>
              {(activity.type || activity.category || 'activity').charAt(0).toUpperCase() + (activity.type || activity.category || 'activity').slice(1)}
            </Badge>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-bold">{activity.time || activity.startTime || 'Time TBD'}</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">{activity.duration || 'Duration TBD'}</span>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full">
              <span className="font-bold text-green-700">
                {activity.cost 
                  ? (typeof activity.cost === 'number' 
                    ? `₹${activity.cost.toLocaleString()}` 
                    : activity.cost)
                  : 'Cost TBD'
                }
              </span>
            </div>
          </div>
          <h4 className="font-bold text-gray-900 text-xl">{activity.title || 'Untitled Activity'}</h4>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-3 text-blue-500" />
            <span className="font-semibold">{activity.location?.name || activity.location || 'Location TBD'}</span>
          </div>
          
          {/* Interactive Actions */}
          <div className="flex flex-wrap gap-3 pt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleFavoriteActivity(day, index)}
              className={`flex items-center space-x-2 ${isFavorite ? 'bg-red-50 text-red-600 border-red-200' : 'hover:bg-gray-50'}`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNoteForm(prev => ({ ...prev, [noteKey]: !showingNoteForm }))}
              className={`flex items-center space-x-2 ${hasNote ? 'bg-blue-50 text-blue-600 border-blue-200' : 'hover:bg-gray-50'}`}
            >
              <StickyNote className="h-4 w-4" />
              <span>{hasNote ? 'Edit Note' : 'Add Note'}</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleChangeRequest(day, index, activity.type)}
              className="flex items-center space-x-2 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Get Alternatives</span>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleChangeRequest(day, index, 'change')}
              className="flex items-center space-x-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Request Change</span>
            </Button>
          </div>
          
          {/* Note Form */}
          {showingNoteForm && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-blue-900">Add a Note</h5>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNoteForm(prev => ({ ...prev, [noteKey]: false }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add your thoughts, reminders, or special requests..."
                defaultValue={notes[noteKey] || ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    addNote(day, index, e.target.value);
                  }
                }}
              />
              <div className="flex justify-end space-x-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNoteForm(prev => ({ ...prev, [noteKey]: false }))}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    const textarea = e.target.closest('.bg-white').querySelector('textarea');
                    addNote(day, index, textarea.value);
                  }}
                >
                  Save Note
                </Button>
              </div>
            </div>
          )}
          
          {/* Display Existing Note */}
          {hasNote && !showingNoteForm && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <StickyNote className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-blue-900 mb-1">Your Note:</h5>
                  <p className="text-blue-800 text-sm">{notes[noteKey]}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Suggestions Panel */}
          {showingSuggestions && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-yellow-900 flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Alternative Suggestions</span>
                </h5>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSuggestions(prev => ({ ...prev, [suggestionKey]: false }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {activity.type === 'meal' ? (
                  <>
                    <div className="p-3 bg-white rounded-lg border border-yellow-200">
                      <h6 className="font-semibold text-yellow-800">Le Comptoir du Relais</h6>
                      <p className="text-sm text-yellow-700">Traditional French bistro, 5 min walk • ₹2,800</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-yellow-200">
                      <h6 className="font-semibold text-yellow-800">Breizh Café</h6>
                      <p className="text-sm text-yellow-700">Modern crêperie, 8 min walk • ₹2,200</p>
                    </div>
                  </>
                ) : activity.type === 'activity' ? (
                  <>
                    <div className="p-3 bg-white rounded-lg border border-yellow-200">
                      <h6 className="font-semibold text-yellow-800">Musée Rodin</h6>
                      <p className="text-sm text-yellow-700">Sculpture museum with gardens • ₹980</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-yellow-200">
                      <h6 className="font-semibold text-yellow-800">Latin Quarter Walking Tour</h6>
                      <p className="text-sm text-yellow-700">Historical district exploration • ₹1,200</p>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-white rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700">Our AI is finding the best alternatives for you...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
