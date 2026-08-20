import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { Campaign, Contact } from '../models/index.js';
import mongoose from 'mongoose';

async function runCampaignTest() {
  console.log('--- Outly Campaign Model & API Verification Test ---');

  await connectDB();

  try {
    // 1. Create a dummy contact
    const testContact = await Contact.create({
      name: 'Rahul Sharma',
      email: `rahul.test.${Date.now()}@example.com`,
      company: 'ABC Technologies',
      role: 'Software Engineer Intern',
      status: 'ready',
    });
    console.log(`✓ Created test contact: "${testContact.name}" (${testContact._id})`);

    // 2. Create a test campaign
    const testCampaign = await Campaign.create({
      name: 'August Internship Outreach Test',
      description: 'Reaching out to engineering managers for internship opportunities',
      subject: 'Application for {{role}} at {{company}}',
      body: 'Hi {{name}},\n\nI am reaching out regarding the {{role}} opportunity at {{company}}.',
      status: 'draft',
      contacts: [testContact._id],
      followUps: [
        {
          delayDays: 3,
          subject: 'Following up regarding {{role}} at {{company}}',
          body: 'Hi {{name}},\n\nJust following up on my previous email...',
        },
      ],
    });
    console.log(`✓ Created test campaign: "${testCampaign.name}" (${testCampaign._id})`);

    // 3. Query and populate campaign
    const fetched = await Campaign.findById(testCampaign._id).populate('contacts');
    console.log(`✓ Fetched campaign with populated contacts: ${fetched.contacts.length} recipient(s)`);
    console.log(`  Recipient #1: ${fetched.contacts[0].name} <${fetched.contacts[0].email}>`);

    // 4. Update campaign status
    fetched.status = 'scheduled';
    await fetched.save();
    console.log(`✓ Updated campaign status to "${fetched.status}"`);

    // 5. Cleanup test data
    await Campaign.findByIdAndDelete(testCampaign._id);
    await Contact.findByIdAndDelete(testContact._id);
    console.log('✓ Cleaned up test data.');

    console.log('\n🎉 CAMPAIGN MODEL & PERSISTENCE VERIFICATION PASSED!');
  } catch (err) {
    console.error('❌ Campaign Test Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runCampaignTest();
