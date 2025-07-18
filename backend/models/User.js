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
    sparse: true,
    trim: true
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
