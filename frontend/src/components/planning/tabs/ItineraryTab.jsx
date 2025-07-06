import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ActivityCard from '../ActivityCard';

const ItineraryTab = ({ 
  itinerary,
  toggleFavoriteActivity,
  favoriteActivities,
  notes,
  showNoteForm,
  setShowNoteForm,
  addNote,
  handleChangeRequest,
  showSuggestions,
  setShowSuggestions
}) => {
  // Handle null or empty itinerary
  if (!itinerary || !Array.isArray(itinerary) || itinerary.length === 0) {
    return (
      <div className="space-y-8">
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold">No Itinerary Available</h3>
                <p className="text-blue-100 mt-2">This trip doesn't have an AI-generated itinerary yet.</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              <p className="mb-4">Try generating a new itinerary using the "Regenerate" button above, or create a new trip with AI itinerary generation.</p>
              <p className="text-sm text-gray-400">Showing demo data for now.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {itinerary.map((day) => (
        <Card key={day.day} className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-2xl w-16 h-16 flex items-center justify-center font-bold text-2xl">
                  {day.day}
                </div>
                <div>
                  <div className="text-3xl font-bold">Day {day.day}</div>
                  <div className="text-blue-100 text-lg">{day.date}</div>
                </div>
              </div>
              <Badge className="bg-white/20 text-white text-lg px-6 py-3 font-semibold">
                {day.theme}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {day.activities.map((activity, index) => {
              const favoriteKey = `day-${day.day}-activity-${index}`;
              const noteKey = `day-${day.day}-activity-${index}`;
              const suggestionKey = `day-${day.day}-activity-${index}`;
              const isFavorite = favoriteActivities[favoriteKey];
              const hasNote = notes[noteKey];
              const showingNoteForm = showNoteForm[noteKey];
              const showingSuggestions = showSuggestions[suggestionKey];
              
              return (
                <ActivityCard
                  key={index}
                  activity={activity}
                  index={index}
                  day={day.day}
                  favoriteKey={favoriteKey}
                  noteKey={noteKey}
                  suggestionKey={suggestionKey}
                  isFavorite={isFavorite}
                  hasNote={hasNote}
                  showingNoteForm={showingNoteForm}
                  showingSuggestions={showingSuggestions}
                  toggleFavoriteActivity={toggleFavoriteActivity}
                  setShowNoteForm={setShowNoteForm}
                  addNote={addNote}
                  handleChangeRequest={handleChangeRequest}
                  notes={notes}
                  setShowSuggestions={setShowSuggestions}
                />
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ItineraryTab;
