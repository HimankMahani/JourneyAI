import express from 'express';

const router = express.Router();

/**
 * @route   GET /api/debug/env-check
 * @desc    Check environment variables (safe version)
 * @access  Public (for debugging)
 */
router.get('/env-check', (req, res) => {
  res.json({
    success: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || 'not-set',
      MONGODB_URI: process.env.MONGODB_URI ? 'configured' : 'missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'missing',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'configured' : 'missing'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
