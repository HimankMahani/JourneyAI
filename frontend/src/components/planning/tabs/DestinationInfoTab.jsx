import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  CloudRain,
  Sun,
  Cloud,
  Snowflake,
  RefreshCw,
  Clock,
  Info,
  Globe,
  Heart,
  Lightbulb,
  Calendar,
  AlertTriangle,
  Eye,
  Sunrise,
  Sunset
} from 'lucide-react';
import { weatherService } from '@/services/api';

const DestinationInfoTab = ({ destination, weather, tripData }) => {
  const [localWeather, setLocalWeather] = useState(weather);
  const [forecast, setForecast] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Extract destination name from trip data
  const destinationName = destination || 
    (typeof tripData?.destination === 'string' ? tripData.destination : tripData?.destination?.name) || 
    'Unknown';
  
  const fetchWeatherData = useCallback(async () => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    
    try {
      console.log('DestinationInfoTab: Fetching weather for:', destinationName);
      
      // Fetch both current weather and forecast
      const [currentWeather, forecastData] = await Promise.all([
        weatherService.getCurrentWeather({ city: destinationName }),
        weatherService.getForecast({ city: destinationName })
      ]);
      
      console.log('DestinationInfoTab: Current weather:', currentWeather);
      console.log('DestinationInfoTab: Forecast:', forecastData);
      
      setLocalWeather(currentWeather);
      setForecast(forecastData);
    } catch (error) {
      console.error('DestinationInfoTab: Failed to fetch weather:', error);
      setWeatherError(error.message || 'Failed to fetch weather data');
    } finally {
      setIsLoadingWeather(false);
    }
  }, [destinationName]);

  // Fetch weather data on component mount if not provided
  useEffect(() => {
    if (!weather && destinationName !== 'Unknown') {
      fetchWeatherData();
    }
  }, [destinationName, weather, fetchWeatherData]);

  const refreshWeather = () => {
    fetchWeatherData();
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition, iconCode) => {
    const lowerCondition = condition?.toLowerCase() || '';
    
    if (iconCode) {
      // Use OpenWeather icon codes for more accuracy
      if (iconCode.includes('01')) return <Sun className="w-8 h-8 text-yellow-500" />;
      if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <Cloud className="w-8 h-8 text-gray-500" />;
      if (iconCode.includes('09') || iconCode.includes('10') || iconCode.includes('11')) return <CloudRain className="w-8 h-8 text-blue-500" />;
      if (iconCode.includes('13')) return <Snowflake className="w-8 h-8 text-blue-200" />;
    }
    
    // Fallback to text-based condition matching
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
      return <Sun className="w-8 h-8 text-yellow-500" />;
    }
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || lowerCondition.includes('shower')) {
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    }
    if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
      return <Cloud className="w-8 h-8 text-gray-500" />;
    }
    if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard')) {
      return <Snowflake className="w-8 h-8 text-blue-200" />;
    }
    
    return <Sun className="w-8 h-8 text-gray-400" />;
  };

  // Format temperature
  const formatTemp = (temp) => {
    if (typeof temp === 'number') {
      return `${Math.round(temp)}°C`;
    }
    return temp || 'N/A';
  };

  // Get weather-based recommendations
  const getWeatherRecommendations = (weatherData) => {
    if (!weatherData?.current) return [];
    
    const temp = weatherData.current.temp;
    const condition = weatherData.current.description?.toLowerCase() || '';
    const humidity = weatherData.current.humidity;
    const windSpeed = weatherData.current.wind_speed;
    
    const recommendations = [];
    
    if (temp < 10) {
      recommendations.push('Pack warm clothing and layers');
    } else if (temp > 30) {
      recommendations.push('Bring light, breathable clothing and sun protection');
    }
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      recommendations.push('Carry an umbrella or rain jacket');
    }
    
    if (humidity > 80) {
      recommendations.push('Expect high humidity - dress accordingly');
    }
    
    if (windSpeed > 15) {
      recommendations.push('Expect windy conditions - secure loose items');
    }
    
    return recommendations;
  };

  // Get cultural info and AI-generated tips from trip data
  const getCulturalInfo = (destination, tripData) => {
    // Extract AI-generated tips from trip data
    const aiTips = tripData?.aiSuggestions?.find(suggestion => 
      suggestion.type === 'safety' || suggestion.type === 'tips'
    );
    
    let parsedTips = [];
    if (aiTips?.content) {
      try {
        // Try to parse the AI tips content
        if (typeof aiTips.content === 'string') {
          // Handle markdown-formatted content from AI
          const content = aiTips.content;
          
          // Split by lines and filter out headers, empty lines, and formatting
          const lines = content.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 0 && 
                   !trimmed.startsWith('**') && // Skip bold headers
                   !trimmed.startsWith('#') && // Skip markdown headers
                   !trimmed.match(/^\*\*\d+\./) && // Skip numbered section headers
                   !trimmed.toLowerCase().includes('here are') && // Skip intro lines
                   !trimmed.toLowerCase().includes('enjoy your trip') && // Skip outro lines
                   trimmed.length > 20; // Only substantial content
          });
          
          parsedTips = lines
            .map(line => {
              // Clean up markdown formatting and list prefixes
              return line
                .replace(/^\*\s+/, '') // Remove markdown bullets
                .replace(/^\*\*(.+?)\*\*:?\s*/, '') // Remove bold text (like **Metro is Your Friend:**)
                .replace(/^\d+\.\s*/, '') // Remove numbered lists
                .replace(/^[-*•]\s*/, '') // Remove bullet points
                .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold formatting but keep text
                .trim();
            })
            .filter(tip => {
              // Final filtering for quality tips
              return tip.length > 15 && 
                     !tip.toLowerCase().includes('covering the areas') &&
                     !tip.toLowerCase().startsWith('okay,') &&
                     !tip.includes(':') || tip.split(':').length === 2; // Allow tips with one colon
            })
            .slice(0, 8); // Limit to 8 best tips for better UI
          
          // If no good tips found, try to split by common delimiters
          if (parsedTips.length === 0) {
            const delimiters = ['. ', '; ', '\n\n'];
            for (const delimiter of delimiters) {
              const splitTips = aiTips.content.split(delimiter).filter(tip => tip.trim().length > 10);
              if (splitTips.length > 1) {
                parsedTips = splitTips.map(tip => tip.trim());
                break;
              }
            }
          }
        } else if (Array.isArray(aiTips.content)) {
          parsedTips = aiTips.content.filter(tip => tip && tip.length > 10);
        }
      } catch (error) {
        console.error('Error parsing AI tips:', error);
      }
    }
    
    // If still no tips found but we have content, use the whole content as a single tip
    if (parsedTips.length === 0 && aiTips?.content && typeof aiTips.content === 'string' && aiTips.content.length > 20) {
      parsedTips = [aiTips.content.trim()];
    }
    
    // Fallback mock data for culture info
    const mockCulturalData = {
      'Paris': {
        culture: 'French culture values politeness and formal greetings. Always say "Bonjour" when entering shops and "Au revoir" when leaving.',
        fallbackTips: [
          'Restaurants typically open for dinner at 7:30 PM',
          'Tipping 10% is appreciated but not mandatory',
          'Many shops close on Sundays',
          'Learn basic French phrases - locals appreciate the effort'
        ]
      },
      'Tokyo': {
        culture: 'Japanese culture emphasizes respect and politeness. Bowing is common and removing shoes indoors is expected.',
        fallbackTips: [
          'Cash is still widely used - carry yen',
          'Avoid eating while walking',
          'Be quiet on public transportation',
          'Don\'t tip - it\'s not part of Japanese culture'
        ]
      },
      'New York': {
        culture: 'Fast-paced city culture with diverse neighborhoods. Direct communication is normal and expected.',
        fallbackTips: [
          'Subway runs 24/7 but can be crowded during rush hour',
          'Tipping 18-20% is standard at restaurants',
          'Walk quickly and stay aware of your surroundings',
          'Don\'t block sidewalks - New Yorkers are always in a hurry'
        ]
      },
      'London': {
        culture: 'British culture values queuing and politeness. "Please" and "thank you" are used frequently.',
        fallbackTips: [
          'Stand on the right side of escalators',
          'Pubs close early compared to other cities',
          'Carry an umbrella - weather can change quickly',
          'Mind the gap on the London Underground'
        ]
      },
      'Barcelona': {
        culture: 'Spanish culture includes late dining and afternoon siestas. Family and social connections are important.',
        fallbackTips: [
          'Lunch is typically 2-4 PM, dinner after 9 PM',
          'Many shops close during siesta (2-5 PM)',
          'Learn basic Spanish phrases - locals appreciate the effort',
          'Pickpockets are common in tourist areas - stay vigilant'
        ]
      },
      'Rome': {
        culture: 'Italian culture emphasizes family, food, and taking time to enjoy life. Gestures are an important part of communication.',
        fallbackTips: [
          'Dress modestly when visiting churches',
          'Tipping 10-15% is appreciated but not mandatory',
          'Restaurants often close between lunch and dinner',
          'Learn basic Italian greetings'
        ]
      },
      'Amsterdam': {
        culture: 'Dutch culture values directness and informality. Cycling is a major part of daily life.',
        fallbackTips: [
          'Rent a bike to get around like a local',
          'Be careful of bike lanes when walking',
          'Many locals speak excellent English',
          'Tipping is appreciated but not expected'
        ]
      },
      'Dubai': {
        culture: 'UAE culture blends traditional Islamic values with modern cosmopolitan lifestyle. Respect for local customs is important.',
        fallbackTips: [
          'Dress conservatively, especially in public areas',
          'Avoid public displays of affection',
          'Friday is the holy day - some businesses may be closed',
          'Haggling is common in souks but not in malls'
        ]
      }
    };
    
    const mockData = mockCulturalData[destination] || {
      culture: 'Every destination has its unique culture and customs. Research local etiquette and traditions before your trip to show respect for the local community.',
      fallbackTips: [
        'Learn basic phrases in the local language',
        'Research local customs and dress codes',
        'Be respectful of religious and cultural sites',
        'Try local cuisine and respect dining customs',
        'Observe and follow local social norms'
      ]
    };
    
    return {
      culture: mockData.culture,
      tips: parsedTips.length > 0 ? parsedTips : mockData.fallbackTips,
      isAIGenerated: parsedTips.length > 0
    };
  };

  const culturalInfo = getCulturalInfo(destinationName, tripData);

  return (
    <div className="space-y-8">
      {/* Weather Information */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Thermometer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Weather Information</h3>
                <p className="text-blue-100 text-sm">{destinationName}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshWeather}
              disabled={isLoadingWeather}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingWeather ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {weatherError && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-6">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">{weatherError}</span>
            </div>
          )}

          {localWeather?.current ? (
            <div className="space-y-6">
              {/* Current Weather Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">
                      {getWeatherIcon(localWeather.current.description, localWeather.current.icon)}
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-gray-800">
                        {formatTemp(localWeather.current.temp)}
                      </div>
                      <div className="text-lg text-gray-600 capitalize">
                        {localWeather.current.description}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {localWeather.location?.name || destinationName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Feels like</div>
                    <div className="text-2xl font-semibold text-gray-700">
                      {formatTemp(localWeather.current.feels_like)}
                    </div>
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                    <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-1">Humidity</div>
                    <div className="text-lg font-semibold">{localWeather.current.humidity}%</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                    <Wind className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-1">Wind</div>
                    <div className="text-lg font-semibold">{localWeather.current.wind_speed} m/s</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                    <Gauge className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-1">Pressure</div>
                    <div className="text-lg font-semibold">{localWeather.current.pressure} hPa</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                    <Eye className="w-5 h-5 text-gray-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-1">Visibility</div>
                    <div className="text-lg font-semibold">10 km</div>
                  </div>
                </div>

                {/* Weather Recommendations */}
                {getWeatherRecommendations(localWeather).length > 0 && (
                  <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-800">
                      <Lightbulb className="w-4 h-4" />
                      Weather Recommendations
                    </h4>
                    <div className="space-y-2">
                      {getWeatherRecommendations(localWeather).map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-purple-700">
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 text-center">
              {isLoadingWeather ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-gray-600">Loading weather data...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <Cloud className="w-16 h-16 mx-auto text-gray-400" />
                  <div className="text-gray-600">
                    <p className="font-medium text-lg">Weather data not available</p>
                    <p className="text-sm text-gray-500">Please log in to see live weather information</p>
                  </div>
                  
                  {/* Sample Weather Display */}
                  <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium mb-3 text-gray-700">Sample Weather Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <span>Partly Cloudy</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Thermometer className="w-4 h-4 text-gray-500" />
                        <span>22°C</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span>65% Humidity</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Wind className="w-4 h-4 text-gray-500" />
                        <span>8 km/h</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5-Day Forecast */}
      {forecast?.forecast && (
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">5-Day Forecast</h3>
                <p className="text-blue-100 text-sm">Weather ahead</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {forecast.forecast.slice(0, 5).map((day, index) => (
                <div key={index} className="text-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow border border-gray-200">
                  <div className="text-sm font-medium mb-2 text-gray-700">
                    {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="flex justify-center mb-3">
                    {getWeatherIcon(day.condition?.main || '', day.icon)}
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-gray-800">{formatTemp(day.temp_max)}</div>
                    <div className="text-sm text-gray-500">{formatTemp(day.temp_min)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cultural Information */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Cultural Information</h3>
              <p className="text-blue-100 text-sm">Local customs and tips</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Local Culture */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                <Heart className="w-5 h-5" />
                Local Culture
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {culturalInfo.culture}
              </p>
            </div>

            {/* Local Tips */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
              <h4 className="font-semibold mb-4 flex items-center justify-between text-purple-800">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Local Tips
                </div>
                {culturalInfo.isAIGenerated && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                    AI Generated
                  </Badge>
                )}
              </h4>
              <div className="space-y-3">
                {culturalInfo.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DestinationInfoTab;
