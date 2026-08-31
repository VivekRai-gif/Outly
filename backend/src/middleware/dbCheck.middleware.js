import { isDbConnected } from '../config/db.js';

/**
 * Middleware to ensure MongoDB database is connected before processing DB routes.
 * Prevents Mongoose buffering timeouts (10000ms) by returning a fast 503 response.
 */
export const requireDbConnection = (req, res, next) => {
  // Allow health check endpoint without blocking
  if (req.path === '/api/health' || req.baseUrl === '/api/health') {
    return next();
  }

  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please whitelist your current IP address in MongoDB Atlas or ensure MongoDB service is running.',
    });
  }

  next();
};
