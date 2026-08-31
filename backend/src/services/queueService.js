import { Queue, Worker } from 'bullmq';
import { getRedisConnectionOptions } from '../config/redis.js';

export const QUEUE_NAME = 'outly-followup-queue';

let followUpQueue = null;
let followUpWorker = null;
let isRedisAvailable = true;

// In-memory fallback job registry for dev mode when Redis is not running
const inMemoryJobs = new Map();

/**
 * Initialize BullMQ Queue
 */
export function getFollowUpQueue() {
  if (!followUpQueue) {
    try {
      const connection = getRedisConnectionOptions();
      followUpQueue = new Queue(QUEUE_NAME, { connection });
      followUpQueue.on('error', (err) => {
        if (isRedisAvailable) {
          console.warn('[Queue Service Warning] Redis connection error:', err.message, '- Switching to in-memory timer fallback');
          isRedisAvailable = false;
        }
      });
    } catch (err) {
      console.warn('[Queue Service Warning] BullMQ Queue initialization failed:', err.message);
      isRedisAvailable = false;
    }
  }
  return followUpQueue;
}

/**
 * Schedule automated follow-up job in BullMQ
 */
export async function scheduleFollowUpJob({ campaignId, contactId, followUpIndex, delayMs, processorFn }) {
  const jobId = `followup-${campaignId}-${contactId}-${followUpIndex}`;

  console.log(`[Queue Service] Scheduling follow-up job ${jobId} (Delay: ${Math.round(delayMs / 1000)}s)`);

  try {
    const queue = getFollowUpQueue();
    if (queue && isRedisAvailable) {
      await queue.add(
        'processFollowUpStep',
        { campaignId, contactId, followUpIndex },
        {
          jobId,
          delay: delayMs,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 60000, // 1 min initial retry backoff
          },
          removeOnComplete: false,
        }
      );
      console.log(`[Queue Service] Job ${jobId} added to BullMQ successfully`);
      return { success: true, jobId, type: 'bullmq' };
    }
  } catch (err) {
    console.warn(`[Queue Service] Redis Queue unavailable (${err.message}). Using in-memory fallback runner.`);
    isRedisAvailable = false;
  }

  // Fallback in-memory timer runner if Redis server is not running locally
  if (inMemoryJobs.has(jobId)) {
    clearTimeout(inMemoryJobs.get(jobId).timer);
  }

  const timer = setTimeout(async () => {
    inMemoryJobs.delete(jobId);
    if (processorFn) {
      try {
        console.log(`[In-Memory Queue] Executing delayed follow-up job ${jobId}...`);
        await processorFn({ campaignId, contactId, followUpIndex });
      } catch (err) {
        console.error(`[In-Memory Queue Error] Job ${jobId} failed:`, err.message);
      }
    }
  }, Math.max(0, delayMs));

  inMemoryJobs.set(jobId, { timer, campaignId, contactId, followUpIndex });
  return { success: true, jobId, type: 'in-memory' };
}

/**
 * Cancel pending follow-up jobs for a specific contact (e.g. when contact replies)
 */
export async function cancelFollowUpJobsForContact(contactId) {
  console.log(`[Queue Service] Cancelling pending follow-up jobs for Contact ${contactId}...`);

  // 1. Clear BullMQ jobs matching contactId
  try {
    const queue = getFollowUpQueue();
    if (queue && isRedisAvailable) {
      const delayed = await queue.getDelayed();
      for (const job of delayed) {
        if (job.data && String(job.data.contactId) === String(contactId)) {
          await job.remove();
          console.log(`[Queue Service] Removed BullMQ job ${job.id}`);
        }
      }
    }
  } catch (err) {
    console.warn('[Queue Service Warning] BullMQ job removal error:', err.message);
  }

  // 2. Clear in-memory fallback jobs
  for (const [jobId, item] of inMemoryJobs.entries()) {
    if (String(item.contactId) === String(contactId)) {
      clearTimeout(item.timer);
      inMemoryJobs.delete(jobId);
      console.log(`[In-Memory Queue] Cancelled fallback job ${jobId}`);
    }
  }

  return { success: true, contactId };
}

/**
 * Cancel pending follow-up jobs for an entire campaign
 */
export async function cancelCampaignJobs(campaignId) {
  console.log(`[Queue Service] Cancelling pending jobs for Campaign ${campaignId}...`);

  try {
    const queue = getFollowUpQueue();
    if (queue && isRedisAvailable) {
      const delayed = await queue.getDelayed();
      for (const job of delayed) {
        if (job.data && String(job.data.campaignId) === String(campaignId)) {
          await job.remove();
        }
      }
    }
  } catch (err) {
    console.warn('[Queue Service Warning] Campaign jobs removal error:', err.message);
  }

  for (const [jobId, item] of inMemoryJobs.entries()) {
    if (String(item.campaignId) === String(campaignId)) {
      clearTimeout(item.timer);
      inMemoryJobs.delete(jobId);
    }
  }

  return { success: true, campaignId };
}

/**
 * Start BullMQ Worker
 */
export function startFollowUpWorker(processorFn) {
  try {
    const connection = getRedisConnectionOptions();
    followUpWorker = new Worker(
      QUEUE_NAME,
      async (job) => {
        console.log(`[BullMQ Worker] Processing job ${job.id}...`);
        await processorFn(job.data);
      },
      { connection }
    );

    followUpWorker.on('completed', (job) => {
      console.log(`[BullMQ Worker] Job ${job.id} completed successfully`);
    });

    followUpWorker.on('failed', (job, err) => {
      console.error(`[BullMQ Worker] Job ${job ? job.id : 'unknown'} failed:`, err.message);
    });

    followUpWorker.on('error', (err) => {
      if (isRedisAvailable) {
        console.warn('[BullMQ Worker Warning] Worker Redis connection error:', err.message);
        isRedisAvailable = false;
      }
    });

    console.log('[BullMQ Worker] Follow-up worker started successfully');
  } catch (err) {
    console.warn('[BullMQ Worker Warning] Worker failed to start:', err.message);
  }
}
