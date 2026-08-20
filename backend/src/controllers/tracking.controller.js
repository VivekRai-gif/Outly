import { recordTrackingEvent, TRANSPARENT_GIF_BUFFER } from '../services/trackingService.js';

/**
 * @route   GET /api/tracking/open/:emailId
 * @desc    Track email open event (1x1 pixel)
 * @access  Public
 */
export const handleOpenTracking = async (req, res) => {
  try {
    const { emailId } = req.params;

    if (emailId) {
      // Record 'opened' event asynchronously
      recordTrackingEvent({
        emailId,
        eventType: 'opened',
        req,
      }).catch((err) => console.error('[Open Tracking Logging Error]:', err.message));
    }
  } catch (err) {
    console.error('[Open Tracking Error]:', err.message);
  }

  // Always return 1x1 transparent GIF with anti-caching headers
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.status(200).send(TRANSPARENT_GIF_BUFFER);
};

/**
 * @route   GET /api/tracking/click/:emailId
 * @desc    Track link click event and redirect to original destination
 * @access  Public
 */
export const handleClickTracking = async (req, res) => {
  const { emailId } = req.params;
  const { url } = req.query;

  const destinationUrl = url ? decodeURIComponent(url) : 'http://localhost:5173';

  try {
    if (emailId) {
      await recordTrackingEvent({
        emailId,
        eventType: 'clicked',
        metadata: { url: destinationUrl },
        req,
      });
    }
  } catch (err) {
    console.error('[Click Tracking Error]:', err.message);
  }

  // Redirect browser to destination URL
  res.redirect(302, destinationUrl);
};
