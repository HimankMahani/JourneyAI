import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  placeId: {
    type: String,
    unique: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  address: String,
  country: String,
  city: String,
  category: {
    type: String,
    enum: ['attraction', 'accommodation', 'restaurant', 'transportation', 'other']
  },
  photos: [String],
  rating: {
    average: Number,
    count: Number
  },
  openingHours: {
    type: Map,
    of: String
  },
  priceLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  popularTimes: {
    type: Map,
    of: [Number]
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  source: {
    type: String,
    enum: ['google-maps', 'user', 'ai']
  },
  userRecommendations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recommended: Boolean,
    notes: String
  }]
}, {
  timestamps: true
});

// Create a text index for search functionality
locationSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Location = mongoose.model('Location', locationSchema);

export default Location;
