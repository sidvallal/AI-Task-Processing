import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT, 10) || 6379;

/**
 * Shared Redis connection for BullMQ.
 * Redis must be running before tasks can be queued or processed.
 */
const redisConnection = new IORedis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
});

let redisRetryCount = 0;
let hasLoggedRedisError = false;

redisConnection.on('connect', () => {
  redisRetryCount = 0;
  hasLoggedRedisError = false;
  console.log(`Redis connected at ${redisHost}:${redisPort}`);
});

redisConnection.on('error', (err) => {
  if (!hasLoggedRedisError) {
    console.error(
      `Redis connection failed at ${redisHost}:${redisPort}. Start Redis, or run the project with docker compose.`
    );
    console.error(err.message);
    hasLoggedRedisError = true;
  }
});

redisConnection.on('close', () => {
  console.warn('Redis connection closed');
});

redisConnection.on('reconnecting', () => {
  redisRetryCount += 1;
  if (redisRetryCount === 1 || redisRetryCount % 5 === 0) {
    console.log(`Redis reconnecting... attempt ${redisRetryCount}`);
  }
});

export default redisConnection;
