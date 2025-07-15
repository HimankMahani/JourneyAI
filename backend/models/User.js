import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows null values but enforces uniqueness when present
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    },
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
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
