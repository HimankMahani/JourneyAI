import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found, authentication failed' });
    }

    // Add user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token, authorization denied' });
  }
};
