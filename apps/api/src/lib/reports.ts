import PDFDocument from "pdfkit";
import { prisma } from "@adaptsec/db";
import { storageAdapter } from "./storage.js";

function csvEscape(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function buildOrgReportData(organizationId: string) {
  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
  });

  const memberships = await prisma.membership.findMany({
    where: { organizationId, status: "ACTIVE" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          xp: true,
          streakDays: true,
          skillMastery: {
            where: { organizationId },
          },
          attempts: {
            where: { organizationId },
            select: { isCorrect: true, createdAt: true },
          },
        },
      },
    },
    orderBy: { department: "asc" },
  });

  const campaigns = await prisma.campaign.findMany({
    where: { organizationId },
    include: {
      assignments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = memberships.map((m) => {
    const masteries = m.user.skillMastery;
    const avgMastery =
      masteries.length > 0
        ? Math.round(
            masteries.reduce((acc, s) => acc + s.score, 0) / masteries.length
          )
        : 50;
    const riskScore = Math.max(0, Math.min(100, 100 - avgMastery));
    const attemptsCount = m.user.attempts.length;
    const correctCount = m.user.attempts.filter((a) => a.isCorrect).length;
    const accuracy =
      attemptsCount > 0 ? Math.round((correctCount / attemptsCount) * 100) : 0;

    return {
      name: m.user.name,
      email: m.user.email,
      department: m.department,
      role: m.role,
      xp: m.user.xp,
      avgMastery,
      riskScore,
      attemptsCount,
      accuracy,
    };
  });

  return { org, rows, campaigns };
}

function renderPdfBuffer(
  orgName: string,
  reportType: string,
  rows: Awaited<ReturnType<typeof buildOrgReportData>>["rows"],
  campaigns: Awaited<ReturnType<typeof buildOrgReportData>>["campaigns"]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fontSize(18)
      .fillColor("#0F172A")
      .text("AdaptSec Security Awareness Report", { align: "left" });
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .fillColor("#475569")
      .text(`Organization: ${orgName}  |  Report Type: ${reportType}`);
    doc.text(`Generated: ${new Date().toISOString()}`);
    doc.moveDown(1);

    const avgRisk =
      rows.length > 0
        ? Math.round(
            rows.reduce((acc, r) => acc + r.riskScore, 0) / rows.length
          )
        : 50;
    const totalAttempts = rows.reduce((acc, r) => acc + r.attemptsCount, 0);

    doc.fontSize(13).fillColor("#0F172A").text("Executive Summary");
    doc.moveDown(0.4);
    doc
      .fontSize(10)
      .fillColor("#334155")
      .text(`Active Members Evaluated: ${rows.length}`)
      .text(`Average Organization Human Risk Score: ${avgRisk}/100`)
      .text(`Total Recorded Simulation & Quiz Attempts: ${totalAttempts}`)
      .text(`Active/Historical Campaigns: ${campaigns.length}`);

    doc.moveDown(1);
    doc.fontSize(13).fillColor("#0F172A").text("Member Risk Breakdown");
    doc.moveDown(0.4);

    for (const row of rows.slice(0, 40)) {
      doc
        .fontSize(9.5)
        .fillColor("#1E293B")
        .text(
          `${row.name} (${row.department}) — Risk: ${row.riskScore}/100 | Mastery: ${row.avgMastery}% | Attempts: ${row.attemptsCount} (${row.accuracy}% accuracy)`
        );
    }

    if (campaigns.length > 0) {
      doc.moveDown(1);
      doc.fontSize(13).fillColor("#0F172A").text("Training Campaigns");
      doc.moveDown(0.4);
      for (const c of campaigns.slice(0, 15)) {
        const completed = c.assignments.filter(
          (a) => a.status === "COMPLETED"
        ).length;
        doc
          .fontSize(9.5)
          .fillColor("#1E293B")
          .text(
            `${c.title} [${c.status}] — ${completed}/${c.assignments.length} completed (Deadline: ${c.deadline.toISOString().slice(0, 10)})`
          );
      }
    }

    doc.end();
  });
}

export async function generateReportExport(exportId: string): Promise<void> {
  const report = await prisma.reportExport.findUnique({
    where: { id: exportId },
  });
  if (!report) return;

  try {
    await prisma.reportExport.update({
      where: { id: exportId },
      data: { status: "PROCESSING" },
    });

    const { org, rows, campaigns } = await buildOrgReportData(
      report.organizationId
    );
    const ext = report.format === "PDF" ? "pdf" : "csv";
    const storageKey = `reports/${report.organizationId}/${report.id}.${ext}`;

    let payload: Buffer | string;
    if (report.format === "PDF") {
      payload = await renderPdfBuffer(
        org.name,
        report.reportType,
        rows,
        campaigns
      );
    } else {
      const header = [
        "Name",
        "Email",
        "Department",
        "Role",
        "XP",
        "Avg Mastery (%)",
        "Human Risk Score",
        "Attempts",
        "Accuracy (%)",
      ].join(",");
      const lines = rows.map((r) =>
        [
          csvEscape(r.name),
          csvEscape(r.email),
          csvEscape(r.department),
          csvEscape(r.role),
          csvEscape(r.xp),
          csvEscape(r.avgMastery),
          csvEscape(r.riskScore),
          csvEscape(r.attemptsCount),
          csvEscape(r.accuracy),
        ].join(",")
      );
      payload = [header, ...lines].join("\n");
    }

    await storageAdapter.putObject(storageKey, payload);

    await prisma.reportExport.update({
      where: { id: exportId },
      data: {
        status: "READY",
        storageKey,
        completedAt: new Date(),
      },
    });
  } catch (err) {
    await prisma.reportExport.update({
      where: { id: exportId },
      data: {
        status: "FAILED",
        errorMessage:
          err instanceof Error ? err.message : "Report generation failed",
      },
    });
  }
}
