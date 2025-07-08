import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Clock, Star, Share2, Download } from 'lucide-react';

const TripHeader = ({ trip, onRegenerateClick, isRegenerating }) => {
  // Helper function to format dates
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Dates not set';
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  };

  // Helper function to calculate duration
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Duration unknown';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  };

  // Helper function to get travelers count
  const getTravelersCount = (trip) => {
    // Check various possible field names for travelers
    const travelers = trip?.travelers || trip?.travellers || trip?.numberOfTravelers || trip?.numTravelers || 1;
    return `${travelers} traveler${travelers === 1 ? '' : 's'}`;
  };

  // Calculate total costs from activities in the itinerary
  const calculateActivityCosts = (itinerary) => {
    if (!itinerary || !Array.isArray(itinerary)) return 0;
    
    let totalCost = 0;
    
    // Sum up costs from all activities across all days
    itinerary.forEach(day => {
      if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach(activity => {
          if (activity.cost) {
            let cost = 0;
            
            // Handle both numeric and string cost values
            if (typeof activity.cost === 'number') {
              cost = activity.cost;
            } else if (typeof activity.cost === 'string') {
              // Extract numeric value from cost string (e.g., "₹2,500" -> 2500)
              const costStr = activity.cost.replace(/[^\d]/g, '');
              cost = parseInt(costStr, 10);
            }
            
            if (!isNaN(cost)) {
              totalCost += cost;
            }
          }
        });
      }
    });
    
    return totalCost;
  };

  // Helper function to format budget
  const formatBudget = (budget) => {
    if (!budget) return 'Budget not set';
    if (typeof budget === 'string') return budget;

    let displayAmount;
    
    if (budget.amount && budget.currency) {
      // Use the budget amount from the trip object
      displayAmount = budget.amount;
      
      // If we have an itinerary, calculate the activity costs as a double-check
      if (trip.itinerary && Array.isArray(trip.itinerary)) {
        const activityCosts = calculateActivityCosts(trip.itinerary);
        
        // If activity costs are available and significant
        if (activityCosts > 0) {
          // Use the larger of the two values to ensure we're not underestimating
          displayAmount = Math.max(budget.amount, activityCosts);
        }
      }
      
      return `${budget.currency} ${displayAmount.toLocaleString()}`;
    }
    
    return 'Budget not set';
  };

  return (
    <Card className="border-0 shadow-2xl overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4">
            <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
              <Sparkles className="w-4 h-7 mr-2" />
              AI Generated Itinerary
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Trip to {trip.destination?.name || 'Unknown Destination'}
            </h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-3 bg-white/80 px-4 py-3 rounded-xl border shadow-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">{formatDateRange(trip.startDate, trip.endDate)}</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 px-4 py-3 rounded-xl border shadow-lg">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="font-semibold">{calculateDuration(trip.startDate, trip.endDate)}</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 px-4 py-3 rounded-xl border shadow-lg">
                <Star className="h-5 w-5 text-purple-600" />
                <span className="font-semibold">{getTravelersCount(trip)}</span>
              </div>
            </div>
          </div>
          <div className="text-center lg:text-right space-y-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-xl">
              <div className="text-3xl lg:text-4xl font-bold">{formatBudget(trip.budget)}</div>
              <div className="text-green-100 font-medium">Total Budget</div>
            </div>
            <div className="flex gap-2 justify-center lg:justify-end">
              <Button 
                size="sm" 
                variant="outline"
                onClick={onRegenerateClick}
                disabled={isRegenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripHeader;
