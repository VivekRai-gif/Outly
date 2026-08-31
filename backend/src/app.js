import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes.js';
import contactRoutes from './routes/contact.routes.js';
import campaignRoutes from './routes/campaign.routes.js';
import authRoutes from './routes/auth.routes.js';
import emailRoutes from './routes/email.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import templateRoutes from './routes/template.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { globalRateLimiter, strictRateLimiter, sanitizeRequestParams } from './middleware/security.middleware.js';
import { requireDbConnection } from './middleware/dbCheck.middleware.js';

const app = express();

// Disable 'x-powered-by' express header to conceal framework identity
app.disable('x-powered-by');

// Security HTTP Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow pixel tracking images
  contentSecurityPolicy: false,
}));

// CORS Protection
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Request origin not allowed.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Rate Limiting
app.use('/api', globalRateLimiter);
app.use('/api/auth', strictRateLimiter);
app.use('/api/emails/test', strictRateLimiter);

// Body Parsing & Size Restrictions (10MB limit)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL Query Injection Sanitization
app.use(mongoSanitize());

// Path traversal and parameter guards
app.use(sanitizeRequestParams);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/health', healthRoutes);

// Ensure MongoDB connection before accessing data endpoints
app.use('/api', requireDbConnection);

app.use('/api/contacts', contactRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/templates', templateRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
