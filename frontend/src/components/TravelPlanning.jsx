import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Sparkles, Zap, Star } from "lucide-react";
import { TripGenerationLoader } from "./ui/PlanningPageSkeleton";
import { useTrip } from "@/contexts/useTrip";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TravelPlanning = () => {
  const { generateAIItinerary } = useTrip();
  const navigate = useNavigate();
  
  const [isPlanning, setIsPlanning] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: '',
    budget: ''
  });

  const handlePlanTrip = async () => {
    // Check authentication state first
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log("Authentication state:");
    console.log("- Token exists:", !!token);
    console.log("- Token preview:", token ? token.substring(0, 20) + '...' : 'none');
    console.log("- User exists:", !!user);
    console.log("- User:", user ? JSON.parse(user) : 'none');

    if (!token) {
      toast.error("You must be logged in to generate a trip");
      return;
    }

    // Basic validation
    if (!formData.destination) {
      toast.error("Please enter a destination");
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    setIsPlanning(true);
    
    try {
      // Prepare the data for the API
      const preferences = {
        title: `Trip to ${formData.destination}`,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        travelers: formData.travelers,
        budget: formData.budget,
        interests: selectedInterests
      };
      
      console.log("Sending trip generation request with:", preferences);
      
      // Call the API to generate the itinerary
      const result = await generateAIItinerary(preferences);
      
      console.log("Raw API Response:", result); // Debug log to see the actual response
      console.log("Raw API Response keys:", Object.keys(result));
      console.log("Raw API Response JSON:", JSON.stringify(result, null, 2));
      console.log("result.success:", result.success);
      console.log("result.data:", result.data);
      console.log("result.data.trip:", result.data?.trip);
      console.log("result.data.trip?._id:", result.data?.trip?._id);
      
      // Handle the double-wrapped response structure
      const actualData = result.data || result;
      const trip = actualData.trip;
      
      if (result.success && trip?._id) {
        toast.success("Trip itinerary generated successfully!");
        // Add a small delay to ensure the trip context is updated
        setTimeout(() => {
          navigate(`/planning/${trip._id}`);
        }, 100);
      } else {
        // More detailed error feedback
        const errorMessage = actualData.error || actualData.message || "Failed to generate itinerary";
        console.error("API Error Response:", result);
        console.error("Condition failed - success:", result.success, "trip._id:", trip?._id);
        toast.error(errorMessage);
        setIsPlanning(false);
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      
      // Better error handling with more details
      let errorMessage = "An error occurred while generating your itinerary";
      
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      // Check for specific error conditions
      if (error.message?.includes("API key")) {
        errorMessage = "API key configuration error. Please contact support.";
      } else if (error.message?.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      
      toast.error(errorMessage);
      setIsPlanning(false);
    }
  };

  const toggleInterest = (interestName) => {
    setSelectedInterests(prev => 
      prev.includes(interestName) 
        ? prev.filter(name => name !== interestName)
        : [...prev, interestName]
    );
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const interests = [
    { name: 'Adventure', color: 'bg-red-500 hover:bg-red-600' },
    { name: 'Culture', color: 'bg-purple-500 hover:bg-purple-600' },
    { name: 'Food', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { name: 'Relaxation', color: 'bg-green-500 hover:bg-green-600' },
    { name: 'Nightlife', color: 'bg-indigo-500 hover:bg-indigo-600' },
    { name: 'Nature', color: 'bg-emerald-500 hover:bg-emerald-600' },
    { name: 'History', color: 'bg-amber-500 hover:bg-amber-600' },
    { name: 'Photography', color: 'bg-blue-500 hover:bg-blue-600' }
  ];

  return (
    <>
      {isPlanning && <TripGenerationLoader />}
      
      <section id="travel-planning" className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">
              <Zap className="w-4 h-4 mr-2" />
              Powered by AI
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-6">
              AI Travel Itinerary
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Create personalized travel itineraries powered by advanced AI technology
            </p>
          </div>

          {/* AI Itinerary Planning */}
          <div className="max-w-6xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-lg relative overflow-hidden rounded-xl">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10 rounded-xl"></div>
              
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white rounded-t-xl relative overflow-hidden p-6">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
                <div className="text-3xl flex items-center relative z-10">
                  <div className="bg-white/20 p-3 rounded-xl mr-4">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div>
                    <div>Plan Your Dream Trip</div>
                    <div className="text-lg font-normal text-purple-100 mt-1">Let AI handle the details</div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-10 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                  <div className="space-y-3 group">
                    <label className="text-sm font-semibold flex items-center text-gray-700 group-hover:text-purple-600 transition-colors">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      Destination
                    </label>
                    <input
                      type="text"
                      placeholder="Where do you want to go?"
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3 group">
                    <label className="text-sm font-semibold flex items-center text-gray-700 group-hover:text-purple-600 transition-colors">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3 group">
                    <label className="text-sm font-semibold flex items-center text-gray-700 group-hover:text-purple-600 transition-colors">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3 group">
                    <label className="text-sm font-semibold flex items-center text-gray-700 group-hover:text-purple-600 transition-colors">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      Travelers
                    </label>
                    <select
                      value={formData.travelers}
                      onChange={(e) => handleInputChange('travelers', e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all duration-300"
                    >
                      <option value="">How many?</option>
                      <option value="1">1 Person</option>
                      <option value="2">2 People</option>
                      <option value="3-4">3-4 People</option>
                      <option value="5+">5+ People</option>
                    </select>
                  </div>

                  <div className="space-y-3 group">
                    <label className="text-sm font-semibold flex items-center text-gray-700 group-hover:text-purple-600 transition-colors">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg mr-3">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      Budget Range
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 rounded-xl py-3 px-4 transition-all duration-300"
                    >
                      <option value="">Select budget</option>
                      <option value="economy">Economy</option>
                      <option value="budget">Budget</option>
                      <option value="mid-range">Mid-range</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <label className="text-lg font-semibold text-gray-800">
                    What interests you? <span className="text-gray-500 font-normal">(Select your preferences)</span>
                  </label>
                  <div className="flex flex-wrap gap-3 pt-5">
                    {interests.map((interest) => (
                      <Button
                        key={interest.name}
                        onClick={() => toggleInterest(interest.name)}
                        className={`rounded-full px-6 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                          selectedInterests.includes(interest.name)
                            ? `${interest.color} text-white`
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {interest.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handlePlanTrip}
                  disabled={isPlanning}
                  className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white py-6 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="flex items-center relative z-10">
                    <Zap className="mr-3 h-6 w-6" />
                    Generate AI Itinerary
                    <Sparkles className="ml-3 h-6 w-6" />
                  </div>
                </Button>
              </div>
            </div>
        </div>
      </section>
    </>
  );
};

export default TravelPlanning;