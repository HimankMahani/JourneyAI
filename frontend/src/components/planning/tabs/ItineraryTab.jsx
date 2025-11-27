import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import ActivityCard from '../ActivityCard';
import AddActivityModal from '../AddActivityModal';

// Replace imported icons with inline SVG components
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const OutlineCalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ItineraryTab = ({ 
  itinerary,
  onChangeRequest,
  onToggleFavorite,
  onNotesChange,
  onAddActivity
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  const openAddModal = (dayIndex) => {
    setSelectedDayIndex(dayIndex);
    setIsModalOpen(true);
  };

  const handleAddActivity = (dayIndex, activity) => {
    if (onAddActivity) {
      onAddActivity(dayIndex, activity);
    }
  };

  // Handle null or empty itinerary
  if (!itinerary || !Array.isArray(itinerary) || itinerary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <OutlineCalendarIcon /> {/* Use custom SVG component instead of HiOutlineCalendar */}
        </div>
        <h3 className="text-xl font-semibold text-gray-900">No itinerary available</h3>
        <p className="mt-2 text-gray-500 text-center max-w-md">
          We're working on creating your perfect trip itinerary. Check back soon!
        </p>
      </div>
    );
  }

  const buildChangeRequestHandler = (dayIndex, activityIndex) => (changeType) => {
    if (onChangeRequest) {
      onChangeRequest(dayIndex, activityIndex, changeType);
    }
  };

  const buildFavoriteHandler = (dayIndex, activityIndex) => (isFavorited) => {
    if (onToggleFavorite) {
      return onToggleFavorite(dayIndex, activityIndex, isFavorited);
    }
    return true;
  };

  const buildNotesHandler = (dayIndex, activityIndex) => (note) => {
    if (onNotesChange) {
      return onNotesChange(dayIndex, activityIndex, note);
    }
    return true;
  };

  return (
    <div className="space-y-8">
      {itinerary.map((day, dayIndex) => (
        <div key={day.day ?? dayIndex} className="transform transition-all duration-300 hover:translate-y-[-4px]">
          <Card className="overflow-hidden border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 py-6">
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <CalendarIcon />
                  </div>
                  <span>
                    {day.title && day.title.includes(`Day ${day.day}`) 
                      ? day.title 
                      : `Day ${day.day}${day.title ? `: ${day.title}` : ' Activities'}`
                    }
                  </span>
                </div>
                
                {/* Add date badge if available */}
                {day.date && (
                  <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                    {day.date}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6 bg-gradient-to-b from-blue-50/50 to-white">
              {day.activities && Array.isArray(day.activities) && day.activities.map((activity, index) => (
                <div 
                  key={`${dayIndex}-${index}`}
                  className={index < day.activities.length - 1 ? "pb-6 border-b border-gray-100" : ""}
                >
                  <ActivityCard
                    activity={activity}
                    onChangeRequest={onChangeRequest ? buildChangeRequestHandler(dayIndex, index) : undefined}
                    onToggleFavorite={onToggleFavorite ? buildFavoriteHandler(dayIndex, index) : undefined}
                    onNotesChange={onNotesChange ? buildNotesHandler(dayIndex, index) : undefined}
                  />
                </div>
              ))}
              
              {(!day.activities || day.activities.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No activities planned for this day.</p>
                </div>
              )}

              <button
                onClick={() => openAddModal(dayIndex)}
                className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-medium hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center justify-center gap-2 group mt-4"
              >
                <div className="bg-blue-100 p-1 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                Add Activity
              </button>
            </CardContent>
          </Card>
        </div>
      ))}

      <AddActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddActivity}
        dayIndex={selectedDayIndex}
      />
    </div>
  );
};

export default ItineraryTab;
