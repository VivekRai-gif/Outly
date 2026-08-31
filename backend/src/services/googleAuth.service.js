import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';

// Least-privilege OAuth scopes
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// Persistent server-side token storage file path (fallback)
const TOKEN_STORAGE_FILE = path.join(process.cwd(), 'uploads', '.auth_tokens.json');

/**
 * Initialize Google OAuth2 Client
 */
export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID || 'dummy_client_id.apps.googleusercontent.com';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Load server-side stored credentials safely from DB (or fallback disk)
 */
export async function loadStoredAuthData(userId = null) {
  try {
    let query = {};
    if (userId) {
      query = { _id: userId };
    } else {
      query = { gmailConnected: true };
    }

    const user = await User.findOne(query).sort({ updatedAt: -1 });
    if (user && user.googleTokens && user.googleTokens.access_token) {
      return {
        tokens: user.googleTokens,
        email: user.gmailEmail || user.email,
        name: user.name || '',
        picture: user.avatar || '',
        connectedAt: user.gmailConnectedAt ? user.gmailConnectedAt.toISOString() : user.updatedAt.toISOString(),
      };
    }
  } catch (err) {
    console.warn('[OAuth DB Read Warning]:', err.message);
  }

  // Disk fallback for legacy single-instance or file-based setups
  try {
    if (fs.existsSync(TOKEN_STORAGE_FILE)) {
      const raw = fs.readFileSync(TOKEN_STORAGE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[OAuth Store Read Error]:', err.message);
  }
  return null;
}

/**
 * Save server-side credentials safely to MongoDB User & fallback disk
 */
export async function saveStoredAuthData(data) {
  try {
    if (data.email) {
      const user = await User.findOne({ email: data.email.toLowerCase() });
      if (user) {
        user.googleTokens = data.tokens;
        user.gmailConnected = true;
        user.gmailEmail = data.email.toLowerCase();
        user.gmailConnectedAt = new Date();
        if (data.picture) user.avatar = data.picture;
        await user.save();
        console.log(`[OAuth Service] Saved Google tokens to MongoDB User record: ${user.email}`);
      }
    }
  } catch (err) {
    console.error('[OAuth DB Save Error]:', err.message);
  }

  // Disk backup
  try {
    const dir = path.dirname(TOKEN_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TOKEN_STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[OAuth Store Save Error]:', err.message);
  }
}

/**
 * Clear server-side credentials safely from MongoDB & disk
 */
export async function clearStoredAuthData(email = null) {
  try {
    const query = email ? { email: email.toLowerCase() } : { gmailConnected: true };
    await User.updateMany(query, {
      $set: {
        gmailConnected: false,
        gmailEmail: null,
        gmailConnectedAt: null,
        googleTokens: {},
      },
    });
  } catch (err) {
    console.error('[OAuth DB Clear Error]:', err.message);
  }

  try {
    if (fs.existsSync(TOKEN_STORAGE_FILE)) {
      fs.unlinkSync(TOKEN_STORAGE_FILE);
    }
  } catch (err) {
    console.error('[OAuth Store Clear Error]:', err.message);
  }
}

/**
 * Generate Google OAuth consent URL
 */
export function generateGoogleAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
}

/**
 * Exchange auth code for tokens & fetch user profile
 */
export async function handleOAuthCodeExchange(code) {
  const oauth2Client = getOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Fetch authenticated Google User Profile
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();

  const authData = {
    tokens,
    email: userInfo.data.email || '',
    name: userInfo.data.name || '',
    picture: userInfo.data.picture || '',
    connectedAt: new Date().toISOString(),
  };

  await saveStoredAuthData(authData);
  return authData;
}

/**
 * Inspect connection status
 */
export async function getGoogleAuthStatus(userId = null) {
  const authData = await loadStoredAuthData(userId);

  if (authData && authData.email && authData.tokens) {
    return {
      connected: true,
      email: authData.email,
      name: authData.name || '',
      picture: authData.picture || '',
      connectedAt: authData.connectedAt,
    };
  }

  return {
    connected: false,
    email: null,
    name: null,
    picture: null,
    connectedAt: null,
  };
}

/**
 * Revoke tokens and disconnect account
 */
export async function disconnectGoogleAccount(userId = null) {
  const authData = await loadStoredAuthData(userId);

  if (authData && authData.tokens) {
    try {
      const oauth2Client = getOAuth2Client();
      oauth2Client.setCredentials(authData.tokens);
      if (authData.tokens.access_token) {
        await oauth2Client.revokeToken(authData.tokens.access_token);
      }
    } catch (err) {
      console.warn('[OAuth Revoke Warning]:', err.message);
    }
  }

  await clearStoredAuthData(authData ? authData.email : null);
  return { success: true, message: 'Disconnected Gmail account successfully' };
}
