import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { prisma } from "@adaptsec/db";
import { PaginationQuerySchema } from "@adaptsec/shared";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../lib/errors.js";
import { computeHumanRiskScore, SKILL_WEIGHTS } from "../lib/adaptive.js";
import { recordAuditLog } from "../lib/audit.js";
import { z } from "zod";

export async function recognitionRoutes(app: FastifyInstance) {
  // GET /api/v1/analytics/user
  app.get(
    "/analytics/user",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const auth = request.auth!;

      const [user, masteries, recentAttempts, badgesCount, certsCount] =
        await Promise.all([
          prisma.user.findUnique({
            where: { id: auth.userId },
            select: { xp: true, streakDays: true, lastActiveAt: true },
          }),
          prisma.skillMastery.findMany({
            where: {
              userId: auth.userId,
              organizationId: auth.organizationId,
            },
          }),
          prisma.attempt.findMany({
            where: {
              userId: auth.userId,
              organizationId: auth.organizationId,
            },
            include: {
              scenario: { select: { title: true, channel: true, slug: true } },
              question: { select: { prompt: true, skillTag: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          }),
          prisma.userBadge.count({ where: { userId: auth.userId } }),
          prisma.certificate.count({
            where: {
              userId: auth.userId,
              organizationId: auth.organizationId,
            },
          }),
        ]);

      const skillMap: Record<string, number> = {};
      for (const s of Object.keys(SKILL_WEIGHTS)) {
        const found = masteries.find((m) => m.skillTag === s);
        skillMap[s] = found ? Math.round(found.score) : 50;
      }

      const humanRiskScore = computeHumanRiskScore(skillMap);
      const totalAttempts = recentAttempts.length;
      const correctCount = recentAttempts.filter((a) => a.isCorrect).length;

      return reply.send({
        xp: user?.xp ?? 0,
        streakDays: user?.streakDays ?? 0,
        humanRiskScore,
        badgesCount,
        certificatesCount: certsCount,
        recentAccuracy:
          totalAttempts > 0
            ? Math.round((correctCount / totalAttempts) * 100)
            : 0,
        skills: Object.entries(skillMap).map(([skillTag, score]) => ({
          skillTag,
          score,
        })),
        recentAttempts: recentAttempts.map((a) => ({
          id: a.id,
          title:
            a.scenario?.title ??
            a.question?.prompt.slice(0, 60) ??
            "Knowledge Check",
          channel: a.scenario?.channel ?? "QUIZ",
          decision: a.decision,
          isCorrect: a.isCorrect,
          timeMs: a.timeMs,
          xpAwarded: a.xpAwarded,
          createdAt: a.createdAt,
        })),
      });
    }
  );

  // GET /api/v1/leaderboards (org-scoped weekly leaderboard)
  app.get(
    "/leaderboards",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const query = PaginationQuerySchema.parse(request.query);
      const orgId = request.auth!.organizationId;
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const memberships = await prisma.membership.findMany({
        where: { organizationId: orgId, status: "ACTIVE" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              xp: true,
              streakDays: true,
              _count: { select: { userBadges: true } },
            },
          },
        },
      });

      const weeklyEvents = await prisma.xPEvent.groupBy({
        by: ["userId"],
        where: {
          organizationId: orgId,
          createdAt: { gte: weekAgo },
        },
        _sum: { amount: true },
      });

      const weeklyMap = new Map(
        weeklyEvents.map((e) => [e.userId, e._sum.amount ?? 0])
      );

      const ranked = memberships
        .map((m) => ({
          userId: m.user.id,
          name: m.user.name,
          department: m.department,
          weeklyXp: weeklyMap.get(m.user.id) ?? 0,
          totalXp: m.user.xp,
          streakDays: m.user.streakDays,
          badgesCount: m.user._count.userBadges,
          isCurrentUser: m.user.id === request.auth!.userId,
        }))
        .sort((a, b) => b.weeklyXp - a.weeklyXp || b.totalXp - a.totalXp)
        .map((row, idx) => ({ rank: idx + 1, ...row }));

      const total = ranked.length;
      const items = ranked.slice(
        (query.page - 1) * query.limit,
        query.page * query.limit
      );

      return reply.send({
        items,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      });
    }
  );

  // GET /api/v1/badges
  app.get("/badges", { preHandler: [requireAuth] }, async (request, reply) => {
    const [badges, earned] = await Promise.all([
      prisma.badge.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.userBadge.findMany({
        where: { userId: request.auth!.userId },
      }),
    ]);

    const earnedMap = new Map(earned.map((e) => [e.badgeId, e.awardedAt]));

    return reply.send({
      items: badges.map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        description: b.description,
        tier: b.tier,
        earned: earnedMap.has(b.id),
        awardedAt: earnedMap.get(b.id) ?? null,
      })),
    });
  });

  // GET /api/v1/certificates (org-scoped for current user)
  app.get(
    "/certificates",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const auth = request.auth!;
      const items = await prisma.certificate.findMany({
        where: {
          userId: auth.userId,
          organizationId: auth.organizationId,
        },
        include: {
          track: { select: { id: true, slug: true, title: true } },
          organization: { select: { name: true } },
        },
        orderBy: { issuedAt: "desc" },
      });

      return reply.send({ items });
    }
  );

  // POST /api/v1/certificates/issue
  app.post(
    "/certificates/issue",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { trackId } = z
        .object({ trackId: z.string().min(1) })
        .parse(request.body);
      const auth = request.auth!;

      const track = await prisma.track.findUnique({ where: { id: trackId } });
      if (!track) {
        throw new AppError(404, "TRACK_NOT_FOUND", "Learning track not found");
      }

      const mastery = await prisma.skillMastery.findUnique({
        where: {
          userId_organizationId_skillTag: {
            userId: auth.userId,
            organizationId: auth.organizationId,
            skillTag: track.skillTag,
          },
        },
      });

      const score = Math.round(mastery?.score ?? 50);
      if (score < 60) {
        throw new AppError(
          400,
          "MASTERY_TOO_LOW",
          `Minimum 60% mastery in ${track.skillTag} required to issue certificate (current: ${score}%)`
        );
      }

      const code = `ADAPT-${new Date().getFullYear()}-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;

      const cert = await prisma.certificate.create({
        data: {
          organizationId: auth.organizationId,
          userId: auth.userId,
          trackId: track.id,
          certificateCode: code,
          score,
        },
        include: {
          track: { select: { title: true, slug: true } },
          organization: { select: { name: true } },
        },
      });

      await recordAuditLog({
        organizationId: auth.organizationId,
        actorId: auth.userId,
        action: "CERTIFICATE_ISSUED",
        targetType: "Certificate",
        targetId: cert.id,
        metadata: { certificateCode: code, trackId: track.id },
        ipAddress: request.ip,
      });

      return reply.status(201).send({ certificate: cert });
    }
  );

  // GET /api/v1/certificates/verify/:code (Public verification endpoint)
  app.get("/certificates/verify/:code", async (request, reply) => {
    const { code } = z.object({ code: z.string().min(4) }).parse(request.params);

    const cert = await prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: {
        user: { select: { name: true } },
        organization: { select: { name: true } },
        track: { select: { title: true, skillTag: true } },
      },
    });

    if (!cert) {
      throw new AppError(
        404,
        "CERTIFICATE_NOT_FOUND",
        "Certificate code could not be verified"
      );
    }

    return reply.send({
      verified: true,
      certificate: {
        certificateCode: cert.certificateCode,
        recipientName: cert.user.name,
        organizationName: cert.organization.name,
        trackTitle: cert.track.title,
        skillTag: cert.track.skillTag,
        score: cert.score,
        issuedAt: cert.issuedAt,
      },
    });
  });
}
