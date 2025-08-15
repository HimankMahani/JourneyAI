import express from 'express';
import { notifyWebsiteVisit } from '../services/discord.service.js';

const router = express.Router();

/**
 * @route   POST /api/debug/discord-test
 * @desc    Test Discord notifications manually
 * @access  Public (for testing purposes)
 */
router.post('/discord-test', async (req, res) => {
  try {
    console.log('Testing Discord notifications manually...');
    
    // Test visit notification only
    const result = await notifyWebsiteVisit({
      timestamp: new Date().toLocaleString(),
      url: 'https://debug-test.example.com',
      screen: '1920x1080',
      timezone: 'America/New_York',
      language: 'en-US'
    });

    res.json({
      success: true,
      message: 'Discord visit notification test completed',
      result: result,
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
