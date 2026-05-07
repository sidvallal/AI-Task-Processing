import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized Redis connection using ioredis.
 * This connection is shared across all BullMQ queues and workers.
 * Uses environment variables for host and port configuration.
 */
const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  maxRetriesPerRequest: null, // Required by BullMQ to avoid timeout issues
});

// --- Connection Event Handlers ---

redisConnection.on('connect', () => {
  console.log(`✅ Redis connected successfully at ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redisConnection.on('close', () => {
  console.warn('⚠️  Redis connection closed');
});

redisConnection.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

export default redisConnection;
