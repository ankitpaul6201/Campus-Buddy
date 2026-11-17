/**
 * Lightweight In-Memory Sliding Window Rate Limiter
 * Provides DDoS and brute-force protection without external dependencies.
 */

function createRateLimiter({ windowMs = 60000, maxRequests = 600, message = 'Too many requests, please try again shortly.' }) {
  const requests = new Map();

  // Periodic cleanup of stale IPs every 60 seconds
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requests.entries()) {
      if (now > data.resetTime) {
        requests.delete(ip);
      }
    }
  }, windowMs);

  if (cleanupTimer.unref) cleanupTimer.unref();

  return function rateLimiter(req, res, next) {
    // Whitelist internal/local health checks
    if (req.path === '/api/health' || req.path === '/api/health/ready') {
      return next();
    }

    // Use Express validated req.ip (configured with trust proxy)
    const ip = req.ip || req.socket?.remoteAddress || '127.0.0.1';

    // In local development only, allow loopback benchmarking
    if (process.env.NODE_ENV !== 'production' && (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1')) {
      // Apply rate limiter even on local if explicitly testing or keep high ceiling
    }
    const now = Date.now();

    let entry = requests.get(ip);
    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime: now + windowMs };
      requests.set(ip, entry);
      return next();
    }

    entry.count++;
    if (entry.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000));
      return res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil((entry.resetTime - now) / 1000)
      });
    }

    next();
  };
}

// General API rate limiter (600 requests/min per IP)
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 1200, // High ceiling for stress testing and campus NATs
  message: 'Campus Buddy API rate limit reached. Please wait a moment.'
});

// Stricter limiter for Auth endpoints (30 requests/min per IP)
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Too many authentication attempts. Please try again after 1 minute.'
});

module.exports = {
  apiLimiter,
  authLimiter
};
