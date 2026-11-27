import fs from "node:fs/promises";
import path from "node:path";
import { Worker } from "bullmq";
import { Redis } from "ioredis";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import pino from "pino";
import { prisma } from "@adaptsec/db";

const logger = pino({ name: "adaptsec-worker" });

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const storageDir = path.resolve(process.env.STORAGE_LOCAL_DIR || "./storage");
const smtpFrom = process.env.SMTP_FROM || "AdaptSec <noreply@adaptsec.local>";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT || 1025),
  secure: false,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

async function writeLocalObject(key: string, data: Buffer | string) {
  const fullPath = path.resolve(storageDir, key);
  if (!fullPath.startsWith(storageDir)) {
    throw new Error("Invalid storage key");
  }
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, data);
}

const emailWorker = new Worker(
  "adaptsec-emails",
  async (job) => {
    const { to, subject, html, text } = job.data as {
      to: string;
      subject: string;
      html: string;
      text?: string;
    };
    logger.info({ jobId: job.id, to, subject }, "Sending queued email");
    await transporter.sendMail({ from: smtpFrom, to, subject, html, text });
  },
  { connection }
);

const campaignWorker = new Worker(
  "adaptsec-campaigns",
  async (job) => {
    const { campaignId, type } = job.data as {
      campaignId: string;
      type: "LAUNCH" | "REMINDER";
    };
    logger.info({ jobId: job.id, campaignId, type }, "Processing campaign job");

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        assignments: {
          where: { status: { not: "COMPLETED" } },
          include: { user: { select: { email: true, name: true } } },
        },
      },
    });
    if (!campaign) return;

    for (const assignment of campaign.assignments) {
      await transporter
        .sendMail({
          from: smtpFrom,
          to: assignment.user.email,
          subject:
            type === "REMINDER"
              ? `Reminder: Complete "${campaign.title}"`
              : `New Security Training Campaign: "${campaign.title}"`,
          html: `<p>Hello ${assignment.user.name},</p><p>You have an assigned security training campaign: <strong>${campaign.title}</strong>. Deadline: ${campaign.deadline.toISOString().slice(0, 10)}.</p>`,
        })
        .catch(() => {});

      await prisma.campaignAssignment.update({
        where: { id: assignment.id },
        data: { remindedAt: new Date() },
      });
    }
  },
  { connection }
);

const reportWorker = new Worker(
  "adaptsec-reports",
  async (job) => {
    const { exportId } = job.data as { exportId: string };
    logger.info({ jobId: job.id, exportId }, "Processing report export job");

    const report = await prisma.reportExport.findUnique({
      where: { id: exportId },
    });
    if (!report) return;

    try {
      await prisma.reportExport.update({
        where: { id: exportId },
        data: { status: "PROCESSING" },
      });

      const org = await prisma.organization.findUniqueOrThrow({
        where: { id: report.organizationId },
      });
      const memberships = await prisma.membership.findMany({
        where: { organizationId: report.organizationId, status: "ACTIVE" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              xp: true,
              skillMastery: { where: { organizationId: report.organizationId } },
              attempts: {
                where: { organizationId: report.organizationId },
                select: { isCorrect: true },
              },
            },
          },
        },
      });

      const rows = memberships.map((m) => {
        const masteries = m.user.skillMastery;
        const avgMastery =
          masteries.length > 0
            ? Math.round(
                masteries.reduce((acc, s) => acc + s.score, 0) / masteries.length
              )
            : 50;
        return {
          name: m.user.name,
          email: m.user.email,
          department: m.department,
          role: m.role,
          xp: m.user.xp,
          avgMastery,
          riskScore: Math.max(0, Math.min(100, 100 - avgMastery)),
          attempts: m.user.attempts.length,
        };
      });

      const ext = report.format === "PDF" ? "pdf" : "csv";
      const storageKey = `reports/${report.organizationId}/${report.id}.${ext}`;

      if (report.format === "PDF") {
        const buffer = await new Promise<Buffer>((resolve, reject) => {
          const doc = new PDFDocument({ margin: 48, size: "A4" });
          const chunks: Buffer[] = [];
          doc.on("data", (c: Buffer) => chunks.push(c));
          doc.on("end", () => resolve(Buffer.concat(chunks)));
          doc.on("error", reject);
          doc.fontSize(18).text("AdaptSec Security Awareness Report");
          doc.fontSize(11).text(`Organization: ${org.name} | ${report.reportType}`);
          doc.moveDown(1);
          for (const r of rows) {
            doc
              .fontSize(10)
              .text(
                `${r.name} (${r.department}) — Risk: ${r.riskScore}/100 | Mastery: ${r.avgMastery}% | Attempts: ${r.attempts}`
              );
          }
          doc.end();
        });
        await writeLocalObject(storageKey, buffer);
      } else {
        const csv = [
          "Name,Email,Department,Role,XP,Avg Mastery (%),Human Risk Score,Attempts",
          ...rows.map(
            (r) =>
              `"${r.name}","${r.email}","${r.department}",${r.role},${r.xp},${r.avgMastery},${r.riskScore},${r.attempts}`
          ),
        ].join("\n");
        await writeLocalObject(storageKey, csv);
      }

      await prisma.reportExport.update({
        where: { id: exportId },
        data: { status: "READY", storageKey, completedAt: new Date() },
      });
    } catch (err) {
      await prisma.reportExport.update({
        where: { id: exportId },
        data: {
          status: "FAILED",
          errorMessage: err instanceof Error ? err.message : "Export failed",
        },
      });
    }
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
