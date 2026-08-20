import Contact from '../models/Contact.js';
import Campaign from '../models/Campaign.js';
import Email from '../models/Email.js';
import EmailEvent from '../models/EmailEvent.js';

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get aggregated dashboard metrics, campaign performance, recent activity, and spotlight contact timeline
 * @access  Public
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Parallel Top Metrics Aggregation
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

    // 2. Fetch Recent Activity Stream (10 most recent events)
    const recentActivity = await EmailEvent.find()
      .populate('contactId', 'name email company role status')
      .populate('emailId', 'subject type status')
      .sort({ timestamp: -1 })
      .limit(10);

    // 3. Fetch Campaigns List with Calculated Progress
    const campaigns = await Campaign.find()
      .populate('contacts', 'name email company role status')
      .sort({ createdAt: -1 })
      .limit(10);

    const campaignSummaries = await Promise.all(
      campaigns.map(async (c) => {
        const totalRecipients = Array.isArray(c.contacts) ? c.contacts.length : 0;

        const sentCount = await Email.countDocuments({
          campaignId: c._id,
          status: 'sent',
        });

        const repliedCount = Array.isArray(c.contacts)
          ? c.contacts.filter((contact) => typeof contact === 'object' && contact.status === 'replied').length
          : 0;

        const followUpCount = Array.isArray(c.followUps) ? c.followUps.length : 0;
        const progress = totalRecipients > 0 ? Math.min(100, Math.round((sentCount / totalRecipients) * 100)) : 0;

        return {
          _id: c._id,
          name: c.name,
          subject: c.subject,
          status: c.status,
          totalRecipients,
          sentCount,
          repliedCount,
          followUpCount,
          progress,
          createdAt: c.createdAt,
        };
      })
    );

    // 4. Spotlight Contact Timeline
    // Find a replied contact or most recently updated contact
    let spotlightContact = await Contact.findOne({ status: 'replied' }).sort({ updatedAt: -1 });
    if (!spotlightContact) {
      spotlightContact = await Contact.findOne({ status: 'follow_up_pending' }).sort({ updatedAt: -1 });
    }
    if (!spotlightContact) {
      spotlightContact = await Contact.findOne().sort({ createdAt: -1 });
    }

    let spotlightTimeline = [];
    if (spotlightContact) {
      spotlightTimeline = await EmailEvent.find({ contactId: spotlightContact._id })
        .populate('emailId', 'subject type status')
        .sort({ timestamp: 1 });
    }

    res.status(200).json({
      success: true,
      metrics: {
        totalContacts,
        emailsSent,
        followUpsPending,
        replies,
        bounces,
        failedEmails,
      },
      campaigns: campaignSummaries,
      recentActivity,
      spotlight: spotlightContact
        ? {
            contact: spotlightContact,
            timeline: spotlightTimeline,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};
