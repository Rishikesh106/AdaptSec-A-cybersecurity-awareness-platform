import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { loadEnv } from "../config/env.js";
import { emailAdapter, EmailMessage } from "./email.js";
import { generateReportExport } from "./reports.js";

let queues: {
  emailQueue: Queue;
  campaignQueue: Queue;
  reportQueue: Queue;
  redis: Redis;
} | null = null;

async function getQueues() {
  if (process.env.NODE_ENV === "test") {
    return null;
  }
  if (queues) return queues;

  const env = loadEnv();
  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 500,
    lazyConnect: true,
    retryStrategy: () => null,
  });

  try {
    await redis.connect();
    await redis.ping();
    queues = {
      redis,
      emailQueue: new Queue("adaptsec-emails", { connection: redis }),
      campaignQueue: new Queue("adaptsec-campaigns", { connection: redis }),
      reportQueue: new Queue("adaptsec-reports", { connection: redis }),
    };
    return queues;
  } catch {
    redis.disconnect();
    return null;
  }
}

export async function enqueueEmailJob(msg: EmailMessage): Promise<void> {
  const q = await getQueues();
  if (q) {
    try {
      await q.emailQueue.add("send-email", msg, {
        attempts: 3,
        removeOnComplete: 100,
      });
      return;
    } catch {
      // Fallback to direct SMTP adapter if queue enqueue fails
    }
  }
  await emailAdapter.send(msg);
}

export async function enqueueCampaignJob(payload: {
  campaignId: string;
  organizationId: string;
  type: "LAUNCH" | "REMINDER";
}): Promise<void> {
  const q = await getQueues();
  if (q) {
    try {
      await q.campaignQueue.add("campaign-dispatch", payload, {
        attempts: 2,
        removeOnComplete: 100,
      });
      return;
    } catch {
      // Fallback handled by caller
    }
  }
}

export async function enqueueReportExportJob(exportId: string): Promise<void> {
  const q = await getQueues();
  if (q) {
    try {
      await q.reportQueue.add(
        "generate-report",
        { exportId },
        { attempts: 2, removeOnComplete: 50 }
      );
      return;
    } catch {
      // Fallback to inline generation
    }
  }
  await generateReportExport(exportId);
}
