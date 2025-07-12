import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ActivityCard from '../ActivityCard';

const ItineraryTab = ({ 
  itinerary,
  onChangeRequest
}) => {
  // No need to initialize unused variables
  // Handle null or empty itinerary
  if (!itinerary || !Array.isArray(itinerary) || itinerary.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No itinerary available</h3>
        <p className="mt-2 text-gray-500">We're working on creating your perfect trip itinerary.</p>
      </div>
    );
  }

  const handleActivityChange = (day, index, changeType) => {
    if (onChangeRequest) {
      onChangeRequest(day, index, changeType);
    }
  };

  return (
    <div className="space-y-6">
      {itinerary.map((day) => (
        <Card key={day.day} className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500">
            <CardTitle className="text-white flex items-center justify-between">
              <span>
                {day.title && day.title.includes(`Day ${day.day}`) 
                  ? day.title 
                  : `Day ${day.day}${day.title ? `: ${day.title}` : ' Activities'}`
                }
              </span>
              
              
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {day.activities && Array.isArray(day.activities) && day.activities.map((activity, index) => (
              <ActivityCard
                key={`${day.day}-${index}`}
                activity={activity}
                index={index}
                day={day.day}
                onChangeRequest={onChangeRequest ? handleActivityChange : undefined}
              />
            ))}
            {(!day.activities || day.activities.length === 0) && (
              <div className="text-center py-4 text-gray-500">
                No activities planned for this day.
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ItineraryTab;
