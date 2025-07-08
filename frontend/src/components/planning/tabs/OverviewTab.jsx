import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { aiService } from '@/services/api';
import { 
  BarChart3, CalendarDays, Camera, Utensils, Star, Users, Car, Hotel, 
  PieChart, Clock, Plane, IndianRupee, TrendingUp, Share2, Download, 
  Map, MessageSquare, CheckCircle, BookOpen, Shield, CreditCard, 
  Smartphone, CheckCircle2, Circle, Phone, AlertTriangle, Globe, 
  ExternalLink, Sun, Umbrella, Navigation, MapPin, Activity,
  Coffee, ShoppingBag, TreePine, Building, Music, Gamepad2, Loader,
  Lightbulb
} from 'lucide-react';

// Helper to get destination name as string
const getDestinationName = (destination) => {
  if (!destination) return '';
  if (typeof destination === 'string') return destination;
  if (typeof destination === 'object' && destination.name) return destination.name;
  return String(destination);
};

const OverviewTab = ({ 
  trip,
  itinerary,
  weatherOverview 
}) => {
  const [activeQuickAction, setActiveQuickAction] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [aiCostEstimates, setAiCostEstimates] = useState(null);
  const [loadingCostEstimates, setLoadingCostEstimates] = useState(false);

  // Calculate dynamic trip statistics from real itinerary data
  const tripStats = useMemo(() => {
    if (!itinerary || !Array.isArray(itinerary)) {
      return {
        totalDays: 0,
        totalActivities: 0,
        restaurantCount: 0,
        attractionCount: 0,
        transportCount: 0,
        hotelCount: 0,
        totalCost: 0,
        activityTypes: {}
      };
    }

    let totalActivities = 0;
    let restaurantCount = 0;
    let attractionCount = 0;
    let transportCount = 0;
    let hotelCount = 0;
    let totalCost = 0;
    const activityTypes = {};

    itinerary.forEach(day => {
      if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach(activity => {
          totalActivities++;
          
          // Count by activity type
          const type = activity.type || 'activity';
          activityTypes[type] = (activityTypes[type] || 0) + 1;
          
          if (type === 'meal' || activity.title?.toLowerCase().includes('restaurant') || activity.title?.toLowerCase().includes('lunch') || activity.title?.toLowerCase().includes('dinner')) {
            restaurantCount++;
          } else if (type === 'activity' || type === 'sightseeing') {
            attractionCount++;
          } else if (type === 'transport') {
            transportCount++;
          } else if (type === 'accommodation' || type === 'hotel') {
            hotelCount++;
          }

          // Calculate cost
          if (activity.cost) {
            let cost = 0;
            if (typeof activity.cost === 'number') {
              cost = activity.cost;
            } else if (typeof activity.cost === 'string') {
              const costStr = activity.cost.replace(/[^\d]/g, '');
              cost = parseInt(costStr, 10) || 0;
            }
            totalCost += cost;
          }
        });
      }
    });

    // Calculate total cost including AI estimates if available
    let finalTotalCost = totalCost;
    if (aiCostEstimates && totalCost === 0) {
      finalTotalCost = Object.values(aiCostEstimates).reduce((sum, cost) => sum + (cost || 0), 0);
    }

    return {
      totalDays: itinerary.length,
      totalActivities,
      restaurantCount,
      attractionCount,
      transportCount,
      hotelCount,
      totalCost: finalTotalCost,
      activityTypes
    };
  }, [itinerary, aiCostEstimates]);

  // Generate dynamic travel timeline from trip data
  const dynamicTimeline = useMemo(() => {
    if (!trip && !itinerary) return [];
    
    const timeline = [];
    
    // Add departure
    if (trip?.startDate) {
      timeline.push({
        icon: "Plane",
        title: "Departure",
        date: new Date(trip.startDate).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        }),
        subtitle: getDestinationName(trip?.destination) || "Travel destination"
      });
    }

    // Add check-in
    if (itinerary && itinerary.length > 0) {
      const firstDay = itinerary[0];
      const checkInActivity = firstDay.activities?.find(act => 
        act.type === 'accommodation' || act.title?.toLowerCase().includes('check')
      );
      
      if (checkInActivity) {
        timeline.push({
          icon: "Hotel",
          title: "Check-in",
          date: `${firstDay.date} • ${checkInActivity.time}`,
          subtitle: checkInActivity.location || checkInActivity.title
        });
      }
    }

    // Add main attractions
    if (itinerary) {
      itinerary.forEach(day => {
        const mainAttraction = day.activities?.find(act => 
          act.type === 'activity' && (act.title?.toLowerCase().includes('tower') || 
          act.title?.toLowerCase().includes('museum') || 
          act.title?.toLowerCase().includes('cathedral'))
        );
        
        if (mainAttraction) {
          timeline.push({
            icon: "Star",
            title: mainAttraction.title,
            date: `${day.date} • ${mainAttraction.time}`,
            subtitle: mainAttraction.location || "Main attraction"
          });
        }
      });
    }

    // Add return flight
    if (trip?.endDate) {
      timeline.push({
        icon: "Plane",
        title: "Return Flight",
        date: new Date(trip.endDate).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        }),
        subtitle: "Departure from " + (getDestinationName(trip?.destination) || "destination")
      });
    }

    return timeline.slice(0, 4); // Limit to 4 items
  }, [trip, itinerary]);

  // Calculate dynamic budget breakdown
  const dynamicBudget = useMemo(() => {
    if (!itinerary) return [];
    
    const breakdown = {
      flights: 0,
      hotels: 0,
      food: 0,
      activities: 0,
      transport: 0,
      shopping: 0,
      misc: 0
    };

    itinerary.forEach(day => {
      day.activities?.forEach(activity => {
        const cost = activity.cost || 0;
        let numericCost = 0;
        
        if (typeof cost === 'number') {
          numericCost = cost;
        } else if (typeof cost === 'string') {
          numericCost = parseInt(cost.replace(/[^\d]/g, ''), 10) || 0;
        }

        switch (activity.type) {
          case 'transport':
            if (activity.title?.toLowerCase().includes('flight')) {
              breakdown.flights += numericCost;
            } else {
              breakdown.transport += numericCost;
            }
            break;
          case 'accommodation':
          case 'hotel':
            breakdown.hotels += numericCost;
            break;
          case 'meal':
            breakdown.food += numericCost;
            break;
          case 'shopping':
            breakdown.shopping += numericCost;
            break;
          case 'activity':
          case 'sightseeing':
            breakdown.activities += numericCost;
            break;
          default:
            if (activity.title?.toLowerCase().includes('shop') || activity.title?.toLowerCase().includes('market')) {
              breakdown.shopping += numericCost;
            } else {
              breakdown.misc += numericCost;
            }
        }
      });
    });

    // Use AI cost estimates if actual costs are zero
    if (aiCostEstimates) {
      if (breakdown.flights === 0 && aiCostEstimates.flights) {
        breakdown.flights = aiCostEstimates.flights;
      }
      if (breakdown.food === 0 && aiCostEstimates.food) {
        breakdown.food = aiCostEstimates.food;
      }
      if (breakdown.hotels === 0 && aiCostEstimates.hotels) {
        breakdown.hotels = aiCostEstimates.hotels;
      }
      if (breakdown.transport === 0 && aiCostEstimates.transport) {
        breakdown.transport = aiCostEstimates.transport;
      }
      if (breakdown.activities === 0 && aiCostEstimates.activities) {
        breakdown.activities = aiCostEstimates.activities;
      }
      if (breakdown.shopping === 0 && aiCostEstimates.shopping) {
        breakdown.shopping = aiCostEstimates.shopping;
      }
      if (breakdown.misc === 0 && aiCostEstimates.misc) {
        breakdown.misc = aiCostEstimates.misc;
      }
    }

    const formatCurrency = (amount) => `₹${amount.toLocaleString()}`;

    return [
      { icon: "Plane", category: "Flights", amount: formatCurrency(breakdown.flights) },
      { icon: "Hotel", category: "Hotels", amount: formatCurrency(breakdown.hotels) },
      { icon: "Utensils", category: "Food", amount: formatCurrency(breakdown.food) },
      { icon: "Camera", category: "Activities", amount: formatCurrency(breakdown.activities) },
      { icon: "Car", category: "Transport", amount: formatCurrency(breakdown.transport) },
      { icon: "ShoppingBag", category: "Shopping", amount: formatCurrency(breakdown.shopping) },
      { icon: "CreditCard", category: "Miscellaneous", amount: formatCurrency(breakdown.misc) }
    ];
  }, [itinerary, aiCostEstimates]);

  // Generate dynamic document checklist
  const dynamicDocuments = useMemo(() => {
    const docs = [
      { icon: "BookOpen", label: "Valid Passport", status: false },
      { icon: "Plane", label: "Flight Tickets", status: false },
      { icon: "Hotel", label: "Hotel Reservations", status: false },
      { icon: "Shield", label: "Travel Insurance", status: false },
      { icon: "CreditCard", label: "International Cards", status: false },
      { icon: "Smartphone", label: "Offline Maps", status: false }
    ];

    // Auto-check some items based on trip data
    if (trip?.startDate && trip?.endDate) {
      docs[1].status = true; // Flight tickets (assumed booked)
    }
    if (itinerary?.some(day => day.activities?.some(act => act.type === 'accommodation'))) {
      docs[2].status = true; // Hotel reservations
    }

    return docs;
  }, [trip, itinerary]);

  // Generate dynamic emergency contacts
  const dynamicContacts = useMemo(() => {
    return [
      {
        icon: "AlertTriangle",
        title: "Emergency Services",
        phoneNumber: "112",
        description: "Police, Fire, Ambulance"
      },
      {
        icon: "Hotel",
        title: "Hotel Concierge",
        phoneNumber: "+91-11-4567-8900",
        description: "24/7 assistance"
      },
      {
        icon: "Globe",
        title: "Embassy/Consulate",
        phoneNumber: "+91-11-2687-2161",
        description: "For citizens abroad"
      }
    ];
  }, []);

  // Load AI recommendations for missing information
  useEffect(() => {
    const loadAiRecommendations = async () => {
      if (!trip?.destination || aiRecommendations) return;
      
      setLoadingRecommendations(true);
      try {
        const recommendations = await aiService.getDestinationInfo(trip.destination);
        setAiRecommendations(recommendations);
      } catch (error) {
        console.error('Failed to load AI recommendations:', error);
        // Set fallback recommendations
        setAiRecommendations({
          culturalInfo: `${getDestinationName(trip.destination)} is known for its rich cultural heritage and stunning architecture.`,
          localTips: `Best time to visit is during pleasant weather months. Try local cuisine and be respectful of local customs.`,
          mustVisit: [`${getDestinationName(trip.destination)} Old Town`, `${getDestinationName(trip.destination)} Museum`, `${getDestinationName(trip.destination)} Gardens`]
        });
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadAiRecommendations();
  }, [trip?.destination, aiRecommendations]);

  // Load AI cost estimates when there are no actual costs
  useEffect(() => {
    const loadAiCostEstimates = async () => {
      if (!trip?.destination || !itinerary || aiCostEstimates) return;
      
      // Get user location from localStorage
      const userStr = localStorage.getItem('user');
      let userLocation = null;
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userLocation = user.location?.full || user.location?.city || null;
        } catch (error) {
          console.error('Failed to parse user data:', error);
        }
      }
      
      if (!userLocation) {
        console.log('No user location found, skipping AI cost estimates');
        return;
      }
      
      setLoadingCostEstimates(true);
      try {
        const destinationName = getDestinationName(trip.destination);
        const tripDays = itinerary.length;
        const travelers = trip.travelers || 1;
        
        console.log('Loading AI cost estimates for:', {
          from: userLocation,
          to: destinationName,
          days: tripDays,
          travelers
        });
        
        const costEstimates = await aiService.estimateEnhancedTripCosts(
          userLocation,
          destinationName,
          tripDays,
          travelers,
          itinerary
        );
        
        console.log('AI cost estimates received:', costEstimates);
        
        setAiCostEstimates({
          flights: costEstimates.breakdown?.flights || 0,
          food: costEstimates.breakdown?.food || 0,
          hotels: costEstimates.breakdown?.accommodation || 0,
          transport: costEstimates.breakdown?.localTransport || 0,
          activities: costEstimates.breakdown?.activities || 0,
          shopping: costEstimates.breakdown?.shopping || 0,
          misc: costEstimates.breakdown?.misc || 0
        });
      } catch (error) {
        console.error('Failed to load AI cost estimates:', error);
        // Set fallback estimates
        const tripDays = itinerary.length;
        const travelers = trip.travelers || 1;
        
        setAiCostEstimates({
          flights: 25000 * travelers,
          food: 1500 * tripDays * travelers,
          hotels: 3000 * tripDays,
          transport: 500 * tripDays * travelers,
          activities: 1000 * tripDays * travelers,
          shopping: 2000 * tripDays * travelers,
          misc: 500 * tripDays * travelers
        });
      } finally {
        setLoadingCostEstimates(false);
      }
    };

    loadAiCostEstimates();
  }, [trip?.destination, itinerary, aiCostEstimates, trip?.travelers]);

  // Enhanced quick actions with real functionality
  const handleQuickAction = async (action) => {
    setActiveQuickAction(action);
    
    switch (action) {
      case 'share':
        if (navigator.share) {
          try {
            await navigator.share({
              title: `${getDestinationName(trip?.destination) || 'My Trip'} Itinerary`,
              text: `Check out my ${tripStats.totalDays}-day trip to ${getDestinationName(trip?.destination) || 'this amazing destination'}!`,
              url: window.location.href
            });
          } catch (err) {
            console.log('Error sharing:', err);
          }
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(window.location.href);
          alert('Trip link copied to clipboard!');
        }
        break;
      
      case 'export':
        // Generate and download PDF (placeholder)
        alert('PDF export feature coming soon!');
        break;
      
      case 'map':
        // Open maps with trip locations
        if (itinerary && itinerary.length > 0) {
          const locations = itinerary.flatMap(day => 
            day.activities?.map(act => act.location).filter(Boolean) || []
          );
          const query = locations.slice(0, 5).join(' OR ');
          window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
        }
        break;
      
      case 'help':
        // Open help/support
        alert('Help & Support: Contact us at support@travelplanner.com');
        break;
    }
    
    setTimeout(() => setActiveQuickAction(null), 1000);
  };

  // Get activity type icon
  const getActivityIcon = (type) => {
    const icons = {
      meal: Utensils,
      activity: Camera,
      sightseeing: Star,
      transport: Car,
      accommodation: Hotel,
      shopping: ShoppingBag,
      nature: TreePine,
      culture: Building,
      entertainment: Music,
      recreation: Gamepad2
    };
    return icons[type] || Activity;
  };

  return (
    <div className="space-y-8">
      {/* Trip Analytics and Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Trip Analytics</h3>
                <p className="text-blue-100 text-sm">Real-time statistics</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                <CalendarDays className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-600 mb-1">{tripStats.totalDays}</div>
                <div className="text-sm text-blue-700 font-medium">Days</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
                <Camera className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-600 mb-1">{tripStats.totalActivities}</div>
                <div className="text-sm text-green-700 font-medium">Activities</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                <Utensils className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-600 mb-1">{tripStats.restaurantCount}</div>
                <div className="text-sm text-orange-700 font-medium">Restaurants</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-600 mb-1">{tripStats.attractionCount}</div>
                <div className="text-sm text-purple-700 font-medium">Attractions</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-indigo-600" />
                <div>
                  <div className="font-bold text-indigo-800">{trip?.travelers || 2} Travelers</div>
                  <div className="text-sm text-indigo-600">Trip participants</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                <Car className="h-6 w-6 text-teal-600" />
                <div>
                  <div className="font-bold text-teal-800">{tripStats.transportCount} Transports</div>
                  <div className="text-sm text-teal-600">Flights, trains, metro</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                <Hotel className="h-6 w-6 text-pink-600" />
                <div>
                  <div className="font-bold text-pink-800">{tripStats.hotelCount || 1} Hotel</div>
                  <div className="text-sm text-pink-600">{tripStats.totalDays} nights stay</div>
                </div>
              </div>
            </div>

            {/* Activity Breakdown */}
            {Object.keys(tripStats.activityTypes).length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Activity Breakdown
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(tripStats.activityTypes).map(([type, count]) => {
                    const IconComponent = getActivityIcon(type);
                    return (
                      <div key={type} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700 capitalize">{type}: {count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <PieChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Budget Breakdown</h3>
                <p className="text-blue-100 text-sm">Expense tracking</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-green-600 mb-1">
                ₹{tripStats.totalCost.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Budget</div>
              {loadingCostEstimates && (
                <div className="text-xs text-blue-500 mt-2 flex items-center justify-center gap-2">
                  <Loader className="h-3 w-3 animate-spin" />
                  Loading AI cost estimates...
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {dynamicBudget.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {item.icon === "Plane" && <Plane className="h-5 w-5 text-blue-600" />}
                    {item.icon === "Hotel" && <Hotel className="h-5 w-5 text-purple-600" />}
                    {item.icon === "Utensils" && <Utensils className="h-5 w-5 text-orange-600" />}
                    {item.icon === "Camera" && <Camera className="h-5 w-5 text-green-600" />}
                    {item.icon === "Car" && <Car className="h-5 w-5 text-gray-600" />}
                    {item.icon === "ShoppingBag" && <ShoppingBag className="h-5 w-5 text-pink-600" />}
                    {item.icon === "CreditCard" && <CreditCard className="h-5 w-5 text-yellow-600" />}
                    <span className="font-medium text-blue-800">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-700">{item.amount}</span>
                    {aiCostEstimates && item.amount !== "₹0" && (
                      <div className="text-xs text-blue-500">AI estimate</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {aiCostEstimates && (
              <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-sm text-yellow-700">
                  <Lightbulb className="h-4 w-4" />
                  <span>Cost estimates powered by AI based on your location and destination</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Travel Timeline</h3>
                <p className="text-blue-100 text-sm">Key milestones</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300"></div>
              
              <div className="space-y-6">
                {dynamicTimeline.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      {item.icon === "Plane" && <Plane className={index === 3 ? "h-5 w-5 transform rotate-45" : "h-5 w-5"} />}
                      {item.icon === "Hotel" && <Hotel className="h-5 w-5" />}
                      {item.icon === "Star" && <Star className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.date}</div>
                      <div className="text-xs text-blue-600 mt-1">{item.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Quick Actions & Documents</h3>
                <p className="text-blue-100 text-sm">Trip management</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                <span>Quick Actions</span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleQuickAction('share')}
                  className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg h-12 transition-all ${
                    activeQuickAction === 'share' ? 'scale-95' : ''
                  }`}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Trip
                </Button>
                <Button 
                  onClick={() => handleQuickAction('export')}
                  className={`bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg h-12 transition-all ${
                    activeQuickAction === 'export' ? 'scale-95' : ''
                  }`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button 
                  onClick={() => handleQuickAction('map')}
                  variant="outline" 
                  className={`border-purple-200 text-purple-700 hover:bg-purple-50 h-12 transition-all ${
                    activeQuickAction === 'map' ? 'scale-95' : ''
                  }`}
                >
                  <Map className="h-4 w-4 mr-2" />
                  View Map
                </Button>
                <Button 
                  onClick={() => handleQuickAction('help')}
                  variant="outline" 
                  className={`border-orange-200 text-orange-700 hover:bg-orange-50 h-12 transition-all ${
                    activeQuickAction === 'help' ? 'scale-95' : ''
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Get Help
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Document Checklist</span>
              </h4>
              <div className="space-y-3">
                {dynamicDocuments.map((item, index) => {
                  const IconComponent = {
                    "BookOpen": BookOpen,
                    "Plane": Plane,
                    "Hotel": Hotel,
                    "Shield": Shield,
                    "CreditCard": CreditCard,
                    "Smartphone": Smartphone
                  }[item.icon] || BookOpen;

                  return (
                    <div 
                      key={index} 
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        item.status 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'
                      }`}
                    >
                      <IconComponent className={`h-5 w-5 ${item.status ? 'text-green-600' : 'text-gray-500'}`} />
                      <span className={`flex-1 font-medium ${item.status ? 'text-green-800' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                      {item.status ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts and Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Emergency Contacts</h3>
                <p className="text-blue-100 text-sm">Important numbers</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {dynamicContacts.map((contact, index) => {
              const IconComponent = {
                "AlertTriangle": AlertTriangle,
                "Hotel": Hotel,
                "Globe": Globe
              }[contact.icon] || Phone;

              return (
                <div key={index} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                  <div className="font-bold text-red-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5" />
                      <span>{contact.title}</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-200 text-red-700 hover:bg-red-100 h-8"
                      onClick={() => window.open(`tel:${contact.phoneNumber}`, '_self')}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  </div>
                  <div className="text-lg text-red-600 font-mono mt-2 font-bold">{contact.phoneNumber}</div>
                  <div className="text-xs text-red-500 mt-1">{contact.description}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Weather Overview</h3>
                <p className="text-blue-100 text-sm">Current conditions</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {weatherOverview?.current ? (
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
                <Sun className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {Math.round(weatherOverview.current.temp)}°C
                </div>
                <div className="text-orange-700 font-medium capitalize">
                  {weatherOverview.current.description}
                </div>
                <div className="text-sm text-orange-600 mt-2">
                  Feels like {Math.round(weatherOverview.current.feels_like)}°C
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
                <Sun className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {weatherOverview?.temp || "24°C"}
                </div>
                <div className="text-orange-700 font-medium">
                  {weatherOverview?.description || "Perfect for sightseeing!"}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 text-center">
                <Umbrella className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="font-bold text-blue-800">
                  {weatherOverview?.current?.humidity || weatherOverview?.rainChance || "30%"}
                </div>
                <div className="text-xs text-blue-600">
                  {weatherOverview?.current?.humidity ? "Humidity" : "Rain Chance"}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 text-center">
                <Navigation className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="font-bold text-purple-800">
                  {weatherOverview?.current?.wind_speed ? `${weatherOverview.current.wind_speed} m/s` : weatherOverview?.windSpeed || "Light"}
                </div>
                <div className="text-xs text-purple-600">Wind Speed</div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-bold text-green-800">Weather Recommendation</div>
                  <div className="text-sm text-green-700 mt-1">
                    {weatherOverview?.recommendation || "Pack layers and a light rain jacket. Perfect weather for outdoor activities and sightseeing!"}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => window.open(`https://weather.com/weather/today/l/${encodeURIComponent(getDestinationName(trip?.destination) || 'paris')}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                7-Day Forecast
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations Section */}
      {loadingRecommendations && (
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Loader className="h-5 w-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">AI Recommendations</h3>
                <p className="text-blue-100 text-sm">Loading personalized insights...</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {aiRecommendations && (
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">AI Recommendations</h3>
                <p className="text-blue-100 text-sm">Personalized insights for your trip</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Cultural Insights
              </h4>
              <p className="text-sm text-blue-700">{aiRecommendations.culturalInfo}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Local Tips
              </h4>
              <p className="text-sm text-green-700">{aiRecommendations.localTips}</p>
            </div>

            {aiRecommendations.mustVisit && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Must-Visit Places
                </h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  {aiRecommendations.mustVisit.map((place, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-purple-600" />
                      {place}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OverviewTab;
