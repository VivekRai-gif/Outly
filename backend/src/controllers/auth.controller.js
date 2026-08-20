import {
  generateGoogleAuthUrl,
  handleOAuthCodeExchange,
  getGoogleAuthStatus,
  disconnectGoogleAccount,
} from '../services/googleAuth.service.js';

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
export const initiateGoogleAuth = async (req, res, next) => {
  try {
    const authUrl = generateGoogleAuthUrl();

    if (req.query.redirect === 'true') {
      return res.redirect(authUrl);
    }

    res.status(200).json({
      success: true,
      url: authUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google OAuth callback redirect & exchange authorization code
 * @access  Public
 */
export const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code, error } = req.query;

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (error) {
      console.error('[OAuth Callback Error]:', error);
      return res.redirect(`${clientUrl}/settings?auth=error&message=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${clientUrl}/settings?auth=error&message=No+authorization+code+received`);
    }

    await handleOAuthCodeExchange(code);

    res.redirect(`${clientUrl}/settings?auth=success`);
  } catch (error) {
    console.error('[OAuth Exchange Failed]:', error.message);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/settings?auth=error&message=${encodeURIComponent(error.message)}`);
  }
};

/**
 * @route   GET /api/auth/google/status
 * @desc    Get current Gmail OAuth connection status
 * @access  Public
 */
export const getAuthStatus = async (req, res, next) => {
  try {
    const status = getGoogleAuthStatus();
    res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/google/disconnect
 * @desc    Disconnect Gmail account and revoke access tokens
 * @access  Public
 */
export const disconnectGoogle = async (req, res, next) => {
  try {
    const result = await disconnectGoogleAccount();
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
