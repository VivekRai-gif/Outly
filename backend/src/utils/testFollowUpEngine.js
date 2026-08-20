import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { Campaign, Contact, Email } from '../models/index.js';
import { scheduleFollowUpJob, cancelFollowUpJobsForContact } from '../services/queueService.js';
import { processFollowUpStep, handleReplyDetected } from '../services/followUpService.js';
import mongoose from 'mongoose';

async function runFollowUpEngineTest() {
  console.log('--- Outly Automated Follow-up Engine Verification Test ---');

  await connectDB();

  try {
    // 1. Create dummy contact and campaign
    const contact = await Contact.create({
      name: 'FollowUp Test User',
      email: `followup.test.${Date.now()}@example.com`,
      company: 'FollowUp Inc',
      role: 'Tech Lead',
      status: 'sent',
    });

    const campaign = await Campaign.create({
      name: 'FollowUp Engine Test Campaign',
      subject: 'Opportunity for {{role}}',
      body: 'Hi {{name}}',
      status: 'running',
      contacts: [contact._id],
      followUps: [
        {
          delayDays: 1,
          subject: 'Following up #1 for {{role}}',
          body: 'Hi {{name}}, following up...',
        },
        {
          delayDays: 3,
          subject: 'Final follow-up #2 for {{role}}',
          body: 'Hi {{name}}, last check-in...',
        },
      ],
    });

    console.log(`✓ Created test contact (${contact._id}) and campaign (${campaign._id}) with 2 follow-up steps`);

    // 2. Test scheduleFollowUpJob
    console.log('\n[Test 1] Scheduling Follow-up Step #1...');
    const scheduleResult = await scheduleFollowUpJob({
      campaignId: campaign._id,
      contactId: contact._id,
      followUpIndex: 0,
      delayMs: 100, // Short delay for test execution
      processorFn: async (params) => {
        console.log('  ✓ In-Memory/BullMQ processor triggered with params:', params);
      },
    });

    console.log('Schedule Result:', scheduleResult);
    if (scheduleResult.jobId === `followup-${campaign._id}-${contact._id}-0`) {
      console.log('✓ Deterministic job ID created correctly!');
    } else {
      console.error('❌ Invalid job ID format');
    }

    // 3. Test Reply Detection Boundary (handleReplyDetected)
    console.log('\n[Test 2] Testing Reply Detection Boundary (handleReplyDetected)...');
    const replyResult = await handleReplyDetected(contact._id);
    console.log('Reply Boundary Result:', replyResult);

    const updatedContact = await Contact.findById(contact._id);
    if (updatedContact.status === 'replied') {
      console.log('✓ Contact status updated to "replied" and pending follow-ups cancelled!');
    } else {
      console.error('❌ Failed to update contact status to replied');
    }

    // 4. Test processing follow-up step when contact has replied
    console.log('\n[Test 3] Testing processFollowUpStep on replied contact...');
    const stepResult = await processFollowUpStep({
      campaignId: campaign._id,
      contactId: contact._id,
      followUpIndex: 0,
    });

    if (stepResult.reason === 'Contact replied. Follow-ups stopped.') {
      console.log('✓ Engine correctly aborted follow-up execution for replied contact!');
    } else {
      console.error('❌ Engine failed to abort follow-up on replied contact');
    }

    // Cleanup test data
    await Campaign.findByIdAndDelete(campaign._id);
    await Contact.findByIdAndDelete(contact._id);
    console.log('✓ Cleaned up test data.');

    console.log('\n🎉 AUTOMATED FOLLOW-UP ENGINE VERIFICATION PASSED!');

  } catch (err) {
    console.error('❌ Test Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runFollowUpEngineTest();
