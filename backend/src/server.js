import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedSystemTemplates } from './services/templateSeedService.js';

const PORT = process.env.PORT || 5000;

// Start HTTP Server immediately
const server = app.listen(PORT, () => {
  console.log(`[Server] Outly Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[Server] Health Check available at http://localhost:${PORT}/api/health`);
});

// Connect Database & Seed Templates asynchronously
connectDB().then((conn) => {
  if (conn) {
    seedSystemTemplates().catch(err => {
      console.error(`[Template Seed Error] ${err.message}`);
    });
  }
}).catch(err => {
  console.error(`[Database Initialization Error] ${err.message}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
