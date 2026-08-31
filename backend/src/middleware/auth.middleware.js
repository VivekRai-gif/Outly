import User from '../models/User.js';

/**
 * Protect middleware to authenticate requests and attach req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  try {
    if (token) {
      // Parse token format: outly_token_<userId>_<timestamp> or outly_google_token_<userId>_<timestamp>
      const parts = token.split('_');
      if (parts.length >= 3) {
        const potentialId = parts[2];
        if (potentialId && potentialId.match(/^[0-9a-fA-F]{24}$/)) {
          const user = await User.findById(potentialId);
          if (user) {
            req.user = user;
            return next();
          }
        }
      }
    }

    // Fallback for demo / single-user mode if no valid token provided
    const defaultUser = await User.findOne().sort({ createdAt: -1 });
    if (defaultUser) {
      req.user = defaultUser;
    }
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    next();
  }
};

/**
 * Strict authentication middleware (rejects unauthenticated requests)
 */
export const requireAuth = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please sign in to access this resource.',
    });
  }
  next();
};
