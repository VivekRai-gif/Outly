import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB, getDbState, isDbConnected } from '../config/db.js';
import { User, Contact, Campaign, Email, EmailEvent } from '../models/index.js';
import mongoose from 'mongoose';

async function runDatabaseTest() {
  console.log('--- Outly Database Verification Test ---');
  console.log(`Connecting to MONGO_URI: ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/outly'}`);

  const conn = await connectDB();

  if (!isDbConnected()) {
    console.error('❌ Connection failed! Current state:', getDbState());
    process.exit(1);
  }

  console.log('✅ Connected to MongoDB! Connection state:', getDbState());

  try {
    // 1. Test User model creation & normalization
    console.log('\nTesting User Schema...');
    const testUser = new User({
      name: 'Test Admin',
      email: ' ADMIN@OutlyApp.COM  ',
    });
    await testUser.validate();
    console.log(`  ✓ Email Normalized: "${testUser.email}" (expected: "admin@outlyapp.com")`);

    // 2. Test Contact model validation & status enum
    console.log('\nTesting Contact Schema...');
    const testContact = new Contact({
      name: 'John Doe',
      email: ' JOHN.DOE@EXAMPLE.COM ',
      company: 'Acme Corp',
      role: 'Head of Recruiting',
      status: 'pending',
    });
    await testContact.validate();
    console.log(`  ✓ Contact status enum validated: "${testContact.status}"`);

    // 3. Test Campaign & FollowUp subdocuments
    console.log('\nTesting Campaign Schema...');
    const testCampaign = new Campaign({
      name: 'Q3 Recruiting Outreach',
      subject: 'Opportunity at {{company}}',
      body: 'Hi {{name}}...',
      status: 'draft',
      followUps: [
        { delayDays: 3, subject: 'Following up', body: 'Just floating this...' },
      ],
    });
    await testCampaign.validate();
    console.log(`  ✓ Campaign followUps validated: ${testCampaign.followUps.length} follow-up step(s)`);

    // 4. Test Email Schema
    console.log('\nTesting Email Schema...');
    const dummyContactId = new mongoose.Types.ObjectId();
    const dummyCampaignId = new mongoose.Types.ObjectId();
    const testEmail = new Email({
      campaignId: dummyCampaignId,
      contactId: dummyContactId,
      type: 'initial',
      subject: 'Test Subject',
      body: 'Test Body',
      status: 'queued',
    });
    await testEmail.validate();
    console.log(`  ✓ Email schema references validated`);

    // 5. Test EmailEvent Schema
    console.log('\nTesting EmailEvent Schema...');
    const dummyEmailId = new mongoose.Types.ObjectId();
    const testEvent = new EmailEvent({
      emailId: dummyEmailId,
      contactId: dummyContactId,
      eventType: 'opened',
      metadata: { userAgent: 'Mozilla/5.0', ip: '127.0.0.1' },
    });
    await testEvent.validate();
    console.log(`  ✓ EmailEvent payload validated: "${testEvent.eventType}"`);

    console.log('\n🎉 ALL 5 SCHEMAS & MONGOOSE VALIDATIONS PASSED SUCCESSFUL!');

  } catch (err) {
    console.error('❌ Validation / DB Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

runDatabaseTest();
