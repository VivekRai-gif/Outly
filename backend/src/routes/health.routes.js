import express from 'express';
import { getDbState, isDbConnected } from '../config/db.js';
import { User, Contact, Campaign, Email, EmailEvent } from '../models/index.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    System & database connectivity health check
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbState = getDbState();
  const dbConnected = isDbConnected();

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    status: dbConnected ? 'ok' : 'degraded',
    service: 'Outly API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: dbState,
      connected: dbConnected,
    },
  });
});

/**
 * @route   GET /api/health/db
 * @desc    Detailed database collection statistics & schema validation test
 * @access  Public
 */
router.get('/db', async (req, res, next) => {
  try {
    const dbConnected = isDbConnected();
    if (!dbConnected) {
      return res.status(503).json({
        success: false,
        message: 'Database disconnected. Please check MONGO_URI service.',
        dbState: getDbState(),
      });
    }

    // Query collection counts to verify schema registration & DB connectivity
    const [userCount, contactCount, campaignCount, emailCount, eventCount] = await Promise.all([
      User.countDocuments(),
      Contact.countDocuments(),
      Campaign.countDocuments(),
      Email.countDocuments(),
      EmailEvent.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      message: 'MongoDB database connection and schemas verified',
      database: {
        status: getDbState(),
        models: {
          User: { registered: true, count: userCount },
          Contact: { registered: true, count: contactCount },
          Campaign: { registered: true, count: campaignCount },
          Email: { registered: true, count: emailCount },
          EmailEvent: { registered: true, count: eventCount },
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
