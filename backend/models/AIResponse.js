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
aiResponseSchema.statics.getLatest = function(tripId, type = 'itinerary') {
  return this.findOne({ tripId, type })
    .sort({ createdAt: -1 })
    .exec();
};

// Instance method to get all versions for a trip/type
aiResponseSchema.statics.getAllVersions = function(tripId, type = null) {
  const query = { tripId };
  if (type) query.type = type;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .exec();
};

// Instance method to cleanup old versions
aiResponseSchema.statics.cleanupOldVersions = async function(tripId, type = 'itinerary', keepCount = 3) {
  const allVersions = await this.find({ tripId, type })
    .sort({ createdAt: -1 })
    .exec();
  
  if (allVersions.length <= keepCount) {
    return 0;
  }
  
  const versionsToDelete = allVersions.slice(keepCount);
  const deleteIds = versionsToDelete.map(v => v._id);
  
  const result = await this.deleteMany({ _id: { $in: deleteIds } });
  return result.deletedCount;
};

const AIResponse = mongoose.model('AIResponse', aiResponseSchema);

export default AIResponse;
