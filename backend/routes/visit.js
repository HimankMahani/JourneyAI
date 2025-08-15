import express from 'express';
import { notifyWebsiteVisit } from '../services/discord.service.js';

const router = express.Router();

/**
 * @route   POST /api/visit/notify
 * @desc    Track website visits from frontend
 * @access  Public
 */
router.post('/notify', async (req, res) => {
  try {
    const { url, screen, timezone, language } = req.body;
    
    console.log('🌍 Website visit tracked from frontend:', {
      url,
      screen,
      timezone,
      language,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')?.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });

    // Send Discord notification
    await notifyWebsiteVisit({
      url,
      screen,
      timezone,
      language,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toLocaleString()
    });

    res.json({ 
      success: true, 
      message: 'Visit tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to track visit' 
    });
  }
});

export default router;
