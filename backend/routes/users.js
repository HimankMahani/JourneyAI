import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      profilePicture,
      preferences
    } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if username is taken if it's being changed
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      
      user.username = username;
    }
    
    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profilePicture) user.profilePicture = profilePicture;
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }
    
    const updatedUser = await user.save();
    
    res.json({
      ...updatedUser._doc,
      password: undefined
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/stats
// @desc    Get user stats (trip counts, etc.)
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get count of trips
    const tripCount = await Trip.countDocuments({ user: req.userId });
    
    // Get count of upcoming trips
    const upcomingTrips = await Trip.countDocuments({
      user: req.userId,
      startDate: { $gt: new Date() }
    });
    
    // Get count of past trips
    const pastTrips = await Trip.countDocuments({
      user: req.userId,
      endDate: { $lt: new Date() }
    });
    
    // Get count of ongoing trips
    const ongoingTrips = await Trip.countDocuments({
      user: req.userId,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    // Get total number of trip days
    const allTrips = await Trip.find({ user: req.userId });
    const totalTripDays = allTrips.reduce((total, trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return total + days;
    }, 0);
    
    // Get most visited country
    const destinations = allTrips.map(trip => trip.destination?.country).filter(Boolean);
    const countryCounts = {};
    destinations.forEach(country => {
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    
    let mostVisitedCountry = null;
    let maxCount = 0;
    
    for (const [country, count] of Object.entries(countryCounts)) {
      if (count > maxCount) {
        mostVisitedCountry = country;
        maxCount = count;
      }
    }
    
    res.json({
      tripCount,
      upcomingTrips,
      pastTrips,
      ongoingTrips,
      totalTripDays,
      mostVisitedCountry,
      countryCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
