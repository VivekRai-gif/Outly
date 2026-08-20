import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedSystemTemplates } from './services/templateSeedService.js';

const PORT = process.env.PORT || 5000;

// Connect Database & Seed System Templates
connectDB().then(() => {
  seedSystemTemplates();
});

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`[Server] Outly Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[Server] Health Check available at http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
