import Redis from 'ioredis';

/**
 * Redis connection configuration for BullMQ
 */
export const getRedisConnectionOptions = () => {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT, 10) || 6379;
  const password = process.env.REDIS_PASSWORD || undefined;
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
