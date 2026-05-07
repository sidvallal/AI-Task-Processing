import { Queue } from 'bullmq';
import redisConnection from './redisConnection.js';

/**
 * BullMQ queue for task processing.
 * Jobs are added here when a user creates a task.
 * A separate worker (built in a later step) will consume these jobs.
 */
const taskQueue = new Queue('task-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,                          // Retry failed jobs up to 3 times
    backoff: { type: 'exponential', delay: 1000 }, // Exponential backoff starting at 1s
    removeOnComplete: { count: 100 },     // Keep last 100 completed jobs for debugging
    removeOnFail: { count: 50 },          // Keep last 50 failed jobs for debugging
  },
});

console.log('📋 Task queue "task-processing" initialized');

export default taskQueue;
