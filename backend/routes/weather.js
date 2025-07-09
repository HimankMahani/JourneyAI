import express from 'express';
import axios from 'axios';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/weather/current
// @desc    Get current weather for a location
// @access  Public
router.get('/current', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    
    if ((!lat || !lon) && !city) {
      return res.status(400).json({ message: 'Please provide either coordinates (lat, lon) or a city name' });
    }
    
    let url;
    
    if (city) {
      // Clean up the city name - take only the first part before comma
      const cleanCity = city.split(',')[0].trim();
      // Allow both city and country names by sending directly to OpenWeather API
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cleanCity)}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    }
    
    let response;
    try {
      response = await axios.get(url);
    } catch (apiError) {
      if (apiError.response && apiError.response.status === 404) {
        return res.status(404).json({ message: 'City not found. Please provide a valid city name.' });
      }
      // Other errors (network, API key, etc.)
      return res.status(500).json({ message: apiError.message });
    }
    
    // Process response to format we want
    const weather = {
      location: {
        name: response.data.name,
        country: response.data.sys.country,
        coordinates: {
          lat: response.data.coord.lat,
          lon: response.data.coord.lon
        }
      },
      current: {
        temp: response.data.main.temp,
        feels_like: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        wind_speed: response.data.wind.speed,
        wind_direction: response.data.wind.deg,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        clouds: response.data.clouds.all,
        timestamp: response.data.dt,
        sunrise: response.data.sys.sunrise,
        sunset: response.data.sys.sunset
      }
    };
    
    res.json(weather);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/weather/forecast
// @desc    Get 5-day weather forecast for a location
// @access  Public
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    
    if ((!lat || !lon) && !city) {
      return res.status(400).json({ message: 'Please provide either coordinates (lat, lon) or a city name' });
    }
    
    let url;
    
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    }
    
    const response = await axios.get(url);
    
    // Process and organize forecast data by day
    const forecastData = response.data.list;
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
    
    res.json({
      location: {
        name: response.data.city.name,
        country: response.data.city.country,
        coordinates: {
          lat: response.data.city.coord.lat,
          lon: response.data.city.coord.lon
        }
      },
      forecast
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
