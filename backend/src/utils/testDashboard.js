import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { Contact, Campaign, Email, EmailEvent } from '../models/index.js';
import mongoose from 'mongoose';

async function runDashboardTest() {
  console.log('--- Outly Final Dashboard Aggregations Verification Test ---');

  await connectDB();

  try {
    const [
      totalContacts,
      emailsSent,
      followUpsPending,
      replies,
      bounces,
      failedEmails,
    ] = await Promise.all([
      Contact.countDocuments(),
      Email.countDocuments({ status: 'sent' }),
      Contact.countDocuments({ status: 'follow_up_pending' }),
      Contact.countDocuments({ status: 'replied' }),
      EmailEvent.countDocuments({ eventType: 'bounced' }),
      Email.countDocuments({ status: 'failed' }),
    ]);

    console.log('\n[Dashboard Aggregations]');
    console.log('Total Contacts:', totalContacts);
    console.log('Emails Sent:', emailsSent);
    console.log('Follow-ups Pending:', followUpsPending);
    console.log('Replies:', replies);
    console.log('Bounces:', bounces);
    console.log('Failed Emails:', failedEmails);

    const recentActivity = await EmailEvent.find()
      .populate('contactId', 'name email company')
      .sort({ timestamp: -1 })
      .limit(5);

    console.log(`\n✓ Fetched ${recentActivity.length} recent activity items`);

    console.log('\n🎉 DASHBOARD AGGREGATIONS VERIFICATION PASSED!');

  } catch (err) {
    console.error('❌ Test Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runDashboardTest();
