import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the token in headers for authorized requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error);
      throw error.response?.data?.message 
        ? { message: error.response.data.message } 
        : error.response?.data || new Error('Network Error');
    }
  },

  register: async (userData) => {
    try {
      // Make sure we're sending the exact fields the backend expects
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response ? error.response.data : error);
      throw error.response?.data?.message 
        ? { message: error.response.data.message } 
        : error.response?.data || new Error('Network Error');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Trip services
export const tripService = {
  getAllTrips: async () => {
    try {
      // Use regular authenticated endpoint
      const response = await api.get('/trips');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  getTripById: async (id) => {
    try {
      const response = await api.get(`/trips/${id}`);
      return response.data;
    } catch (error) {
      console.error('API: Trip fetch error:', error);
      console.error('API: Error response:', error.response?.data);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  createTrip: async (tripData) => {
    try {
      const response = await api.post('/trips', tripData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  updateTrip: async (id, tripData) => {
    try {
      const response = await api.put(`/trips/${id}`, tripData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  deleteTrip: async (id) => {
    try {
      const response = await api.delete(`/trips/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  generateAIItinerary: async (preferences) => {
    try {
      const response = await api.post('/generator/itinerary', preferences);
      // Return the trip data directly since the backend wraps it in a 'trip' property
      return response.data.trip || response.data;
    } catch (error) {
      console.error('Error generating AI itinerary:', error.response?.data || error.message);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
  
  regenerateTripItinerary: async (tripId, preferences) => {
    try {
      const response = await api.post(`/generator/update-itinerary/${tripId}`, preferences);
      // Return the trip data directly for consistency with generateAIItinerary
      return response.data.trip || response.data;
    } catch (error) {
      console.error('Error regenerating trip itinerary:', error.response?.data || error.message);
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  updateItineraryActivity: async (tripId, { dayIndex, activityIndex, updates }) => {
    try {
      const response = await api.patch(`/trips/${tripId}/itinerary/activity`, {
        dayIndex,
        activityIndex,
        updates
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  // File-based operations
  reparseItinerary: async (tripId) => {
    try {
      const response = await api.post(`/generator/reparse-itinerary/${tripId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  getStorageStats: async () => {
    try {
      const response = await api.get('/generator/storage-stats');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  getPlacePhoto: async (placeName) => {
    try {
      const response = await api.get(`/generator/place-photo/${encodeURIComponent(placeName)}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  getPlacePhotos: async (places) => {
    try {
      const response = await api.post('/generator/place-photos', { places });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  }
};

export const weatherService = {
  getCurrentWeather: async ({ city, lat, lon }) => {
    try {
      let url = '/weather/current?';
      if (city) url += `city=${encodeURIComponent(city)}`;
      if (lat && lon) url += `lat=${lat}&lon=${lon}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
  getForecast: async ({ city, lat, lon }) => {
    try {
      let url = '/weather/forecast?';
      if (city) url += `city=${encodeURIComponent(city)}`;
      if (lat && lon) url += `lat=${lat}&lon=${lon}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  }
};

// Export default api instance for any other requests
export default api;
