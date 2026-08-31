import { google } from 'googleapis';
import { getOAuth2Client, loadStoredAuthData } from './googleAuth.service.js';
import { injectTrackingElements } from './trackingService.js';

/**
 * Construct base64url encoded RFC 2822 MIME text message
 */
export function createMimeMessage({ to, from, subject, body }) {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject || '').toString('base64')}?=`;
  
  let formattedBody = body || '';
  if (!formattedBody.includes('<html') && !formattedBody.includes('<p') && !formattedBody.includes('<div') && !formattedBody.includes('<br')) {
    formattedBody = formattedBody.replace(/\n/g, '<br/>');
  }

  const headers = [
    `To: ${to}`,
    from ? `From: ${from}` : null,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
  ].filter(Boolean);

  const message = headers.join('\r\n') + '\r\n\r\n' + formattedBody;

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send personalized email via Gmail API using authorized OAuth credentials
 */
export async function sendGmailMessage({ to, subject, body, emailId }) {
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    throw new Error(`Invalid recipient email address: "${to}"`);
  }

  // Load server-side stored OAuth credentials
  const authData = await loadStoredAuthData();
  if (!authData || !authData.tokens || !authData.tokens.access_token) {
    throw new Error('Gmail account not connected. Please connect your Gmail account in Settings before sending.');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(authData.tokens);

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Inject open tracking pixel & click tracking link wrappers if emailId provided
  const trackedBody = emailId ? injectTrackingElements({ body, emailId }) : body;

  const rawMessage = createMimeMessage({
    to,
    from: authData.email || undefined,
    subject: subject || 'Outreach',
    body: trackedBody || '',
  });

  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });

    console.log(`[Gmail Service] Email sent successfully to ${to} (Message ID: ${response.data.id})`);

    return {
      success: true,
      messageId: response.data.id,
      threadId: response.data.threadId,
      sentAt: new Date(),
    };
  } catch (error) {
    console.error(`[Gmail Service Error] Failed to send email to ${to}:`, error.message);
    throw new Error(`Gmail API sending failed: ${error.message}`);
  }
}
