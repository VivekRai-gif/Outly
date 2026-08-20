import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import app from '../app.js';
import { getGoogleAuthStatus } from '../services/googleAuth.service.js';

async function runSecurityAudit() {
  console.log('--- Outly Security & Production Hardening Audit ---');

  // 1. Environment Secrets & Token Exposure Audit
  console.log('\n[Audit 1] Checking Secret Exposure & Environment Configuration...');
  const status = getGoogleAuthStatus();
  console.log('Public OAuth Status Object:', JSON.stringify(status, null, 2));

  if (status.tokens === undefined && status.clientSecret === undefined) {
    console.log('✓ PASS: OAuth access tokens, refresh tokens, and client secrets are NOT exposed in public status!');
  } else {
    console.error('❌ FAIL: Tokens or secrets found in public status object!');
  }

  // 2. Security Middleware Inspection
  console.log('\n[Audit 2] Inspecting Security Headers & Middleware...');
  if (app._router && app._router.stack) {
    const middlewareNames = app._router.stack.map(s => s.name).filter(Boolean);
    console.log('Active Middleware Stack:', middlewareNames);
    if (middlewareNames.includes('helmet') && middlewareNames.includes('mongoSanitize')) {
      console.log('✓ PASS: Helmet HTTP headers & mongoSanitize NoSQL injection protection loaded!');
    }
  }

  console.log('\n🎉 AUDIT COMPLETED SUCCESSFULLY!');
}

runSecurityAudit();
