import express from 'express';
import axios from 'axios';
import { auth } from '../middleware/auth.js';
import Location from '../models/Location.js';

const router = express.Router();

// @route   GET /api/locations/search
// @desc    Search for locations using Google Places API
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { query, location, radius, type } = req.query;
    
    if (!query && !location) {
      return res.status(400).json({ message: 'Please provide either query or location parameters' });
    }
    
    // Build the Places API URL
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${process.env.GOOGLE_MAPS_API_KEY}`;
    
    if (query) {
      url += `&query=${encodeURIComponent(query)}`;
    }
    
    if (location) {
      url += `&location=${location}`; // format should be "lat,lng"
    }
    
    if (radius) {
      url += `&radius=${radius}`;
    }
    
    if (type) {
      url += `&type=${type}`;
    }
    
    const response = await axios.get(url);
    
    // Transform data to our format
    const locations = response.data.results.map(place => ({
      name: place.name,
      placeId: place.place_id,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      address: place.formatted_address,
      rating: {
        average: place.rating,
        count: place.user_ratings_total
      },
      photos: place.photos ? place.photos.map(photo => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      ) : [],
      priceLevel: place.price_level,
      source: 'google-maps'
    }));
    
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/locations/:placeId
// @desc    Get details for a specific place
// @access  Private
router.get('/:placeId', auth, async (req, res) => {
  try {
    const { placeId } = req.params;
    
    // First check if we already have this location in our database
    let location = await Location.findOne({ placeId });
    
    if (!location) {
      // Fetch from Google Places API
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,place_id,rating,user_ratings_total,formatted_phone_number,website,opening_hours,price_level,types,photos,reviews&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      
      const response = await axios.get(url);
      const place = response.data.result;
      
      if (!place) {
        return res.status(404).json({ message: 'Place not found' });
      }
      
      // Determine category based on place types
      let category = 'other';
      if (place.types.includes('lodging')) {
        category = 'accommodation';
      } else if (place.types.some(type => ['restaurant', 'cafe', 'bar', 'food'].includes(type))) {
        category = 'restaurant';
      } else if (place.types.some(type => ['tourist_attraction', 'point_of_interest', 'museum'].includes(type))) {
        category = 'attraction';
      } else if (place.types.some(type => ['airport', 'train_station', 'transit_station', 'bus_station'].includes(type))) {
        category = 'transportation';
      }
      
      // Create a new location
      location = new Location({
        name: place.name,
        description: '',
        placeId,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        address: place.formatted_address,
        category,
        photos: place.photos ? place.photos.map(photo => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        ) : [],
        rating: {
          average: place.rating,
          count: place.user_ratings_total
        },
        openingHours: place.opening_hours ? 
          new Map(place.opening_hours.weekday_text.map((day, index) => [index, day])) : 
          undefined,
        priceLevel: place.price_level,
        tags: place.types,
        source: 'google-maps'
      });
      
      await location.save();
    }
    
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/locations/review/:placeId
// @desc    Add a review for a location
// @access  Private
router.post('/review/:placeId', auth, async (req, res) => {
  try {
    const { placeId } = req.params;
    const { rating, comment } = req.body;
    
    if (!rating) {
      return res.status(400).json({ message: 'Please provide a rating' });
    }
    
    let location = await Location.findOne({ placeId });
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Check if user already reviewed this location
    const existingReviewIndex = location.reviews.findIndex(
      review => review.user.toString() === req.userId.toString()
    );
    
    if (existingReviewIndex !== -1) {
      // Update existing review
      location.reviews[existingReviewIndex] = {
        user: req.userId,
        rating,
        comment,
        date: Date.now()
      };
    } else {
      // Add new review
      location.reviews.push({
        user: req.userId,
        rating,
        comment,
        date: Date.now()
      });
    }
    
    // Update the average rating
    const totalRating = location.reviews.reduce((sum, review) => sum + review.rating, 0);
    location.rating.average = totalRating / location.reviews.length;
    location.rating.count = location.reviews.length;
    
    await location.save();
    
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
