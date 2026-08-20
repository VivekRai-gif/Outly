import Campaign from '../models/Campaign.js';
import Contact from '../models/Contact.js';
import Email from '../models/Email.js';
import EmailEvent from '../models/EmailEvent.js';
import { personalizeEmail } from '../utils/personalize.js';
import { sendGmailMessage } from './email.service.js';
import {
  scheduleFollowUpJob,
  cancelFollowUpJobsForContact,
  startFollowUpWorker,
} from './queueService.js';

/**
 * Execute a single follow-up step in the automated sequence
 */
export async function processFollowUpStep({ campaignId, contactId, followUpIndex = 0 }) {
  console.log(`[Follow-up Engine] Processing step #${followUpIndex + 1} for Campaign ${campaignId}, Contact ${contactId}`);

  // 1. Fetch Campaign and Contact records
  const campaign = await Campaign.findById(campaignId);
  const contact = await Contact.findById(contactId);

  if (!campaign || !contact) {
    console.warn('[Follow-up Engine] Campaign or Contact record not found. Skipping follow-up.');
    return { success: false, reason: 'Record not found' };
  }

  // 2. Check contact reply status (Boundary check for reply detection)
  if (contact.status === 'replied') {
    console.log(`[Follow-up Engine] Contact ${contact.email} HAS REPLIED! Cancelling remaining follow-ups.`);
    await cancelFollowUpJobsForContact(contactId);
    return { success: false, reason: 'Contact replied. Follow-ups stopped.' };
  }

  // 3. Check campaign status (Allow campaign pause/completion control)
  if (campaign.status !== 'running') {
    console.log(`[Follow-up Engine] Campaign ${campaign.name} is "${campaign.status}". Skipping follow-up step.`);
    return { success: false, reason: `Campaign status is ${campaign.status}` };
  }

  // 4. Verify follow-up step index
  if (!Array.isArray(campaign.followUps) || followUpIndex >= campaign.followUps.length) {
    console.log('[Follow-up Engine] Sequence completed. No more follow-up steps remaining.');
    return { success: true, message: 'Sequence finished' };
  }

  const step = campaign.followUps[followUpIndex];

  // 5. Personalize follow-up template
  const { subject, body } = personalizeEmail(
    step.subject || `Following up regarding ${campaign.subject}`,
    step.body || '',
    contact
  );

  try {
    // 6. Send follow-up email via Gmail API
    const sendResult = await sendGmailMessage({
      to: contact.email,
      subject,
      body,
    });

    const now = new Date();

    // 7. Create Email document
    const emailDoc = await Email.create({
      campaignId: campaign._id,
      contactId: contact._id,
      messageId: sendResult.messageId,
      type: 'follow_up',
      subject,
      body,
      status: 'sent',
      scheduledAt: now,
      sentAt: now,
    });

    // 8. Create EmailEvent document
    await EmailEvent.create({
      emailId: emailDoc._id,
      contactId: contact._id,
      eventType: 'sent',
      timestamp: now,
      metadata: {
        messageId: sendResult.messageId,
        campaignId: campaign._id,
        followUpIndex,
      },
    });

    // 9. Check if next follow-up step exists
    const nextIndex = followUpIndex + 1;
    let nextFollowUpAt = null;

    if (nextIndex < campaign.followUps.length) {
      const nextStep = campaign.followUps[nextIndex];
      // Calculate delay milliseconds (delayDays relative to current step)
      const delayDays = nextStep.delayDays - step.delayDays > 0 ? nextStep.delayDays - step.delayDays : 1;
      const delayMs = delayDays * 24 * 60 * 60 * 1000;

      nextFollowUpAt = new Date(now.getTime() + delayMs);

      // Schedule next follow-up job in BullMQ / Queue service
      await scheduleFollowUpJob({
        campaignId: campaign._id,
        contactId: contact._id,
        followUpIndex: nextIndex,
        delayMs,
        processorFn: processFollowUpStep,
      });
    }

    // 10. Update Contact record
    contact.status = 'follow_up_pending';
    contact.lastEmailSentAt = now;
    contact.nextFollowUpAt = nextFollowUpAt;
    await contact.save();

    console.log(`[Follow-up Engine] Follow-up step #${followUpIndex + 1} sent to ${contact.email} successfully!`);

    return {
      success: true,
      messageId: sendResult.messageId,
      followUpIndex,
      hasNextStep: nextIndex < campaign.followUps.length,
    };

  } catch (error) {
    console.error(`[Follow-up Engine Error] Step #${followUpIndex + 1} failed for ${contact.email}:`, error.message);
    throw error;
  }
}

/**
 * Pluggable boundary for reply detection (Phase 9 integration)
 * Cancels all remaining follow-ups when a recipient reply is detected.
 */
export async function handleReplyDetected(contactId) {
  console.log(`[Reply Detection Boundary] Reply detected for Contact ${contactId}!`);

  const contact = await Contact.findById(contactId);
  if (contact) {
    contact.status = 'replied';
    contact.nextFollowUpAt = null;
    await contact.save();
  }

  await cancelFollowUpJobsForContact(contactId);

  return {
    success: true,
    message: 'Reply detected. All remaining follow-ups cancelled for contact.',
    contactId,
  };
}

/**
 * Initialize background BullMQ worker
 */
export function initializeFollowUpWorker() {
  startFollowUpWorker(processFollowUpStep);
}
