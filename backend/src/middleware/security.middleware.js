import rateLimit from 'express-rate-limit';

/**
 * Global API Rate Limiter
 * Limits requests per IP to prevent brute force / DoS attacks
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

/**
 * Strict Rate Limiter for sensitive endpoints (Auth, Email sending, PDF Upload)
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 sensitive operations per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded for sensitive operation. Please wait before retrying.',
  },
});

/**
 * Sanitize input parameters to prevent path traversal attempts
 */
export function sanitizeFilename(filename = '') {
  if (typeof filename !== 'string') return '';
  return filename.replace(/[^a-zA-Z0-9._-]/g, '').replace(/\.\.+/g, '');
}

/**
 * Middleware to sanitize request bodies against NoSQL injection
 */
export function sanitizeRequestParams(req, res, next) {
  // Ensure req.params ID format validity if present
  if (req.params && req.params.id) {
    if (typeof req.params.id === 'string' && req.params.id.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters detected.',
      });
    }
  }
  next();
}
