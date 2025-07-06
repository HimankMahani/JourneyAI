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
  
  googleLogin: async (credential) => {
    try {
      const response = await api.post('/auth/google', { credential });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
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
      // Check if we're in test mode (for development)
      const isTestMode = window.location.search.includes('test=true') || 
                        localStorage.getItem('testMode') === 'true';
      
      if (isTestMode) {
        // Use test endpoint with hardcoded test user
        const response = await api.get('/generator/test-frontend-trips/websitetest@example.com');
        return response.data;
      } else {
        // Use regular authenticated endpoint
        const response = await api.get('/trips');
        return response.data;
      }
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  getTripById: async (id) => {
    try {
      console.log('API: Fetching trip with ID:', id);
      const response = await api.get(`/trips/${id}`);
      console.log('API: Trip fetch response:', response.data);
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
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },
  
  regenerateTripItinerary: async (tripId, preferences) => {
    try {
      const response = await api.post(`/generator/update-itinerary/${tripId}`, preferences);
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

  getAIResponseFiles: async (tripId, type = null) => {
    try {
      const url = type ? `/generator/ai-files/${tripId}?type=${type}` : `/generator/ai-files/${tripId}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  },

  getAIResponse: async (tripId, type = 'itinerary') => {
    try {
      const response = await api.get(`/generator/ai-response/${tripId}/${type}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network Error');
    }
  }
};

// Export default api instance for any other requests
export default api;
