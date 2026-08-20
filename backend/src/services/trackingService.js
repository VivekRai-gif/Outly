import Email from '../models/Email.js';
import EmailEvent from '../models/EmailEvent.js';

// Transparent 1x1 GIF Image Buffer
export const TRANSPARENT_GIF_BUFFER = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * Inject open tracking pixel and click tracking URL wrappers
 */
export function injectTrackingElements({ body = '', emailId = '' }) {
  if (!body || !emailId) return body;

  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

  // 1. Rewrite plain HTTP/HTTPS URLs for click tracking (excluding tracking domain)
  const urlRegex = /(https?:\/\/[^\s<">]+)/gi;

  let trackedBody = body.replace(urlRegex, (match) => {
    if (match.includes('/api/tracking/')) return match;
    const trackingClickUrl = `${serverUrl}/api/tracking/click/${emailId}?url=${encodeURIComponent(match)}`;
    return trackingClickUrl;
  });

  // 2. Append 1x1 transparent open tracking pixel
  const trackingPixelUrl = `${serverUrl}/api/tracking/open/${emailId}`;
  const pixelHtml = `\n\n<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />`;

  return trackedBody + pixelHtml;
}

/**
 * Log tracking event with 5-second window deduplication
 */
export async function recordTrackingEvent({ emailId, contactId, eventType, metadata = {}, req = null }) {
  try {
    let targetEmailId = emailId;
    let targetContactId = contactId;

    // If only emailId provided, lookup Email document to get contactId
    if (targetEmailId && !targetContactId) {
      const emailDoc = await Email.findById(targetEmailId);
      if (emailDoc) {
        targetContactId = emailDoc.contactId;
      }
    }

    if (!targetContactId && !targetEmailId) {
      console.warn('[Tracking Service] Missing emailId/contactId for event logging');
      return null;
    }

    // Deduplication check: check if event occurred in last 5 seconds
    const fiveSecondsAgo = new Date(Date.now() - 5000);

    const query = {
      eventType,
      timestamp: { $gte: fiveSecondsAgo },
    };
    if (targetEmailId) query.emailId = targetEmailId;
    if (targetContactId) query.contactId = targetContactId;
    if (metadata.url) query['metadata.url'] = metadata.url;

    const duplicateEvent = await EmailEvent.findOne(query);

    if (duplicateEvent) {
      console.log(`[Tracking Service] Duplicate ${eventType} event within 5s window. Skipped.`);
      return duplicateEvent;
    }

    const eventDoc = await EmailEvent.create({
      emailId: targetEmailId || undefined,
      contactId: targetContactId || undefined,
      eventType,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        ip: req?.ip || req?.headers?.['x-forwarded-for'] || '',
        userAgent: req?.headers?.['user-agent'] || '',
      },
    });

    console.log(`[Tracking Service] Recorded event "${eventType}" for Contact ${targetContactId} (Email: ${targetEmailId})`);
    return eventDoc;
  } catch (error) {
    console.error('[Tracking Service Error]:', error.message);
    return null;
  }
}
