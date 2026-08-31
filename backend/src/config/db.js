import mongoose from 'mongoose';

let mongoMemoryServerInstance = null;

/**
 * Reusable MongoDB database connection module
 */
export const connectDB = async () => {
  // Disable query buffering so Mongoose queries fail fast when DB is disconnected
  // instead of buffering for 10000ms and timing out.
  mongoose.set('bufferCommands', false);
  mongoose.set('strictQuery', true);

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/outly';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed connecting to ${mongoUri}: ${error.message}`);

    // Attempt local MongoDB fallback
    const localUri = 'mongodb://127.0.0.1:27017/outly';
    console.log(`[Database] Attempting local MongoDB fallback (${localUri})...`);
    try {
      const localConn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[Database] Local MongoDB Connected: ${localConn.connection.host} / ${localConn.connection.name}`);
      return localConn;
    } catch (localErr) {
      console.error(`[Database Error] Local MongoDB fallback also failed: ${localErr.message}`);
    }

    // In-Memory Mongo Server Fallback (Runs on Render/Cloud if Atlas/Local Mongo unavailable)
    console.log('[Database] Initializing In-Memory MongoDB Server fallback...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memUri = mongoMemoryServerInstance.getUri();
      const memConn = await mongoose.connect(memUri);
      console.log(`[Database] In-Memory MongoDB Connected: ${memConn.connection.host} / ${memConn.connection.name}`);
      return memConn;
    } catch (memErr) {
      console.error(`[Database Error] In-Memory MongoDB fallback failed: ${memErr.message}`);
    }

    console.error(`[Database Action Required] Please verify:`);
    console.error(`  1. Your current IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0 for all IPs).`);
    console.error(`  2. Set MONGO_URI in Render Dashboard Environment variables.`);

    return null;
  }
};

/**
 * Helper to inspect current connection state
 * @returns {string} 'connected' | 'connecting' | 'disconnecting' | 'disconnected'
 */
export const getDbState = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Check if DB is ready
 * @returns {boolean}
 */
export const isDbConnected = () => mongoose.connection.readyState === 1;

