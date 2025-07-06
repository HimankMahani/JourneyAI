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
    date: Date,
    activities: [{
      title: String,
      description: String,
      type: {
        type: String,
        enum: ['sightseeing', 'food', 'accommodation', 'transportation', 'activity', 'nightlife', 'other']
      },
      time: String,
      duration: String,
      cost: String,
      location: {
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
      notes: String,
      category: {
        type: String,
        enum: ['sightseeing', 'food', 'accommodation', 'transportation', 'activity', 'nightlife', 'other']
      }
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
  }]
}, {
  timestamps: true
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
