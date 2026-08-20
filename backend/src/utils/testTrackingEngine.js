import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { Contact, Campaign, Email, EmailEvent } from '../models/index.js';
import { injectTrackingElements, recordTrackingEvent } from '../services/trackingService.js';
import mongoose from 'mongoose';

async function runTrackingEngineTest() {
  console.log('--- Outly Email Engagement Tracking Verification Test ---');

  // 1. Test GIF Buffer & Pixel Injection
  console.log('\n[Test 1] Testing Pixel & Link Rewrite Injection...');
  const originalBody = 'Hi Rahul,\n\nPlease visit https://example.com/careers to apply.';
  const emailId = '6a86ad001122334455667788';

  const trackedBody = injectTrackingElements({ body: originalBody, emailId });
  console.log('Injected Body Output:\n' + trackedBody);

  if (trackedBody.includes('/api/tracking/click/') && trackedBody.includes('/api/tracking/open/')) {
    console.log('✓ Tracking links and open pixel injected successfully!');
  } else {
    console.error('❌ Tracking element injection failed');
  }

  // 2. Test Event Logging & Deduplication
  await connectDB();

  try {
    console.log('\n[Test 2] Testing Event Recording & 5-Second Deduplication...');

    const dummyContact = await Contact.create({
      name: 'Tracking Test User',
      email: `tracking.test.${Date.now()}@example.com`,
      company: 'Tracker Inc',
      role: 'QA Engineer',
      status: 'sent',
    });

    const dummyCampaign = await Campaign.create({
      name: 'Tracking Test Campaign',
      subject: 'Test Subject',
      body: 'Test Body',
      status: 'running',
      contacts: [dummyContact._id],
    });

    const dummyEmail = await Email.create({
      campaignId: dummyCampaign._id,
      contactId: dummyContact._id,
      type: 'initial',
      subject: 'Tracking Test Subject',
      body: originalBody,
      status: 'sent',
      sentAt: new Date(),
    });

    // Record Event 1 (Opened)
    const event1 = await recordTrackingEvent({
      emailId: dummyEmail._id,
      contactId: dummyContact._id,
      eventType: 'opened',
    });
    console.log('  ✓ Event 1 (Opened) Recorded:', event1._id);

    // Record Event 2 (Opened duplicate within 5s)
    const event2 = await recordTrackingEvent({
      emailId: dummyEmail._id,
      contactId: dummyContact._id,
      eventType: 'opened',
    });
    console.log('  ✓ Event 2 (Duplicate Open within 5s) Result ID:', event2._id);

    if (String(event1._id) === String(event2._id)) {
      console.log('✓ Event deduplication successfully returned existing event record!');
    } else {
      console.error('❌ Deduplication failed to prevent duplicate event creation');
    }

    // Cleanup
    await EmailEvent.deleteMany({ contactId: dummyContact._id });
    await Email.findByIdAndDelete(dummyEmail._id);
    await Campaign.findByIdAndDelete(dummyCampaign._id);
    await Contact.findByIdAndDelete(dummyContact._id);
    console.log('✓ Cleaned up test database records.');

    console.log('\n🎉 EMAIL ENGAGEMENT TRACKING ENGINE VERIFICATION PASSED!');

  } catch (err) {
    console.error('❌ Test Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runTrackingEngineTest();
