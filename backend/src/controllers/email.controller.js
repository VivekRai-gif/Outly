import { sendGmailMessage } from '../services/email.service.js';
import { personalizeEmail } from '../utils/personalize.js';

/**
 * @route   POST /api/emails/test
 * @desc    Send a test email using connected Gmail account
 * @access  Public
 */
export const sendTestEmail = async (req, res, next) => {
  try {
    const { recipientEmail, subject, body, contact } = req.body;

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid recipient email address is required for sending a test email.',
      });
    }

    const testContact = contact || {
      name: 'Test Recipient',
      email: recipientEmail,
      company: 'Test Company',
      role: 'Test Role',
    };

    const personalized = personalizeEmail(
      subject || 'Test Email from Outly',
      body || 'This is a test email sent from Outly.',
      testContact
    );

    const result = await sendGmailMessage({
      to: recipientEmail,
      subject: `[TEST] ${personalized.subject}`,
      body: personalized.body,
    });

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${recipientEmail}`,
      messageId: result.messageId,
      personalized,
    });
  } catch (error) {
    next(error);
  }
};
