import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import TravelPlanning from './components/TravelPlanning'
import Footer from './components/Footer'
import Destinations from './components/Destinations'
import Planning from './components/Planning.jsx'
import Booking from './components/Booking'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import ForgotPassword from './components/ForgotPassword'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { TripProvider } from './contexts/TripContext'
import { Toaster } from 'sonner'
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create a layout component to avoid repetition
const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    {children}
    <Footer />
  </div>
);

// Create a simple component for "coming soon" pages
const ComingSoon = ({ title }) => (
  <div className="p-8 text-center">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title} - Coming Soon</h2>
    <p className="text-gray-600">We're working hard to bring you this feature!</p>
  </div>
);

const HomePage = () => (
  <>
    <Hero />
    <TravelPlanning />
  </>
);

const App = () => {
  useEffect(() => {
    // Ping backend to wake it up
    axios.get(`${API_BASE_URL}/auth/ping`).catch(() => {});
    
    // Send visit details to backend for Discord notification
    fetch(`${API_BASE_URL}/visit/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: window.location.href,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      })
    }).catch(err => console.error("Visit tracking failed:", err));
  }, []);

  return (
    <Router>
      <AuthProvider>
        <TripProvider>
          <Routes>
          <Route path="/planning/:tripId" element={
            <ProtectedRoute>
              <Layout>
                <Planning />
              </Layout>
            </ProtectedRoute>
          }/>
          <Route path="/" element={
            <Layout>
              <HomePage />
            </Layout>
          }/>
          <Route path="/destinations" element={
            <ProtectedRoute>
              <Layout>
                <Destinations />
              </Layout>
            </ProtectedRoute>
          }/>
          <Route path="/my-trips" element={
            <ProtectedRoute>
              <Layout>
                <Booking />
              </Layout>
            </ProtectedRoute>
          }/>
          {/* Redirect old bookings route to new my-trips route */}
          <Route path="/bookings" element={<Navigate to="/my-trips" />} />
          <Route path="/login" element={
            <SignIn />
          }/>
          <Route path="/signup" element={
            <SignUp />
          }/>
          <Route path="/forgot-password" element={
            <ForgotPassword />
          }/>
          {/* Catch-all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </TripProvider>
      </AuthProvider>
      <Toaster position="top-center" richColors />
    </Router>
  )
}

export default App
