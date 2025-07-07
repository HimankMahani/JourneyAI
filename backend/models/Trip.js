import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  destination: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    country: String,
    placeId: String
  },
  budget: {
  currency: {
    type: String,
    default: 'INR'
  },
    amount: {
      type: Number
    },
    expenses: [{
      category: {
        type: String,
        enum: ['accommodation', 'transportation', 'food', 'activities', 'shopping', 'other']
      },
      amount: Number,
      description: String,
      date: Date
    }]
  },
  itinerary: [{
    day: Number,
    title: String, // Add title for the day
    date: Date,
    activities: [{
      time: String, // Activity time (e.g., "10:00 AM")
      activity: String, // Activity name/title
      location: String, // Location name
      description: String, // Activity description
      cost: Number, // Activity cost
      category: String, // Activity category (simplified)
      // Legacy fields for backward compatibility
      title: String,
      type: {
        type: String,
        enum: ['sightseeing', 'food', 'accommodation', 'transportation', 'activity', 'nightlife', 'other']
      },
      duration: String,
      locationDetails: {
        name: String,
        address: String,
        coordinates: {
          lat: Number,
          lng: Number
        },
        placeId: String
      },
      startTime: String,
      endTime: String,
      notes: String
    }]
  }],
  accommodation: [{
    name: String,
    location: {
      name: String,
      coordinates: {
        lat: Number,
        lng: Number
      },
      placeId: String
    },
    checkIn: Date,
    checkOut: Date,
    bookingReference: String,
    price: Number,
    notes: String
  }],
  transportation: [{
    type: {
      type: String,
      enum: ['flight', 'train', 'bus', 'car', 'ferry', 'other']
    },
    departureLocation: String,
    arrivalLocation: String,
    departureTime: Date,
    arrivalTime: Date,
    bookingReference: String,
    price: Number,
    notes: String
  }],
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  aiSuggestions: [{
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['itinerary', 'activity', 'general', 'food', 'safety']
    }
  }],
  travelers: {
    type: Number,
    default: 1
  },
  duration: {
    type: Number, // in days
    default: 7
  },
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'planning'
  },
  activities: [{
    type: String
  }],
  // New fields for pre-generated itineraries
  generatedBy: {
    type: String,
    enum: ['ai', 'pre-generated', 'manual'],
    default: 'ai'
  },
  estimatedCost: {
    type: Number
  }
}, {
  timestamps: true
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
