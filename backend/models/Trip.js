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
    amount: Number
  },
  itinerary: [{
    day: Number,
    date: Date,
    activities: [{
      time: String,
      activity: String,
      location: String,
      description: String,
      cost: Number,
      category: String,
      startTime: String,
      endTime: String
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
    price: Number
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
    price: Number
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
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'planning'
  },
  generatedBy: {
    type: String,
    enum: ['ai', 'pre-generated', 'manual'],
    default: 'ai'
  }
}, {
  timestamps: true
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
