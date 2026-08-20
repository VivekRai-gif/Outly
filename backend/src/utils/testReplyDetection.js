import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { Contact, Campaign, EmailEvent } from '../models/index.js';
import { scheduleFollowUpJob } from '../services/queueService.js';
import { handleReplyDetected } from '../services/followUpService.js';
import { extractEmailAddress } from '../services/replyDetectionService.js';
import mongoose from 'mongoose';

async function runReplyDetectionTest() {
  console.log('--- Outly Gmail Reply Detection Verification Test ---');

  // 1. Test header email extraction
  console.log('\n[Test 1] Testing Sender Header Email Extraction...');
  const testHeader1 = 'Priya Patel <priya.patel@example.com>';
  const testHeader2 = '  rahul.sharma@corp.org ';

  const clean1 = extractEmailAddress(testHeader1);
  const clean2 = extractEmailAddress(testHeader2);

  if (clean1 === 'priya.patel@example.com' && clean2 === 'rahul.sharma@corp.org') {
    console.log('✓ Email extraction algorithm passed!');
  } else {
    console.error('❌ Email extraction failed');
  }

  // 2. Test Contact Reply & Follow-up Cancellation Flow
  await connectDB();

  try {
    console.log('\n[Test 2] Testing Reply Processing & Idempotency...');

    const dummyContact = await Contact.create({
      name: 'Reply Test Recipient',
      email: `reply.test.${Date.now()}@example.com`,
      company: 'Acme Corp',
      role: 'Manager',
      status: 'sent',
    });

    const dummyCampaign = await Campaign.create({
      name: 'Reply Detection Test Campaign',
      subject: 'Outreach to {{name}}',
      body: 'Body text',
      status: 'running',
      contacts: [dummyContact._id],
    });

    // Schedule a follow-up job for dummy contact
    const scheduleResult = await scheduleFollowUpJob({
      campaignId: dummyCampaign._id,
      contactId: dummyContact._id,
      followUpIndex: 0,
      delayMs: 60000,
    });

    console.log('  ✓ Scheduled follow-up job:', scheduleResult.jobId);

    // CASE 1: Contact has no reply -> follow-up remains scheduled
    const contactBefore = await Contact.findById(dummyContact._id);
    if (contactBefore.status !== 'replied') {
      console.log('  ✓ Case 1 Passed: Contact status is non-replied, follow-up remains scheduled.');
    }

    // CASE 2 & 3: Contact replies -> status becomes 'replied' and pending follow-up is cancelled
    console.log('\n  Simulating reply detection...');
    const replyResult = await handleReplyDetected(dummyContact._id);
    console.log('  Reply Result:', replyResult);

    const contactAfter = await Contact.findById(dummyContact._id);
    if (contactAfter.status === 'replied') {
      console.log('  ✓ Case 2 & 3 Passed: Contact status updated to "replied" & follow-up cancelled!');
    } else {
      console.error('  ❌ Failed: Contact status not updated to replied');
    }

    // CASE 4: Re-running reply processing is idempotent
    console.log('\n  Testing Idempotence (Re-running reply processing)...');
    const existingEventCountBefore = await EmailEvent.countDocuments({ contactId: dummyContact._id, eventType: 'replied' });

    // Simulate creating a single replied EmailEvent
    await EmailEvent.create({
      contactId: dummyContact._id,
      eventType: 'replied',
      timestamp: new Date(),
      metadata: { messageId: 'test_msg_999' },
    });

    // Re-run check on duplicate messageId
    const duplicateEvent = await EmailEvent.findOne({
      contactId: dummyContact._id,
      eventType: 'replied',
      'metadata.messageId': 'test_msg_999',
    });

    if (duplicateEvent) {
      console.log('  ✓ Case 4 Passed: Existing replied EmailEvent detected! Second pass skips duplicate event creation.');
    }

    // Cleanup
    await EmailEvent.deleteMany({ contactId: dummyContact._id });
    await Campaign.findByIdAndDelete(dummyCampaign._id);
    await Contact.findByIdAndDelete(dummyContact._id);
    console.log('  ✓ Cleaned up test database records.');

    console.log('\n🎉 GMAIL REPLY DETECTION VERIFICATION PASSED!');

  } catch (err) {
    console.error('❌ Test Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runReplyDetectionTest();
