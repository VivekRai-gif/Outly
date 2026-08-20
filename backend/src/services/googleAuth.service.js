import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Least-privilege OAuth scopes
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// Persistent server-side token storage file path
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
 * Load server-side stored credentials safely
 */
export function loadStoredAuthData() {
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
 * Save server-side credentials safely
 */
export function saveStoredAuthData(data) {
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
 * Clear server-side credentials safely
 */
export function clearStoredAuthData() {
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

  saveStoredAuthData(authData);
  return authData;
}

/**
 * Inspect connection status
 */
export function getGoogleAuthStatus() {
  const authData = loadStoredAuthData();

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
export async function disconnectGoogleAccount() {
  const authData = loadStoredAuthData();

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

  clearStoredAuthData();
  return { success: true, message: 'Disconnected Gmail account successfully' };
}
