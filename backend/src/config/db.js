import mongoose from 'mongoose';

/**
 * Reusable MongoDB database connection module
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/outly';
    
    // Set Mongoose options
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database] Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
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
