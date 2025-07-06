/**
 * Service for handling weather data from OpenWeather API
 */

import axios from 'axios';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Get current weather for a location by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Units of measurement (metric, imperial, standard)
 * @returns {Promise<Object>} - Weather data
 */
export const getCurrentWeatherByCoords = async (lat, lon, units = 'metric') => {
  try {
    const url = `${WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_API_KEY}`;
    
    const response = await axios.get(url);
    
    return formatWeatherResponse(response.data);
  } catch (error) {
    console.error('Error fetching current weather by coordinates:', error);
    throw error;
  }
};

/**
 * Get current weather for a location by city name
 * @param {string} city - City name
 * @param {string} units - Units of measurement (metric, imperial, standard)
 * @returns {Promise<Object>} - Weather data
 */
export const getCurrentWeatherByCity = async (city, units = 'metric') => {
  try {
    const url = `${WEATHER_API_BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${units}&appid=${OPENWEATHER_API_KEY}`;
    
    const response = await axios.get(url);
    
    return formatWeatherResponse(response.data);
  } catch (error) {
    console.error('Error fetching current weather by city:', error);
    throw error;
  }
};

/**
 * Get weather forecast for a location by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Units of measurement (metric, imperial, standard)
 * @returns {Promise<Object>} - Forecast data
 */
export const getForecastByCoords = async (lat, lon, units = 'metric') => {
  try {
    const url = `${WEATHER_API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${OPENWEATHER_API_KEY}`;
    
    const response = await axios.get(url);
    
    return formatForecastResponse(response.data);
  } catch (error) {
    console.error('Error fetching forecast by coordinates:', error);
    throw error;
  }
};

/**
 * Get weather forecast for a location by city name
 * @param {string} city - City name
 * @param {string} units - Units of measurement (metric, imperial, standard)
 * @returns {Promise<Object>} - Forecast data
 */
export const getForecastByCity = async (city, units = 'metric') => {
  try {
    const url = `${WEATHER_API_BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${units}&appid=${OPENWEATHER_API_KEY}`;
    
    const response = await axios.get(url);
    
    return formatForecastResponse(response.data);
  } catch (error) {
    console.error('Error fetching forecast by city:', error);
    throw error;
  }
};

/**
 * Format the weather API response
 * @param {Object} data - Raw API response
 * @returns {Object} - Formatted weather data
 */
const formatWeatherResponse = (data) => {
  return {
    location: {
      name: data.name,
      country: data.sys.country,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    },
    current: {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed,
      wind_direction: data.wind.deg,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      main: data.weather[0].main,
      clouds: data.clouds.all,
      timestamp: data.dt,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset
    }
  };
};

/**
 * Format the forecast API response
 * @param {Object} data - Raw API response
 * @returns {Object} - Formatted forecast data
 */
const formatForecastResponse = (data) => {
  // Process and organize forecast data by day
  const forecastData = data.list;
  const dailyForecasts = {};
  
  forecastData.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        date,
        timestamps: [],
        temp_min: Infinity,
        temp_max: -Infinity,
        condition: {},
        icon: ''
      };
    }
    
    dailyForecasts[date].timestamps.push({
      time: new Date(item.dt * 1000).toISOString(),
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      wind_speed: item.wind.speed,
      probability: item.pop
    });
    
    // Update min/max temps
    dailyForecasts[date].temp_min = Math.min(dailyForecasts[date].temp_min, item.main.temp_min);
    dailyForecasts[date].temp_max = Math.max(dailyForecasts[date].temp_max, item.main.temp_max);
    
    // Use noon forecast for the day's "main" condition if possible
    const hour = new Date(item.dt * 1000).getHours();
    if (hour >= 11 && hour <= 14) {
      dailyForecasts[date].condition = item.weather[0];
      dailyForecasts[date].icon = item.weather[0].icon;
    }
  });
  
  // If we didn't set an icon from noon, use the first timestamp's icon
  Object.keys(dailyForecasts).forEach(date => {
    if (!dailyForecasts[date].icon && dailyForecasts[date].timestamps.length > 0) {
      dailyForecasts[date].icon = dailyForecasts[date].timestamps[0].icon;
      dailyForecasts[date].condition = {
        main: dailyForecasts[date].timestamps[0].description
      };
    }
  });
  
  // Convert to array sorted by date
  const forecast = Object.values(dailyForecasts).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  return {
    location: {
      name: data.city.name,
      country: data.city.country,
      coordinates: {
        lat: data.city.coord.lat,
        lon: data.city.coord.lon
      }
    },
    forecast
  };
};
