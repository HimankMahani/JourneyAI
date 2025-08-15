import { notifyWebsiteVisit } from '../services/discord.service.js';

// Track recent visitors to avoid spam
const recentVisitors = new Set();
const VISITOR_COOLDOWN_MS = 300000; // 5 minutes cooldown per IP

/**
 * Middleware to track website visits and send Discord notifications
 * Only tracks unique visitors with cooldown to avoid rate limiting
 */
export function trackVisitor(req, res, next) {
  // Skip tracking for ALL API routes and static files
  const skipRoutes = [
    '/api/',      // Skip ALL API routes
    '/favicon.ico',
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

  // Only track GET requests to main pages (NOT API calls)
  if (req.method === 'GET' && req.path === '/') {
    const visitorIP = req.ip || req.connection.remoteAddress || 'unknown';
    const visitorKey = `${visitorIP}-${Date.now()}`;
    
    // Check if this IP has visited recently
    const hasRecentVisit = Array.from(recentVisitors).some(key => 
      key.startsWith(visitorIP) && 
      (Date.now() - parseInt(key.split('-')[1])) < VISITOR_COOLDOWN_MS
    );

    if (!hasRecentVisit) {
      console.log('🌍 New unique website visitor detected (homepage only):', {
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent')?.substring(0, 50) + '...',
        ip: visitorIP,
        timestamp: new Date().toISOString()
      });

      // Add to recent visitors
      recentVisitors.add(visitorKey);
      
      // Clean up old entries
      const now = Date.now();
      recentVisitors.forEach(key => {
        const timestamp = parseInt(key.split('-')[1]);
        if (now - timestamp > VISITOR_COOLDOWN_MS) {
          recentVisitors.delete(key);
        }
      });

      try {
        // Get visitor information
        const visitorInfo = {
          userAgent: req.get('User-Agent'),
          ip: visitorIP,
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
    } else {
      console.log('🔇 Visitor from', visitorIP, 'recently tracked, skipping notification');
    }
  }

  next();
}

/**
 * Simple middleware to track API endpoint usage
 */
export function trackAPIUsage(req, res, next) {
  // Only log important API endpoints, don't send Discord notifications
  const importantEndpoints = [
    '/api/generator/itinerary',
    '/api/auth/register',
    '/api/auth/login'
  ];

  if (importantEndpoints.includes(req.path)) {
    console.log(`📡 API Usage: ${req.method} ${req.path} from ${req.ip || 'unknown'}`);
  }

  next();
}
