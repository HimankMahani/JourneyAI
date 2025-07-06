import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, CalendarDays, Camera, Utensils, Star, Users, Car, Hotel, 
  PieChart, Clock, Plane, IndianRupee, TrendingUp, Share2, Download, 
  Map, MessageSquare, CheckCircle, BookOpen, Shield, CreditCard, 
  Smartphone, CheckCircle2, Circle, Phone, AlertTriangle, Globe, 
  ExternalLink, Sun, Umbrella, Navigation
} from 'lucide-react';

const OverviewTab = ({ 
  travelTimeline, 
  budgetBreakdown, 
  documentChecklist, 
  emergencyContacts, 
  weatherOverview 
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
            <CardTitle className="flex items-center space-x-3 text-2xl">
              <BarChart3 className="h-6 w-6" />
              <span>Trip Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                <CalendarDays className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-600 mb-1">7</div>
                <div className="text-sm text-blue-700 font-medium">Days</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
                <Camera className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-600 mb-1">18</div>
                <div className="text-sm text-green-700 font-medium">Activities</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                <Utensils className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-600 mb-1">8</div>
                <div className="text-sm text-orange-700 font-medium">Restaurants</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-600 mb-1">12</div>
                <div className="text-sm text-purple-700 font-medium">Attractions</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-indigo-600" />
                <div>
                  <div className="font-bold text-indigo-800">2 Travelers</div>
                  <div className="text-sm text-indigo-600">Adult travelers</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                <Car className="h-6 w-6 text-teal-600" />
                <div>
                  <div className="font-bold text-teal-800">6 Transports</div>
                  <div className="text-sm text-teal-600">Flights, trains, metro</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                <Hotel className="h-6 w-6 text-pink-600" />
                <div>
                  <div className="font-bold text-pink-800">1 Hotel</div>
                  <div className="text-sm text-pink-600">7 nights stay</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <PieChart className="h-5 w-5" />
              <span>Budget Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-green-600 mb-1">₹2,92,000</div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </div>
            
            <div className="space-y-3">
              {budgetBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {item.icon === "Plane" && <Plane className="h-5 w-5 text-blue-600" />}
                    {item.icon === "Hotel" && <Hotel className="h-5 w-5 text-purple-600" />}
                    {item.icon === "Utensils" && <Utensils className="h-5 w-5 text-orange-600" />}
                    {item.icon === "Camera" && <Camera className="h-5 w-5 text-green-600" />}
                    {item.icon === "Car" && <Car className="h-5 w-5 text-gray-600" />}
                    <span className="font-medium text-blue-800">{item.category}</span>
                  </div>
                  <span className="font-bold text-blue-700">{item.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <Clock className="h-5 w-5" />
              <span>Travel Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300"></div>
              
              <div className="space-y-6">
                {travelTimeline.map((item, index) => (
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
          <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5" />
              <span>Quick Actions & Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                <span>Quick Actions</span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-lg h-12">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Trip
                </Button>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg h-12">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 h-12">
                  <Map className="h-4 w-4 mr-2" />
                  View Map
                </Button>
                <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 h-12">
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
                {documentChecklist.map((item, index) => {
                  const IconComponent = {
                    "BookOpen": BookOpen,
                    "Plane": Plane,
                    "Hotel": Hotel,
                    "Shield": Shield,
                    "CreditCard": CreditCard,
                    "Smartphone": Smartphone
                  }[item.icon];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <Phone className="h-5 w-5" />
              <span>Emergency Contacts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {emergencyContacts.map((contact, index) => {
              const IconComponent = {
                "AlertTriangle": AlertTriangle,
                "Hotel": Hotel,
                "Globe": Globe
              }[contact.icon];

              return (
                <div key={index} className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                  <div className="font-bold text-red-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5" />
                      <span>{contact.title}</span>
                    </div>
                    <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 h-8">
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
          <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
            <CardTitle className="flex items-center space-x-3">
              <Sun className="h-5 w-5" />
              <span>Weather Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
              <Sun className="h-12 w-12 text-orange-500 mx-auto mb-3" />
              <div className="text-4xl font-bold text-orange-600 mb-2">{weatherOverview.temp}</div>
              <div className="text-orange-700 font-medium">Average Temperature</div>
              <div className="text-sm text-orange-600 mt-2">{weatherOverview.description}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 text-center">
                <Umbrella className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="font-bold text-blue-800">{weatherOverview.rainChance}</div>
                <div className="text-xs text-blue-600">Rain Chance</div>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 text-center">
                <Navigation className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="font-bold text-purple-800">{weatherOverview.windSpeed}</div>
                <div className="text-xs text-purple-600">Wind Speed</div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-bold text-green-800">Weather Recommendation</div>
                  <div className="text-sm text-green-700 mt-1">
                    {weatherOverview.recommendation}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50">
                <ExternalLink className="h-4 w-4 mr-2" />
                7-Day Forecast
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
