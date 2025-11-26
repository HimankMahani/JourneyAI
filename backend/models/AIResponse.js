import mongoose from 'mongoose';

const aiResponseSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['itinerary', 'tips', 'suggestions', 'local-info', 'safety'],
    required: true,
    default: 'itinerary'
  },
  rawResponse: {
    type: String,
    required: true
  },
  parsedData: {
    type: mongoose.Schema.Types.Mixed, // Flexible structure
    default: null
  },
  metadata: {
    prompt: String,
    model: String,
    tokens: Number,
    duration: Number,
    apiVersion: String,
    userLocation: {
      city: String,
      country: String,
      full: String
    },
    preferences: {
      destination: String,
      startDate: Date,
      endDate: Date,
      budget: String,
      travelers: Number,
      interests: [String]
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: String,

}, {
  timestamps: true
});

// Compound index for efficient queries
aiResponseSchema.index({ tripId: 1, type: 1, createdAt: -1 });
aiResponseSchema.index({ userId: 1, createdAt: -1 });

// Instance method to get the latest version for a trip/type
// Removed static methods as logic moved to service layer

const AIResponse = mongoose.model('AIResponse', aiResponseSchema);

export default AIResponse;
