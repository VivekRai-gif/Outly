import Campaign from '../models/Campaign.js';
import Contact from '../models/Contact.js';
import Email from '../models/Email.js';
import EmailEvent from '../models/EmailEvent.js';
import { personalizeEmail } from '../utils/personalize.js';
import { sendGmailMessage } from '../services/email.service.js';
import { getGoogleAuthStatus } from '../services/googleAuth.service.js';
import { scheduleFollowUpJob, cancelCampaignJobs } from '../services/queueService.js';
import { processFollowUpStep } from '../services/followUpService.js';

/**
 * @route   GET /api/campaigns/:id/analytics
 * @desc    Get campaign engagement analytics (sent, opens, clicks, replies, rates)
 * @access  Public
 */
export const getCampaignAnalytics = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const campaignId = campaign._id;
    const emails = await Email.find({ campaignId });
    const emailIds = emails.map((e) => e._id);

    // Fetch all events related to campaign emails
    const events = await EmailEvent.find({
      $or: [{ emailId: { $in: emailIds } }, { 'metadata.campaignId': String(campaignId) }],
    });

    const totalRecipients = Array.isArray(campaign.contacts) ? campaign.contacts.length : 0;
    const sentCount = emails.filter((e) => e.status === 'sent').length;
    const failedCount = emails.filter((e) => e.status === 'failed').length;

    // Distinct contacts for engagement events
    const openContactIds = new Set(events.filter((e) => e.eventType === 'opened').map((e) => String(e.contactId)));
    const clickContactIds = new Set(events.filter((e) => e.eventType === 'clicked').map((e) => String(e.contactId)));
    const replyContactIds = new Set(events.filter((e) => e.eventType === 'replied').map((e) => String(e.contactId)));

    const openedCount = openContactIds.size;
    const clickedCount = clickContactIds.size;
    const repliedCount = replyContactIds.size;

    const openRate = sentCount > 0 ? Math.round((openedCount / sentCount) * 100) : 0;
    const clickRate = sentCount > 0 ? Math.round((clickedCount / sentCount) * 100) : 0;
    const replyRate = sentCount > 0 ? Math.round((repliedCount / sentCount) * 100) : 0;

    res.status(200).json({
      success: true,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        status: campaign.status,
      },
      analytics: {
        totalRecipients,
        sentCount,
        failedCount,
        openedCount,
        clickedCount,
        repliedCount,
        rates: {
          openRate,
          clickRate,
          replyRate,
        },
        notice: 'Open tracking values represent estimated/observed pixel renders.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/campaigns
 * @desc    Create a new outreach campaign
 * @access  Public
 */
export const createCampaign = async (req, res, next) => {
  try {
    const { name, description, subject, body, status, contacts, followUps } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Campaign name is required',
      });
    }

    const campaign = await Campaign.create({
      name: name.trim(),
      description: description || '',
      subject: subject || '',
      body: body || '',
      status: status || 'draft',
      contacts: Array.isArray(contacts) ? contacts : [],
      followUps: Array.isArray(followUps) ? followUps : [],
    });

    const populatedCampaign = await Campaign.findById(campaign._id).populate('contacts');

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign: populatedCampaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/campaigns/:id/send
 * @desc    Launch campaign sending across all targeted contacts using Gmail API
 * @access  Public
 */
export const sendCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('contacts');

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (!campaign.subject || !campaign.subject.trim() || !campaign.body || !campaign.body.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Campaign subject and body template must not be empty.',
      });
    }

    if (!Array.isArray(campaign.contacts) || campaign.contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Campaign has no assigned contacts to send emails to.',
      });
    }

    const authStatus = await getGoogleAuthStatus();
    if (!authStatus.connected) {
      return res.status(400).json({
        success: false,
        message: 'Gmail account not connected. Please connect your Gmail account in Settings before sending campaigns.',
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const contact of campaign.contacts) {
      if (!contact.email) {
        skippedCount++;
        continue;
      }

      const existingSentEmail = await Email.findOne({
        campaignId: campaign._id,
        contactId: contact._id,
        type: 'initial',
        status: 'sent',
      });

      if (existingSentEmail) {
        skippedCount++;
        continue;
      }

      const { subject, body } = personalizeEmail(campaign.subject, campaign.body, contact);

      try {
        // Pre-create Email document to pass emailId to Gmail sender for pixel injection
        const emailDoc = await Email.create({
          campaignId: campaign._id,
          contactId: contact._id,
          type: 'initial',
          subject,
          body,
          status: 'queued',
          scheduledAt: new Date(),
        });

        const sendResult = await sendGmailMessage({
          to: contact.email,
          subject,
          body,
          emailId: emailDoc._id,
        });

        const now = new Date();

        emailDoc.status = 'sent';
        emailDoc.messageId = sendResult.messageId;
        emailDoc.sentAt = sendResult.sentAt;
        await emailDoc.save();

        contact.status = 'sent';
        contact.lastEmailSentAt = sendResult.sentAt;

        if (Array.isArray(campaign.followUps) && campaign.followUps.length > 0) {
          const firstStep = campaign.followUps[0];
          const delayDays = firstStep.delayDays || 3;
          const delayMs = delayDays * 24 * 60 * 60 * 1000;

          contact.nextFollowUpAt = new Date(now.getTime() + delayMs);
          contact.status = 'follow_up_pending';

          await scheduleFollowUpJob({
            campaignId: campaign._id,
            contactId: contact._id,
            followUpIndex: 0,
            delayMs,
            processorFn: processFollowUpStep,
          });
        }

        await contact.save();

        await EmailEvent.create({
          emailId: emailDoc._id,
          contactId: contact._id,
          eventType: 'sent',
          timestamp: sendResult.sentAt,
          metadata: {
            messageId: sendResult.messageId,
            campaignId: campaign._id,
          },
        });

        sentCount++;
      } catch (err) {
        console.error(`[Campaign Send Error] Failed sending to ${contact.email}:`, err.message);
        errors.push({ email: contact.email, error: err.message });

        const failedEmailDoc = await Email.create({
          campaignId: campaign._id,
          contactId: contact._id,
          type: 'initial',
          subject,
          body,
          status: 'failed',
          scheduledAt: new Date(),
        });

        contact.status = 'failed';
        await contact.save();

        await EmailEvent.create({
          emailId: failedEmailDoc._id,
          contactId: contact._id,
          eventType: 'failed',
          timestamp: new Date(),
          metadata: { error: err.message, campaignId: campaign._id },
        });

        failedCount++;
      }
    }

    campaign.status = 'running';
    await campaign.save();

    res.status(200).json({
      success: true,
      message: `Campaign sending finished. ${sentCount} sent, ${failedCount} failed, ${skippedCount} skipped.`,
      sentCount,
      failedCount,
      skippedCount,
      totalRecipients: campaign.contacts.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/campaigns/:id/pause
 * @desc    Pause an active campaign and stop follow-up scheduling
 * @access  Public
 */
export const pauseCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    campaign.status = 'paused';
    await campaign.save();

    await cancelCampaignJobs(campaign._id);

    res.status(200).json({
      success: true,
      message: `Campaign "${campaign.name}" paused successfully`,
      campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/campaigns/:id/resume
 * @desc    Resume a paused campaign
 * @access  Public
 */
export const resumeCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    campaign.status = 'running';
    await campaign.save();

    res.status(200).json({
      success: true,
      message: `Campaign "${campaign.name}" resumed successfully`,
      campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/campaigns/preview
 * @desc    Generate personalized email preview for a contact
 * @access  Public
 */
export const previewPersonalizedEmail = async (req, res, next) => {
  try {
    const { subject, body, contactId, contact: directContact } = req.body;

    let targetContact = directContact || null;

    if (!targetContact && contactId) {
      targetContact = await Contact.findById(contactId);
    }

    if (!targetContact) {
      targetContact = {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        company: 'ABC Technologies',
        role: 'Software Engineer Intern',
      };
    }

    const personalized = personalizeEmail(subject || '', body || '', targetContact);

    res.status(200).json({
      success: true,
      template: {
        subject: subject || '',
        body: body || '',
      },
      personalized,
      contact: targetContact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/campaigns
 * @desc    Get campaigns list with search, status filter, and pagination
 * @access  Public
 */
export const getCampaigns = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }, { subject: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [campaigns, total] = await Promise.all([
      Campaign.find(query)
        .populate('contacts', 'name email company role status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Campaign.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: campaigns.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      campaigns,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/campaigns/:id
 * @desc    Get single campaign details populated with contacts
 * @access  Public
 */
export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('contacts');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    res.status(200).json({
      success: true,
      campaign,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/campaigns/:id
 * @desc    Update campaign fields, templates, or follow-ups
 * @access  Public
 */
export const updateCampaign = async (req, res, next) => {
  try {
    const { name, description, subject, body, status, contacts, followUps } = req.body;

    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    if (name !== undefined) campaign.name = name.trim();
    if (description !== undefined) campaign.description = description;
    if (subject !== undefined) campaign.subject = subject;
    if (body !== undefined) campaign.body = body;
    if (status !== undefined) campaign.status = status;
    if (contacts !== undefined && Array.isArray(contacts)) campaign.contacts = contacts;
    if (followUps !== undefined && Array.isArray(followUps)) campaign.followUps = followUps;

    const updatedCampaign = await campaign.save();
    const populated = await Campaign.findById(updatedCampaign._id).populate('contacts');

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      campaign: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/campaigns/:id
 * @desc    Delete campaign by ID
 * @access  Public
 */
export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    await cancelCampaignJobs(campaign._id);

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
