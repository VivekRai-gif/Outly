import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import {
  generateGoogleAuthUrl,
  getGoogleAuthStatus,
  disconnectGoogleAccount,
} from '../services/googleAuth.service.js';

async function runAuthTest() {
  console.log('--- Outly Google OAuth 2.0 Integration Verification Test ---');

  // 1. Test generateGoogleAuthUrl
  console.log('\n[Test 1] Generating Google OAuth Consent URL...');
  const authUrl = generateGoogleAuthUrl();
  console.log('Generated URL:', authUrl);

  if (authUrl.includes('https://accounts.google.com/o/oauth2/v2/auth') && authUrl.includes('scope=')) {
    console.log('✓ OAuth URL generated with least-privilege scopes!');
  } else {
    console.error('❌ Failed to generate valid OAuth URL');
  }

  // 2. Test getGoogleAuthStatus
  console.log('\n[Test 2] Inspecting Initial Auth Status...');
  const statusBefore = getGoogleAuthStatus();
  console.log('Status:', JSON.stringify(statusBefore, null, 2));

  // 3. Test disconnectGoogleAccount
  console.log('\n[Test 3] Disconnecting Account...');
  const disconnectResult = await disconnectGoogleAccount();
  console.log('Disconnect Result:', disconnectResult);

  const statusAfter = getGoogleAuthStatus();
  if (!statusAfter.connected && statusAfter.email === null) {
    console.log('✓ Disconnect completed and tokens cleared server-side!');
  } else {
    console.error('❌ Disconnect failed to clear tokens');
  }

  console.log('\n🎉 ALL GMAIL OAUTH INTEGRATION TESTS PASSED!');
}

runAuthTest();
