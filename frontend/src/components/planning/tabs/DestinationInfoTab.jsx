import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Thermometer, Sun, Umbrella, Globe, AlertTriangle, Star 
} from 'lucide-react';

const DestinationInfoTab = ({ destinationInfo }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardTitle className="flex items-center space-x-3">
              <Thermometer className="h-5 w-5" />
              <span>Weather & Climate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <Sun className="h-6 w-6 text-orange-500" />
                <span className="font-medium">Average Temperature</span>
              </div>
              <span className="font-bold text-xl text-orange-600">{destinationInfo.weather.avgTemp}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Umbrella className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">{destinationInfo.weather.conditions}</span>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <strong className="text-blue-800">Recommendation:</strong>
                    <p className="text-blue-700 mt-1">{destinationInfo.weather.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardTitle className="flex items-center space-x-3">
              <Globe className="h-5 w-5" />
              <span>Cultural Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-700">Language</span>
                <span className="font-bold text-green-800">{destinationInfo.culture.language}</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-700">Currency</span>
                <span className="font-bold text-blue-800">{destinationInfo.culture.currency}</span>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium text-yellow-700">Tipping</span>
                <p className="text-sm text-yellow-800 mt-1">{destinationInfo.culture.tipping}</p>
              </div>
              <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                <span className="font-medium text-purple-700">Greeting</span>
                <span className="font-bold text-purple-800">{destinationInfo.culture.greeting}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="flex items-center space-x-3">
              <Star className="h-5 w-5" />
              <span>Local Tips & Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {destinationInfo.tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DestinationInfoTab;
