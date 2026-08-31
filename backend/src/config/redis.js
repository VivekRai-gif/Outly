import Redis from 'ioredis';

/**
 * Redis connection configuration for BullMQ
 */
export const getRedisConnectionOptions = () => {
  let host = process.env.REDIS_HOST || '127.0.0.1';

  // If host contains placeholder text from .env.example, fallback to local Redis
  if (host.includes('your-') || host.includes('your_') || host.includes('your-redis-name')) {
    host = '127.0.0.1';
  }

  const port = parseInt(process.env.REDIS_PORT, 10) || 6379;
  const password = (process.env.REDIS_PASSWORD && !process.env.REDIS_PASSWORD.includes('your_')) 
    ? process.env.REDIS_PASSWORD 
    : undefined;

  const isUpstash = host.includes('upstash.io') || process.env.REDIS_TLS === 'true';

  return {
    host,
    port,
    password,
    ...(isUpstash ? { tls: { rejectUnauthorized: false } } : {}),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  };
};

/**
 * Helper to create a new Redis client instance
 */
export function createRedisClient() {
  const options = getRedisConnectionOptions();
  const client = new Redis(options);

  client.on('error', (err) => {
    // Log Redis error without crashing the server process
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Redis Client Warning]:', err.message);
    }
  });

  return client;
}
