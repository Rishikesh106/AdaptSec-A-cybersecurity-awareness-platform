import { FastifyInstance } from "fastify";
import { prisma } from "@adaptsec/db";
import {
  CreateCampaignSchema,
  CreateScamOfTheWeekSchema,
  PaginationQuerySchema,
  RequestReportExportSchema,
  SkillTagEnum,
  UpdateScamOfTheWeekSchema,
} from "@adaptsec/shared";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { AppError } from "../lib/errors.js";
import { recordAuditLog } from "../lib/audit.js";
import {
  enqueueCampaignJob,
  enqueueEmailJob,
  enqueueReportExportJob,
} from "../lib/queue.js";
import { storageAdapter } from "../lib/storage.js";

const SKILL_TAGS = SkillTagEnum.options;

export async function adminRoutes(app: FastifyInstance) {
  // 1. Organization Risk Analytics Dashboard
  app.get(
    "/analytics/org",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN", "CONTENT_AUTHOR")] },
    async (request, reply) => {
      const orgId = request.auth!.organizationId;
      const query = PaginationQuerySchema.parse(request.query);
      const qRaw = request.query as { department?: string };

      const memberships = await prisma.membership.findMany({
        where: { organizationId: orgId, status: "ACTIVE" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              xp: true,
              streakDays: true,
              lastActiveAt: true,
              skillMastery: { where: { organizationId: orgId } },
            },
          },
        },
      });

      const attempts = await prisma.attempt.findMany({
        where: { organizationId: orgId },
        select: {
          userId: true,
          isCorrect: true,
          flagsMissedJson: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      });

      const campaigns = await prisma.campaign.findMany({
        where: { organizationId: orgId },
        include: { assignments: { select: { status: true } } },
      });

      const attemptsByUser = new Map<
        string,
        { total: number; correct: number }
      >();
      for (const a of attempts) {
        const entry = attemptsByUser.get(a.userId) ?? { total: 0, correct: 0 };
        entry.total += 1;
        if (a.isCorrect) entry.correct += 1;
        attemptsByUser.set(a.userId, entry);
      }

      const memberRows = memberships.map((m) => {
        const masteries = m.user.skillMastery;
        const avgMastery =
          masteries.length > 0
            ? Math.round(
                masteries.reduce((s, x) => s + x.score, 0) / masteries.length
              )
            : 50;
        const riskScore = Math.max(0, Math.min(100, 100 - avgMastery));
        const stats = attemptsByUser.get(m.user.id) ?? { total: 0, correct: 0 };
        const accuracy =
          stats.total > 0
            ? Math.round((stats.correct / stats.total) * 100)
            : 0;

        return {
          userId: m.user.id,
          name: m.user.name,
          email: m.user.email,
          department: m.department,
          role: m.role,
          xp: m.user.xp,
          streakDays: m.user.streakDays,
          avgMastery,
          riskScore,
          attemptsCount: stats.total,
          accuracy,
          lastActiveAt: m.user.lastActiveAt,
          masteriesBySkill: Object.fromEntries(
            SKILL_TAGS.map((tag) => {
              const found = masteries.find((x) => x.skillTag === tag);
              return [tag, found ? Math.round(found.score) : 50];
            })
          ),
        };
      });

      // Department aggregation & skill heatmap
      const deptMap = new Map<string, typeof memberRows>();
      for (const row of memberRows) {
        const list = deptMap.get(row.department) ?? [];
        list.push(row);
        deptMap.set(row.department, list);
      }

      const departmentRisk = Array.from(deptMap.entries()).map(
        ([department, list]) => {
          const avgMastery = Math.round(
            list.reduce((s, r) => s + r.avgMastery, 0) / list.length
          );
          const totalAttempts = list.reduce((s, r) => s + r.attemptsCount, 0);
          const weightedAcc =
            list.reduce((s, r) => s + r.accuracy * r.attemptsCount, 0) /
            Math.max(1, totalAttempts);

          const skills: Record<string, number> = {};
          for (const tag of SKILL_TAGS) {
            skills[tag] = Math.round(
              list.reduce((s, r) => s + (r.masteriesBySkill[tag] ?? 50), 0) /
                list.length
            );
          }

          return {
            department,
            memberCount: list.length,
            avgMastery,
            riskScore: Math.max(0, Math.min(100, 100 - avgMastery)),
            attemptsCount: totalAttempts,
            accuracy: Math.round(weightedAcc),
            skills,
          };
        }
      );

      // Daily trends over last 30 days
      const dayBuckets = new Map<
        string,
        { total: number; correct: number }
      >();
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      for (const a of attempts) {
        if (a.createdAt < cutoff) continue;
        const day = a.createdAt.toISOString().slice(0, 10);
        const bucket = dayBuckets.get(day) ?? { total: 0, correct: 0 };
        bucket.total += 1;
        if (a.isCorrect) bucket.correct += 1;
        dayBuckets.set(day, bucket);
      }
      const trends = Array.from(dayBuckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, b]) => {
          const accuracy = Math.round((b.correct / b.total) * 100);
          return {
            date,
            attempts: b.total,
            accuracy,
            riskScore: Math.max(0, 100 - accuracy),
          };
        });

      // Top missed red flags
      const flagCounts = new Map<string, number>();
      for (const a of attempts) {
        const missed = Array.isArray(a.flagsMissedJson)
          ? (a.flagsMissedJson as string[])
          : [];
        for (const f of missed) {
          flagCounts.set(f, (flagCounts.get(f) ?? 0) + 1);
        }
      }
      const topMissedRedFlags = Array.from(flagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([flag, count]) => ({ flag, count }));

      // Campaign completion rate
      const allAssignments = campaigns.flatMap((c) => c.assignments);
      const completedAssignments = allAssignments.filter(
        (a) => a.status === "COMPLETED"
      ).length;
      const campaignCompletionRate =
        allAssignments.length > 0
          ? Math.round((completedAssignments / allAssignments.length) * 100)
          : 0;

      const avgMastery =
        memberRows.length > 0
          ? Math.round(
              memberRows.reduce((s, r) => s + r.avgMastery, 0) /
                memberRows.length
            )
          : 50;
      const totalCorrect = attempts.filter((a) => a.isCorrect).length;

      // Filter & paginate memberRiskTable
      let filtered = memberRows;
      if (qRaw.department && qRaw.department !== "ALL") {
        filtered = filtered.filter((r) => r.department === qRaw.department);
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.name.toLowerCase().includes(s) ||
            r.email.toLowerCase().includes(s) ||
            r.department.toLowerCase().includes(s)
        );
      }
      filtered.sort((a, b) => b.riskScore - a.riskScore);
      const start = (query.page - 1) * query.limit;
      const paginatedMembers = filtered.slice(start, start + query.limit);

      return reply.send({
        overview: {
          totalMembers: memberRows.length,
          activeLearners: memberRows.filter((r) => r.attemptsCount > 0).length,
          avgMastery,
          avgRiskScore: Math.max(0, Math.min(100, 100 - avgMastery)),
          totalAttempts: attempts.length,
          overallAccuracy:
            attempts.length > 0
              ? Math.round((totalCorrect / attempts.length) * 100)
              : 0,
          campaignCompletionRate,
        },
        departmentRisk,
        trends,
        topMissedRedFlags,
        memberRiskTable: {
          items: paginatedMembers,
          total: filtered.length,
          page: query.page,
          limit: query.limit,
        },
      });
    }
  );

  // 2. Campaigns CRUD & Reminders
  app.get(
    "/campaigns",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const orgId = request.auth!.organizationId;
      const query = PaginationQuerySchema.parse(request.query);
      const qRaw = request.query as { status?: string };

      const where: Record<string, unknown> = { organizationId: orgId };
      if (qRaw.status && qRaw.status !== "ALL") {
        where.status = qRaw.status;
      }
      if (query.search) {
        where.title = { contains: query.search, mode: "insensitive" };
      }

      const [items, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
          include: {
            assignments: {
              select: { id: true, status: true, score: true, completedAt: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        prisma.campaign.count({ where }),
      ]);

      return reply.send({
        items: items.map((c) => {
          const totalAssigned = c.assignments.length;
          const completed = c.assignments.filter(
            (a) => a.status === "COMPLETED"
          ).length;
          const inProgress = c.assignments.filter(
            (a) => a.status === "IN_PROGRESS"
          ).length;
          const overdue = c.assignments.filter(
            (a) => a.status === "OVERDUE"
          ).length;
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            trackId: c.trackId,
            scenarioIds: c.scenarioIds,
            scheduledAt: c.scheduledAt,
            deadline: c.deadline,
            status: c.status,
            createdAt: c.createdAt,
            stats: {
              totalAssigned,
              completed,
              inProgress,
              overdue,
              completionRate:
                totalAssigned > 0
                  ? Math.round((completed / totalAssigned) * 100)
                  : 0,
            },
          };
        }),
        total,
        page: query.page,
        limit: query.limit,
      });
    }
  );

  app.post(
    "/campaigns",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const orgId = request.auth!.organizationId;
      const body = CreateCampaignSchema.parse(request.body);

      const memberWhere: Record<string, unknown> = {
        organizationId: orgId,
        status: "ACTIVE",
      };
      if (body.targetDepartments && body.targetDepartments.length > 0) {
        memberWhere.department = { in: body.targetDepartments };
      }
      if (body.userIds && body.userIds.length > 0) {
        memberWhere.userId = { in: body.userIds };
      }

      const targetMembers = await prisma.membership.findMany({
        where: memberWhere,
        include: { user: { select: { id: true, email: true, name: true } } },
      });

      const status = body.launchNow
        ? "ACTIVE"
        : body.scheduledAt
          ? "SCHEDULED"
          : "DRAFT";

      const campaign = await prisma.campaign.create({
        data: {
          organizationId: orgId,
          title: body.title,
          description: body.description,
          trackId: body.trackId ?? null,
          scenarioIds: body.scenarioIds,
          scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
          deadline: new Date(body.deadline),
          status,
          createdById: request.auth!.userId,
          assignments: {
            create: targetMembers.map((m) => ({
              userId: m.user.id,
              status: "ASSIGNED",
            })),
          },
        },
        include: { assignments: true },
      });

      await recordAuditLog({
        organizationId: orgId,
        actorId: request.auth!.userId,
        action: "CAMPAIGN_CREATED",
        targetType: "Campaign",
        targetId: campaign.id,
        metadata: {
          title: campaign.title,
          status: campaign.status,
          assignedCount: campaign.assignments.length,
        },
        ipAddress: request.ip,
      });

      if (status === "ACTIVE") {
        await enqueueCampaignJob({
          campaignId: campaign.id,
          organizationId: orgId,
          type: "LAUNCH",
        });
        for (const m of targetMembers) {
          await enqueueEmailJob({
            to: m.user.email,
            subject: `New Security Training Campaign: ${campaign.title}`,
            html: `<p>Hello ${m.user.name},</p><p>You have been assigned <strong>${campaign.title}</strong>. Complete before ${campaign.deadline.toISOString().slice(0, 10)}.</p>`,
          });
        }
      }

      return reply.status(201).send({ campaign });
    }
  );

  app.get(
    "/campaigns/:id",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const orgId = request.auth!.organizationId;
      const { id } = request.params as { id: string };

      const campaign = await prisma.campaign.findFirst({
        where: { id, organizationId: orgId },
        include: {
          assignments: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
      if (!campaign) {
        throw new AppError(404, "NOT_FOUND", "Campaign not found");
      }

      return reply.send({ campaign });
    }
  );

  app.post(
    "/campaigns/:id/remind",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const orgId = request.auth!.organizationId;
      const { id } = request.params as { id: string };

      const campaign = await prisma.campaign.findFirst({
        where: { id, organizationId: orgId },
        include: {
          assignments: {
            where: { status: { not: "COMPLETED" } },
            include: { user: { select: { email: true, name: true } } },
          },
        },
      });
      if (!campaign) {
        throw new AppError(404, "NOT_FOUND", "Campaign not found");
      }

      const now = new Date();
      for (const a of campaign.assignments) {
        await prisma.campaignAssignment.update({
          where: { id: a.id },
          data: { remindedAt: now },
        });
        await enqueueEmailJob({
          to: a.user.email,
          subject: `Reminder: Complete "${campaign.title}"`,
          html: `<p>Hello ${a.user.name},</p><p>Please complete your assigned campaign <strong>${campaign.title}</strong> before ${campaign.deadline.toISOString().slice(0, 10)}.</p>`,
        });
      }

      await enqueueCampaignJob({
        campaignId: campaign.id,
        organizationId: orgId,
        type: "REMINDER",
      });

      await recordAuditLog({
        organizationId: orgId,
        actorId: request.auth!.userId,
        action: "CAMPAIGN_REMINDER_SENT",
        targetType: "Campaign",
        targetId: campaign.id,
        metadata: { remindedCount: campaign.assignments.length },
        ipAddress: request.ip,
      });

      return reply.send({
        remindedCount: campaign.assignments.length,
        remindedAt: now,
      });
    }
  );

  // Learner-scoped campaign assignments
  app.get(
    "/campaign-assignments",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { userId, organizationId } = request.auth!;
      const assignments = await prisma.campaignAssignment.findMany({
        where: {
          userId,
          campaign: { organizationId },
        },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              description: true,
              trackId: true,
              deadline: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return reply.send({ items: assignments });
    }
  );

  // 3. Report Exports (CSV & PDF)
  app.get(
    "/reports/export",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const orgId = request.auth!.organizationId;
      const items = await prisma.reportExport.findMany({
        where: { organizationId: orgId },
        include: {
          requestedBy: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
      return reply.send({ items });
    }
  );

  app.post(
    "/reports/export",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const orgId = request.auth!.organizationId;
      const body = RequestReportExportSchema.parse(request.body);

      const exportJob = await prisma.reportExport.create({
        data: {
          organizationId: orgId,
          requestedById: request.auth!.userId,
          format: body.format,
          reportType: body.reportType,
          status: "PENDING",
        },
      });

      await enqueueReportExportJob(exportJob.id);

      const refreshed = await prisma.reportExport.findUnique({
        where: { id: exportJob.id },
      });

      await recordAuditLog({
        organizationId: orgId,
        actorId: request.auth!.userId,
        action: "REPORT_EXPORT_REQUESTED",
        targetType: "ReportExport",
        targetId: exportJob.id,
        metadata: { format: body.format, reportType: body.reportType },
        ipAddress: request.ip,
      });

      return reply.status(201).send({ export: refreshed ?? exportJob });
    }
  );

  app.get(
    "/reports/export/:id/download",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const orgId = request.auth!.organizationId;
      const { id } = request.params as { id: string };

      const report = await prisma.reportExport.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!report) {
        throw new AppError(404, "NOT_FOUND", "Report export not found");
      }
      if (report.status !== "READY" || !report.storageKey) {
        throw new AppError(
          409,
          "REPORT_NOT_READY",
          "Report is still processing or failed"
        );
      }

      const fileBuffer = await storageAdapter.getObject(report.storageKey);
      const ext = report.format === "PDF" ? "pdf" : "csv";
      const contentType =
        report.format === "PDF" ? "application/pdf" : "text/csv; charset=utf-8";

      return reply
        .header("Content-Type", contentType)
        .header(
          "Content-Disposition",
          `attachment; filename="adaptsec-report-${report.id}.${ext}"`
        )
        .send(fileBuffer);
    }
  );

  // 4. Audit Logs (Org-Scoped)
  app.get(
    "/audit-logs",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN")] },
    async (request, reply) => {
      const orgId = request.auth!.organizationId;
      const query = PaginationQuerySchema.parse(request.query);

      const [items, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: { organizationId: orgId },
          include: {
            actor: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        prisma.auditLog.count({ where: { organizationId: orgId } }),
      ]);

      return reply.send({ items, total, page: query.page, limit: query.limit });
    }
  );

  // 5. Scam of the Week (Learner read + Admin/Author curate)
  app.get(
    "/scam-of-the-week",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const query = PaginationQuerySchema.parse(request.query);
      const qRaw = request.query as { channel?: string; threatLevel?: string };

      const where: Record<string, unknown> = {};
      if (qRaw.channel && qRaw.channel !== "ALL") {
        where.channel = qRaw.channel;
      }
      if (qRaw.threatLevel && qRaw.threatLevel !== "ALL") {
        where.threatLevel = qRaw.threatLevel;
      }
      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: "insensitive" } },
          { summary: { contains: query.search, mode: "insensitive" } },
        ];
      }

      const [items, total] = await Promise.all([
        prisma.scamOfTheWeek.findMany({
          where,
          orderBy: { publishedAt: "desc" },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        prisma.scamOfTheWeek.count({ where }),
      ]);

      return reply.send({ items, total, page: query.page, limit: query.limit });
    }
  );

  app.post(
    "/scam-of-the-week",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN", "CONTENT_AUTHOR")] },
    async (request, reply) => {
      const body = CreateScamOfTheWeekSchema.parse(request.body);
      const entry = await prisma.scamOfTheWeek.create({
        data: {
          title: body.title,
          category: body.category,
          channel: body.channel,
          threatLevel: body.threatLevel,
          summary: body.summary,
          realWorldIncident: body.realWorldIncident,
          indicatorsJson: body.indicators,
          preventiveAdvice: body.preventiveAdvice,
          scenarioId: body.scenarioId ?? null,
        },
      });

      await recordAuditLog({
        organizationId: request.auth!.organizationId,
        actorId: request.auth!.userId,
        action: "SCAM_BULLETIN_PUBLISHED",
        targetType: "ScamOfTheWeek",
        targetId: entry.id,
        metadata: { title: entry.title, threatLevel: entry.threatLevel },
        ipAddress: request.ip,
      });

      return reply.status(201).send({ item: entry });
    }
  );

  app.patch(
    "/scam-of-the-week/:id",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN", "CONTENT_AUTHOR")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = UpdateScamOfTheWeekSchema.parse(request.body);
      const existing = await prisma.scamOfTheWeek.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError(404, "NOT_FOUND", "Scam bulletin not found");
      }

      const updated = await prisma.scamOfTheWeek.update({
        where: { id },
        data: {
          title: body.title,
          category: body.category,
          channel: body.channel,
          threatLevel: body.threatLevel,
          summary: body.summary,
          realWorldIncident: body.realWorldIncident,
          indicatorsJson: body.indicators,
          preventiveAdvice: body.preventiveAdvice,
          scenarioId: body.scenarioId,
        },
      });

      return reply.send({ item: updated });
    }
  );

  app.delete(
    "/scam-of-the-week/:id",
    { preHandler: [requireAuth, requireRole("ORG_ADMIN", "CONTENT_AUTHOR")] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.scamOfTheWeek.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError(404, "NOT_FOUND", "Scam bulletin not found");
      }
      await prisma.scamOfTheWeek.delete({ where: { id } });
      return reply.send({ deleted: true });
    }
  );
}
