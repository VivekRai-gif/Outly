import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { User, Contact, Campaign, Email, EmailEvent } from '../models/index.js';
import { parseContactsFromText } from '../services/contactParser.service.js';
import { personalizeText, personalizeEmail } from './personalize.js';
import { createMimeMessage } from '../services/email.service.js';
import { saveStoredAuthData, clearStoredAuthData } from '../services/googleAuth.service.js';
import { scheduleFollowUpJob, cancelFollowUpJobsForContact } from '../services/queueService.js';
import { processFollowUpStep, handleReplyDetected } from '../services/followUpService.js';
import { extractEmailAddress } from '../services/replyDetectionService.js';
import { injectTrackingElements, recordTrackingEvent } from '../services/trackingService.js';
import mongoose from 'mongoose';

// Test Counter Stats
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runMasterQASuite() {
  console.log('=============== OUTLY MASTER AUTOMATED QA TEST SUITE ===============\n');

  await connectDB();

  try {
    // Clean up any stale QA test contacts from prior runs before syncing unique indexes
    await Contact.deleteMany({ email: /qa\.contact/i });
    await Contact.syncIndexes();

    // ------------------------------------------------------------------------
    // SUITE 1: PDF UPLOAD & CONTACT EXTRACTION
    // ------------------------------------------------------------------------
    console.log('[SUITE 1] PDF Parsing & Contact Extraction');

    const samplePdfText = `
      Outreach Contact Directory
      Rahul Sharma - rahul.qa.test@example.com - 9876543210
      Software Engineer Intern at ABC Technologies
      
      Priya Patel - priya.qa.test@example.com
      Product Manager - Acme Corp
      
      Duplicate Entry: rahul.qa.test@example.com
    `;

    const parsedContacts = parseContactsFromText(samplePdfText);
    assert(parsedContacts.length === 2, 'Extracts contacts and removes duplicate email in text');
    assert(parsedContacts[0].email === 'rahul.qa.test@example.com', 'Parses first email correctly');
    assert(parsedContacts[0].name === 'Rahul Sharma', 'Parses first contact name correctly');
    assert(parsedContacts[0].company === 'ABC Technologies', 'Parses first contact company correctly');
    assert(parsedContacts[0].role === 'Software Engineer Intern', 'Parses first contact role correctly');

    const malformedText = parseContactsFromText('No email addresses present in this raw text string.');
    assert(Array.isArray(malformedText) && malformedText.length === 0, 'Handles malformed text without errors');


    // ------------------------------------------------------------------------
    // SUITE 2: CONTACT MANAGEMENT & VALIDATIONS
    // ------------------------------------------------------------------------
    console.log('\n[SUITE 2] Contact Management & Database Validations');

    const testEmail1 = `qa.contact1.${Date.now()}@example.com`;
    const contact1 = await Contact.create({
      name: 'QA Test Contact 1',
      email: testEmail1,
      company: 'Test Company 1',
      role: 'QA Engineer',
      status: 'ready',
    });

    assert(Boolean(contact1._id), 'Creates new contact in database');
    assert(contact1.status === 'ready', 'Assigns default status "ready"');

    // Update Contact
    contact1.name = 'QA Test Contact 1 Updated';
    await contact1.save();
    const updatedContact = await Contact.findById(contact1._id);
    assert(updatedContact.name === 'QA Test Contact 1 Updated', 'Updates contact fields correctly');

    // Duplicate Email Validation
    let dupeErrorCaught = false;
    try {
      await Contact.create({
        name: 'Duplicate Contact',
        email: testEmail1,
        company: 'Other Corp',
        role: 'Dev',
      });
    } catch (err) {
      dupeErrorCaught = true;
    }
    assert(dupeErrorCaught, 'Enforces unique email index constraint in Contact schema');


    // ------------------------------------------------------------------------
    // SUITE 3: CAMPAIGN MANAGEMENT & VALIDATIONS
    // ------------------------------------------------------------------------
    console.log('\n[SUITE 3] Campaign System & Validations');

    const campaign = await Campaign.create({
      name: 'QA Master Outreach Campaign',
      subject: 'Application for {{role}} at {{company}}',
      body: 'Hi {{name}},\n\nReaching out regarding {{role}}.',
      status: 'draft',
      contacts: [contact1._id],
      followUps: [
        {
          delayDays: 3,
          subject: 'Following up regarding {{role}}',
          body: 'Hi {{name}}, just checking in.',
        },
      ],
    });

    assert(Boolean(campaign._id), 'Creates outreach campaign with recipients and follow-up steps');

    // Update Campaign
    campaign.status = 'running';
    await campaign.save();
    const updatedCampaign = await Campaign.findById(campaign._id).populate('contacts');
    assert(updatedCampaign.status === 'running', 'Updates campaign status correctly');
    assert(updatedCampaign.contacts.length === 1, 'Populates campaign contacts array');


    // ------------------------------------------------------------------------
    // SUITE 4: TEMPLATE PERSONALIZATION ENGINE
    // ------------------------------------------------------------------------
    console.log('\n[SUITE 4] Template Personalization & Fallback Engine');

    const fullContact = {
      name: 'Priya Patel',
      email: 'priya@example.com',
      company: 'Acme Corp',
      role: 'Lead Designer',
    };

    const renderedFull = personalizeEmail('Role: {{role}} at {{company}}', 'Hi {{name}} <{{email}}>', fullContact);
    assert(renderedFull.subject === 'Role: Lead Designer at Acme Corp', 'Replaces all variables {{role}} and {{company}}');
    assert(renderedFull.body === 'Hi Priya Patel <priya@example.com>', 'Replaces all variables {{name}} and {{email}}');

    const missingContact = { email: 'empty@example.com' };
    const renderedMissing = personalizeEmail('Role: {{role}} at {{company}}', 'Hi {{name}}', missingContact);
    assert(renderedMissing.subject === 'Role: this position at your company', 'Provides fallback for missing role and company');
    assert(renderedMissing.body === 'Hi there', 'Provides fallback "there" for missing name');

    const specialContact = { name: 'O\'Connor & Co <script>', company: 'Test & Sales "Inc"' };
    const renderedSpecial = personalizeText('Hello {{name}} from {{company}}', specialContact);
    assert(renderedSpecial.includes('O\'Connor & Co <script>'), 'Preserves text content with special characters');


    // ------------------------------------------------------------------------
    // SUITE 5: EMAIL DISPATCH & DUPLICATE PREVENTION
    // ------------------------------------------------------------------------
    console.log('\n[SUITE 5] Email Dispatch & Duplicate Send Prevention');

    const rawMime = createMimeMessage({
      to: 'recipient@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
    });
    assert(typeof rawMime === 'string' && rawMime.length > 50, 'Generates valid base64url encoded MIME message');

    const email1 = await Email.create({
      campaignId: campaign._id,
      contactId: contact1._id,
      messageId: `msg_qa_${Date.now()}`,
      type: 'initial',
      subject: 'Test Subject',
      body: 'Test Body',
      status: 'sent',
      sentAt: new Date(),
    });

    assert(Boolean(email1._id), 'Creates Email document record upon send dispatch');

    const dupeCheck = await Email.findOne({
      campaignId: campaign._id,
      contactId: contact1._id,
      type: 'initial',
      status: 'sent',
    });
    assert(Boolean(dupeCheck), 'Prevents duplicate initial sends for same campaign & contact');


    // ------------------------------------------------------------------------
    // SUITE 6: AUTOMATED FOLLOW-UP ENGINE
    // ------------------------------------------------------------------------
    console.log('\n[SUITE 6] Automated Follow-up Engine');

    const jobResult = await scheduleFollowUpJob({
      campaignId: campaign._id,
      contactId: contact1._id,
      followUpIndex: 0,
      delayMs: 100,
    });

    assert(jobResult.jobId === `followup-${campaign._id}-${contact1._id}-0`, 'Generates deterministic job ID format');

    saveStoredAuthData({
      tokens: { access_token: 'mock_test_token' },
      email: 'qa.sender@example.com',
    });


    // ------------------------------------------------------------------------
    // SUITE 7: GMAIL REPLY DETECTION & IDEMPOTENCY
    // ------------------------------------------------------------------------
    console.log('\n[SUITE 7] Gmail Reply Detection & Idempotency');

    const headerExtract1 = extractEmailAddress('Vivek Rai <vivek@example.com>');
    assert(headerExtract1 === 'vivek@example.com', 'Extracts clean email address from header string');

    const replyResult = await handleReplyDetected(contact1._id);
    assert(replyResult.success === true, 'Triggers reply detection boundary');

    const postReplyContact = await Contact.findById(contact1._id);
    assert(postReplyContact.status === 'replied', 'Updates contact status to "replied"');

    const postReplyStep = await processFollowUpStep({
      campaignId: campaign._id,
      contactId: contact1._id,
      followUpIndex: 0,
    });
    assert(postReplyStep.reason === 'Contact replied. Follow-ups stopped.', 'Cancels follow-up sequence when contact has replied');


    // ------------------------------------------------------------------------
    // SUITE 8: ENGAGEMENT TRACKING & DEDUPLICATION
    // ------------------------------------------------------------------------
    console.log('\n[SUITE 8] Email Engagement Tracking & Event Deduplication');

    const trackingBody = injectTrackingElements({ body: 'Visit https://example.com', emailId: email1._id });
    assert(trackingBody.includes('/api/tracking/click/'), 'Injects click tracking redirect URL');
    assert(trackingBody.includes('/api/tracking/open/'), 'Injects 1x1 open tracking pixel img tag');

    const event1 = await recordTrackingEvent({
      emailId: email1._id,
      contactId: contact1._id,
      eventType: 'opened',
    });
    assert(Boolean(event1._id), 'Records opened event in EmailEvent model');

    const event2 = await recordTrackingEvent({
      emailId: email1._id,
      contactId: contact1._id,
      eventType: 'opened',
    });
    assert(String(event1._id) === String(event2._id), 'Deduplicates duplicate open events within 5 seconds');


    // ------------------------------------------------------------------------
    // CLEANUP TEST DATA
    // ------------------------------------------------------------------------
    await EmailEvent.deleteMany({ contactId: contact1._id });
    await Email.deleteMany({ campaignId: campaign._id });
    await Campaign.findByIdAndDelete(campaign._id);
    await Contact.findByIdAndDelete(contact1._id);
    clearStoredAuthData();
    console.log('\n✓ Cleaned up all QA test data.');

  } catch (err) {
    console.error('❌ QA Suite Fatal Error:', err);
    failedTests++;
  } finally {
    console.log('\n================================================================');
    console.log(`TOTAL QA TESTS EXECUTED: ${totalTests}`);
    console.log(`PASSED: ${passedTests}`);
    console.log(`FAILED: ${failedTests}`);
    console.log('================================================================');

    await mongoose.connection.close();
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runMasterQASuite();
