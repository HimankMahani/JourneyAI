import { notifyWebsiteVisit } from '../services/discord.service.js';

/**
 * Middleware to track website visits and send Discord notifications
 * Only tracks the first visit per session to avoid spam
 */
export function trackVisitor(req, res, next) {
  // Skip tracking for certain routes to avoid spam
  const skipRoutes = [
    '/favicon.ico',
    '/api/',
    '/health',
    '/ping',
    '.css',
    '.js',
    '.map',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.ico'
  ];

  // Check if we should skip this route
  const shouldSkip = skipRoutes.some(route => 
    req.path.includes(route) || req.path.startsWith('/api/')
  );

  if (shouldSkip) {
    return next();
  }

  // Only track GET requests to main pages
  if (req.method === 'GET' && req.path === '/') {
    console.log('🌍 Website visitor detected:', {
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent')?.substring(0, 50) + '...',
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    });

    try {
      // Get visitor information
      const visitorInfo = {
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toLocaleString(),
        path: req.path,
        referer: req.get('Referer')
      };

      // Send notification asynchronously (don't wait for it)
      notifyWebsiteVisit(visitorInfo).catch(error => {
        console.error('Error sending visit notification:', error);
      });
    } catch (error) {
      console.error('Error in visitor tracking middleware:', error);
    }
  }

  next();
}

/**
 * Simple middleware to track API endpoint usage
 */
export function trackAPIUsage(req, res, next) {
  // Track important API endpoints
  const importantEndpoints = [
    '/api/generator/itinerary',
    '/api/auth/register',
    '/api/auth/login'
  ];

  if (importantEndpoints.includes(req.path)) {
    console.log(`API Usage: ${req.method} ${req.path} from ${req.ip || 'unknown'}`);
  }

  next();
}
