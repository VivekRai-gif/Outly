import { sendGmailMessage } from '../services/email.service.js';
import { personalizeEmail } from '../utils/personalize.js';

/**
 * @route   POST /api/emails/test
 * @desc    Send a test email using connected Gmail account
 * @access  Public
 */
export const sendTestEmail = async (req, res, next) => {
  try {
    const { recipientEmail, to, recipient, subject, body, contact } = req.body;
    const targetEmail = recipientEmail || to || recipient;

    if (!targetEmail || typeof targetEmail !== 'string' || !targetEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid recipient email address is required for sending a test email.',
      });
    }

    const testContact = contact || {
      name: 'Test Recipient',
      email: targetEmail,
      company: 'Test Company',
      role: 'Test Role',
    };

    const personalized = personalizeEmail(
      subject || 'Test Email from Outly',
      body || 'This is a test email sent from Outly.',
      testContact
    );

    const result = await sendGmailMessage({
      to: targetEmail,
      subject: `[TEST] ${personalized.subject}`,
      body: personalized.body,
    });

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${targetEmail}`,
      messageId: result.messageId,
      personalized,
    });
  } catch (error) {
    next(error);
  }
};
