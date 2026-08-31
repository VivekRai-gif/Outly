import User from '../models/User.js';
import {
  generateGoogleAuthUrl,
  handleOAuthCodeExchange,
  getGoogleAuthStatus,
  disconnectGoogleAccount,
} from '../services/googleAuth.service.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, company } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name and email address are required',
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'default_secure_pass',
      company: company || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    const token = `outly_token_${user._id}_${Date.now()}`;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Sign in user account
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    // If user does not exist yet (e.g. initial demo login), auto-provision account for smooth onboarding
    if (!user) {
      const defaultName = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
      const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      user = await User.create({
        name: formattedName || 'Outly User',
        email: email.toLowerCase(),
        password: password || 'demo_pass',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formattedName)}`,
      });
    }

    const token = `outly_token_${user._id}_${Date.now()}`;

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Sign out user
 * @access  Public
 */
export const logoutUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Signed out successfully',
  });
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Public
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findOne().sort({ createdAt: -1 });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user session found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

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
      return res.redirect(`${clientUrl}/signin?auth=error&message=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${clientUrl}/signin?auth=error&message=No+authorization+code+received`);
    }

    const authData = await handleOAuthCodeExchange(code);

    let user = null;
    if (authData && authData.email) {
      user = await User.findOne({ email: authData.email.toLowerCase() });
      if (!user) {
        user = await User.create({
          name: authData.name || authData.email.split('@')[0],
          email: authData.email.toLowerCase(),
          avatar: authData.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authData.name || 'Google')}`,
          role: 'Outreach Manager',
        });
      } else if (authData.picture) {
        user.avatar = authData.picture;
        await user.save();
      }
    }

    const token = user ? `outly_google_token_${user._id}_${Date.now()}` : `outly_google_token_${Date.now()}`;
    const userPayload = user ? JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      company: user.company || '',
      role: user.role || 'Outreach Manager',
    }) : JSON.stringify({
      name: authData.name || 'Gmail User',
      email: authData.email,
      avatar: authData.picture || '',
    });

    res.redirect(`${clientUrl}/dashboard?auth=google_success&token=${encodeURIComponent(token)}&user=${encodeURIComponent(userPayload)}`);
  } catch (error) {
    console.error('[OAuth Exchange Failed]:', error.message);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/signin?auth=error&message=${encodeURIComponent(error.message)}`);
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

