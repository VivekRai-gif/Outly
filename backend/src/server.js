import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedSystemTemplates } from './services/templateSeedService.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const conn = await connectDB();
    if (conn) {
      await seedSystemTemplates().catch(err => {
        console.error(`[Template Seed Error] ${err.message}`);
      });
    }
  } catch (err) {
    console.error(`[Server Startup Error] DB initialization error: ${err.message}`);
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] Outly Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[Server] Health Check available at http://localhost:${PORT}/api/health`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
