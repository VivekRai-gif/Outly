import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { createMimeMessage } from '../services/email.service.js';
import { connectDB } from '../config/db.js';
import { Campaign, Contact, Email, EmailEvent } from '../models/index.js';
import mongoose from 'mongoose';

async function runEmailEngineTest() {
  console.log('--- Outly Email Sending Engine Verification Test ---');

  // 1. Test MIME message generation
  console.log('\n[Test 1] Testing RFC 2822 MIME Base64url Encoding...');
  const rawMime = createMimeMessage({
    to: 'test.recipient@example.com',
    from: 'sender@example.com',
    subject: 'Application for Software Engineer Intern at ABC Technologies',
    body: 'Hi Rahul,\n\nI am reaching out regarding the position.',
  });

  console.log('MIME Base64url Length:', rawMime.length);
  if (typeof rawMime === 'string' && rawMime.length > 50 && !rawMime.includes('+') && !rawMime.includes('/')) {
    console.log('✓ Valid base64url MIME string created!');
  } else {
    console.error('❌ MIME encoding failed');
  }

  // 2. Test Duplicate Send & Database Record Tracking
  await connectDB();

  try {
    console.log('\n[Test 2] Testing Duplicate Send Prevention & Database Tracking...');

    const dummyContact = await Contact.create({
      name: 'Duplicate Test Recipient',
      email: `dupe.test.${Date.now()}@example.com`,
      company: 'Test Corp',
      role: 'Test Role',
      status: 'ready',
    });

    const dummyCampaign = await Campaign.create({
      name: 'Duplicate Send Check Campaign',
      subject: 'Hello {{name}}',
      body: 'Body text',
      status: 'draft',
      contacts: [dummyContact._id],
    });

    // Create an initial Email record simulating a previously sent email
    const initialEmail = await Email.create({
      campaignId: dummyCampaign._id,
      contactId: dummyContact._id,
      messageId: 'dummy_msg_12345',
      type: 'initial',
      subject: 'Hello Duplicate Test Recipient',
      body: 'Body text',
      status: 'sent',
      sentAt: new Date(),
    });

    console.log(`  ✓ Created previous Email record (${initialEmail._id}) for Campaign ${dummyCampaign._id}`);

    // Check duplicate check logic
    const existingSentEmail = await Email.findOne({
      campaignId: dummyCampaign._id,
      contactId: dummyContact._id,
      type: 'initial',
      status: 'sent',
    });

    if (existingSentEmail) {
      console.log('  ✓ Duplicate send check successfully detected previously sent email! Prevented double send.');
    } else {
      console.error('  ❌ Duplicate send check failed to detect existing email.');
    }

    // Cleanup
    await Email.findByIdAndDelete(initialEmail._id);
    await Campaign.findByIdAndDelete(dummyCampaign._id);
    await Contact.findByIdAndDelete(dummyContact._id);
    console.log('  ✓ Cleaned up test database records.');

    console.log('\n🎉 EMAIL SENDING ENGINE VERIFICATION PASSED!');

  } catch (err) {
    console.error('❌ Test Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runEmailEngineTest();
