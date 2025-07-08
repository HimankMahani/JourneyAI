import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String
  },
  googleId: {
    type: String,
    sparse: true
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    full: {
      type: String,
      trim: true
    }
  },
  preferences: {
    travelStyle: {
      type: String,
      enum: ['economy', 'budget', 'mid-range', 'luxury']
    },
    interests: [{
      type: String,
      enum: ['nature', 'history', 'culture', 'adventure', 'food', 'relaxation', 'shopping', 'nightlife']
    }],
    dietaryRestrictions: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
