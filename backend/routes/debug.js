import express from 'express';
import { notifyWebsiteVisit, notifyItineraryGeneration, notifyUserSignup } from '../services/discord.service.js';

const router = express.Router();

/**
 * @route   POST /api/debug/discord-test
 * @desc    Test Discord notifications manually
 * @access  Public (for testing purposes)
 */
router.post('/discord-test', async (req, res) => {
  try {
    console.log('Testing Discord notifications manually...');
    
    // Test all notification types
    const results = await Promise.allSettled([
      notifyWebsiteVisit({
        timestamp: new Date().toLocaleString(),
        userAgent: 'Debug Test Bot',
        ip: req.ip
      }),
      notifyUserSignup({
        email: 'debug-test@example.com',
        name: 'Debug Test User',
        location: 'Test Location'
      }),
      notifyItineraryGeneration({
        destination: 'Debug Test Destination',
        startDate: '2024-09-01',
        endDate: '2024-09-07',
        travelers: '2',
        budget: 'mid-range',
        userEmail: 'debug-test@example.com',
        from: 'Debug Start Location',
        interests: ['Testing', 'Debug']
      })
    ]);

    res.json({
      success: true,
      message: 'Discord notification test completed',
      results: results.map((result, index) => ({
        type: ['Website Visit', 'User Signup', 'Itinerary Generation'][index],
        status: result.status,
        value: result.value,
        reason: result.reason?.message
      })),
      timestamp: new Date().toISOString(),
      discordWebhookConfigured: !!process.env.DISCORD_WEBHOOK_URL
    });
  } catch (error) {
    console.error('Discord test error:', error);
    res.status(500).json({
      success: false,
      message: 'Discord notification test failed',
      error: error.message,
      discordWebhookConfigured: !!process.env.DISCORD_WEBHOOK_URL
    });
  }
});

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
      DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL ? 'configured' : 'missing',
      MONGODB_URI: process.env.MONGODB_URI ? 'configured' : 'missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'missing',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'configured' : 'missing'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
