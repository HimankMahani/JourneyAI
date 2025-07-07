import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      // Map frontend field names to backend field names if needed
      const backendUserData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        location: userData.location
      };
      
      const data = await authService.register(backendUserData);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const googleAuth = async (credential) => { // eslint-disable-line no-unused-vars
    try {
      setLoading(true);
      // This would call your backend to verify the Google token and authenticate the user
      // For now, we'll just simulate a successful login
      // const data = await authService.googleLogin(credential);
      
      // Simulate a successful login
      const mockData = {
        user: {
          id: 'google-user-id',
          name: 'Google User',
          email: 'googleuser@example.com',
        },
        token: 'mock-token-for-google-auth'
      };
      
      localStorage.setItem('token', mockData.token);
      localStorage.setItem('user', JSON.stringify(mockData.user));
      setUser(mockData.user);
      
      return { success: true, data: mockData };
    } catch (error) {
      return { success: false, error: error.message || 'Google authentication failed' };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const data = await authService.forgotPassword(email);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || 'Password reset request failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    googleAuth,
    forgotPassword,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
