import { Worker } from "bullmq";
import { Redis } from "ioredis";
import pino from "pino";

const logger = pino({ name: "adaptsec-worker" });

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

const emailWorker = new Worker(
  "adaptsec-emails",
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, "Processing email job");
  },
  { connection }
);

const campaignWorker = new Worker(
  "adaptsec-campaigns",
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, "Processing campaign job");
  },
  { connection }
);

const reportWorker = new Worker(
  "adaptsec-reports",
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, "Processing report export job");
  },
  { connection }
);

logger.info("AdaptSec BullMQ worker started and listening on Redis queues");

const shutdown = async () => {
  await Promise.all([
    emailWorker.close(),
    campaignWorker.close(),
    reportWorker.close(),
    connection.quit(),
  ]);
  process.exit(0);
};

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
