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
  rating: {
    average: Number,
    count: Number
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
  }]
}, {
  timestamps: true
});

// Create a text index for search functionality
locationSchema.index({ name: 'text', description: 'text' });

const Location = mongoose.model('Location', locationSchema);

export default Location;
