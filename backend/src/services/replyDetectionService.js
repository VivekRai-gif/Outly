import { google } from 'googleapis';
import { getOAuth2Client, loadStoredAuthData } from './googleAuth.service.js';
import Contact from '../models/Contact.js';
import EmailEvent from '../models/EmailEvent.js';
import { handleReplyDetected } from './followUpService.js';

/**
 * Extract clean email address from header string
 * e.g. "Jane Doe <jane@example.com>" -> "jane@example.com"
 */
export function extractEmailAddress(headerStr = '') {
  if (!headerStr) return '';
  const match = headerStr.match(/<([^>]+)>/) || headerStr.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return match ? match[1].toLowerCase().trim() : headerStr.toLowerCase().trim();
}

/**
 * Parse header value from Gmail payload headers array
 */
export function getHeaderValue(headers = [], headerName = '') {
  const targetName = headerName.toLowerCase();
  const found = headers.find((h) => h.name && h.name.toLowerCase() === targetName);
  return found ? found.value : '';
}

/**
 * Scan connected Gmail inbox for recipient replies
 */
export async function checkForReplies() {
  const authData = loadStoredAuthData();
  if (!authData || !authData.tokens || !authData.tokens.access_token) {
    console.warn('[Reply Detection] Gmail account not connected. Skipping reply scan.');
    return { success: false, reason: 'Gmail account not connected', repliesDetected: 0 };
  }

  const userEmail = (authData.email || '').toLowerCase().trim();
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(authData.tokens);

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    // 1. Query inbox messages
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:inbox',
      maxResults: 50,
    });

    const messages = listRes.data.messages || [];
    console.log(`[Reply Detection] Found ${messages.length} messages in Gmail inbox`);

    let repliesDetected = 0;
    let processedCount = 0;

    // 2. Process each message
    for (const msgRef of messages) {
      const msgRes = await gmail.users.messages.get({
        userId: 'me',
        id: msgRef.id,
        format: 'full',
      });

      const msg = msgRes.data;
      const headers = msg.payload?.headers || [];

      const rawFrom = getHeaderValue(headers, 'From');
      const senderEmail = extractEmailAddress(rawFrom);
      const subject = getHeaderValue(headers, 'Subject');
      const dateStr = getHeaderValue(headers, 'Date');
      const messageId = msg.id;
      const threadId = msg.threadId;

      // Skip self-sent emails
      if (!senderEmail || senderEmail === userEmail) {
        continue;
      }

      processedCount++;

      // 3. Find matching Contact in database
      const contact = await Contact.findOne({ email: senderEmail });
      if (!contact) {
        // Unrelated email, skip
        continue;
      }

      // 4. Idempotency Check: check if EmailEvent for this reply message ID already exists
      const existingEvent = await EmailEvent.findOne({
        contactId: contact._id,
        eventType: 'replied',
        'metadata.messageId': messageId,
      });

      if (existingEvent) {
        console.log(`[Reply Detection] Reply for ${senderEmail} (Msg: ${messageId}) already recorded. Skipping.`);
        continue;
      }

      console.log(`[Reply Detection] NEW REPLY DETECTED from ${contact.name} <${senderEmail}>!`);

      const replyDate = dateStr ? new Date(dateStr) : new Date();

      // 5. Update Contact status & Cancel pending follow-up sequence
      await handleReplyDetected(contact._id);

      // 6. Record EmailEvent
      await EmailEvent.create({
        contactId: contact._id,
        eventType: 'replied',
        timestamp: replyDate,
        metadata: {
          messageId,
          threadId,
          subject,
          from: senderEmail,
        },
      });

      repliesDetected++;
    }

    return {
      success: true,
      processedCount,
      repliesDetected,
    };

  } catch (error) {
    console.error('[Reply Detection Error]:', error.message);
    throw new Error(`Reply detection failed: ${error.message}`);
  }
}
