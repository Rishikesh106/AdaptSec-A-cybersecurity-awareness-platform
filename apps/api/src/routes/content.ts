import type { FastifyInstance } from "fastify";
import { prisma } from "@adaptsec/db";
import {
  PaginationQuerySchema,
  ChannelEnum,
  DifficultyEnum,
  SkillTagEnum,
} from "@adaptsec/shared";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { AppError } from "../lib/errors.js";
import { recordAuditLog } from "../lib/audit.js";
import { z } from "zod";

const CreateScenarioSchema = z.object({
  title: z.string().min(4).max(160),
  slug: z.string().min(3).max(160).optional(),
  description: z.string().min(5).max(500),
  trackId: z.string().optional().nullable(),
  channel: ChannelEnum,
  difficulty: DifficultyEnum.default("BEGINNER"),
  skillTag: SkillTagEnum,
  contentJson: z.record(z.unknown()),
  redFlagsJson: z.array(z.record(z.unknown())).default([]),
  correctAction: z.string().min(2),
  explanationSuccess: z.string().min(5),
  explanationFailure: z.string().min(5),
  whatToDoInstead: z.string().min(5),
  isPublished: z.boolean().default(false),
});

const UpdateScenarioSchema = CreateScenarioSchema.partial();

export async function contentRoutes(app: FastifyInstance) {
  // GET /api/v1/tracks
  app.get("/tracks", { preHandler: [requireAuth] }, async (request, reply) => {
    const query = PaginationQuerySchema.parse(request.query);
    const isAuthor =
      request.auth!.role === "CONTENT_AUTHOR" ||
      request.auth!.role === "ORG_ADMIN" ||
      request.auth!.role === "SUPER_ADMIN";

    const where: any = {};
    if (!isAuthor) where.isPublished = true;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [total, tracks] = await Promise.all([
      prisma.track.count({ where }),
      prisma.track.findMany({
        where,
        include: {
          _count: {
            select: {
              lessons: true,
              scenarios: true,
            },
          },
        },
        orderBy: { orderIndex: "asc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);

    return reply.send({
      items: tracks.map((t) => ({
        id: t.id,
        slug: t.slug,
        title: t.title,
        description: t.description,
        skillTag: t.skillTag,
        orderIndex: t.orderIndex,
        estimatedMinutes: t.estimatedMinutes,
        isPublished: t.isPublished,
        lessonsCount: t._count.lessons,
        scenariosCount: t._count.scenarios,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  });

  // GET /api/v1/tracks/:slug
  app.get(
    "/tracks/:slug",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { slug } = z.object({ slug: z.string() }).parse(request.params);
      const orgId = request.auth!.organizationId;

      const track = await prisma.track.findUnique({
        where: { slug },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { orderIndex: "asc" },
          },
          scenarios: {
            where: {
              isPublished: true,
              OR: [{ organizationId: null }, { organizationId: orgId }],
            },
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              channel: true,
              difficulty: true,
              skillTag: true,
            },
          },
        },
      });

      if (!track) {
        throw new AppError(404, "TRACK_NOT_FOUND", "Learning track not found");
      }

      return reply.send({ track });
    }
  );

  // GET /api/v1/lessons/:id
  app.get(
    "/lessons/:id",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const lesson = await prisma.lesson.findFirst({
        where: { OR: [{ id }, { slug: id }] },
        include: {
          track: { select: { id: true, slug: true, title: true, skillTag: true } },
        },
      });
      if (!lesson) {
        throw new AppError(404, "LESSON_NOT_FOUND", "Lesson not found");
      }
      return reply.send({ lesson });
    }
  );

  // GET /api/v1/scenarios (paginated, filterable, sortable, tenant-scoped)
  app.get(
    "/scenarios",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const query = PaginationQuerySchema.extend({
        channel: ChannelEnum.optional(),
        difficulty: DifficultyEnum.optional(),
        skillTag: SkillTagEnum.optional(),
        isPublished: z
          .enum(["true", "false"])
          .optional(),
      }).parse(request.query);

      const auth = request.auth!;
      const isAuthor =
        auth.role === "CONTENT_AUTHOR" ||
        auth.role === "ORG_ADMIN" ||
        auth.role === "SUPER_ADMIN";

      const where: any = {
        OR: [{ organizationId: null }, { organizationId: auth.organizationId }],
      };

      if (!isAuthor) {
        where.isPublished = true;
      } else if (query.isPublished !== undefined) {
        where.isPublished = query.isPublished === "true";
      }

      if (query.channel) where.channel = query.channel;
      if (query.difficulty) where.difficulty = query.difficulty;
      if (query.skillTag) where.skillTag = query.skillTag;

      if (query.search) {
        where.AND = [
          {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
            ],
          },
        ];
      }

      const sortField =
        query.sortBy === "difficulty" ||
        query.sortBy === "channel" ||
        query.sortBy === "title" ||
        query.sortBy === "orderIndex"
          ? query.sortBy
          : "orderIndex";

      const [total, items] = await Promise.all([
        prisma.scenario.count({ where }),
        prisma.scenario.findMany({
          where,
          orderBy: { [sortField]: query.sortOrder === "desc" && !query.sortBy ? "asc" : query.sortOrder },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          select: {
            id: true,
            organizationId: true,
            trackId: true,
            slug: true,
            title: true,
            description: true,
            channel: true,
            difficulty: true,
            skillTag: true,
            isPublished: true,
            orderIndex: true,
            createdAt: true,
            redFlagsJson: true,
          },
        }),
      ]);

      return reply.send({
        items: items.map((s) => ({
          id: s.id,
          organizationId: s.organizationId,
          trackId: s.trackId,
          slug: s.slug,
          title: s.title,
          description: s.description,
          channel: s.channel,
          difficulty: s.difficulty,
          skillTag: s.skillTag,
          isPublished: s.isPublished,
          orderIndex: s.orderIndex,
          redFlagsCount: Array.isArray(s.redFlagsJson) ? s.redFlagsJson.length : 0,
        })),
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      });
    }
  );

  // GET /api/v1/scenarios/:idOrSlug
  app.get(
    "/scenarios/:idOrSlug",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { idOrSlug } = z
        .object({ idOrSlug: z.string() })
        .parse(request.params);
      const auth = request.auth!;
      const isAuthor =
        auth.role === "CONTENT_AUTHOR" ||
        auth.role === "ORG_ADMIN" ||
        auth.role === "SUPER_ADMIN";

      const scenario = await prisma.scenario.findFirst({
        where: {
          AND: [
            { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
            { OR: [{ organizationId: null }, { organizationId: auth.organizationId }] },
          ],
        },
      });

      if (!scenario || (!scenario.isPublished && !isAuthor)) {
        throw new AppError(404, "SCENARIO_NOT_FOUND", "Simulation scenario not found");
      }

      return reply.send({
        scenario: {
          id: scenario.id,
          organizationId: scenario.organizationId,
          trackId: scenario.trackId,
          slug: scenario.slug,
          title: scenario.title,
          description: scenario.description,
          channel: scenario.channel,
          difficulty: scenario.difficulty,
          skillTag: scenario.skillTag,
          contentJson: scenario.contentJson,
          isPublished: scenario.isPublished,
          ...(isAuthor
            ? {
                redFlagsJson: scenario.redFlagsJson,
                correctAction: scenario.correctAction,
                explanationSuccess: scenario.explanationSuccess,
                explanationFailure: scenario.explanationFailure,
                whatToDoInstead: scenario.whatToDoInstead,
              }
            : {}),
        },
      });
    }
  );

  // POST /api/v1/scenarios (Author / Org Admin)
  app.post(
    "/scenarios",
    { preHandler: [requireAuth, requireRole("CONTENT_AUTHOR", "ORG_ADMIN")] },
    async (request, reply) => {
      const body = CreateScenarioSchema.parse(request.body);
      const auth = request.auth!;

      const slug =
        body.slug ||
        `${body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;

      const created = await prisma.scenario.create({
        data: {
          organizationId: auth.role === "SUPER_ADMIN" ? null : auth.organizationId,
          trackId: body.trackId ?? null,
          slug,
          title: body.title,
          description: body.description,
          channel: body.channel,
          difficulty: body.difficulty,
          skillTag: body.skillTag,
          contentJson: body.contentJson as object,
          redFlagsJson: body.redFlagsJson as object,
          correctAction: body.correctAction,
          explanationSuccess: body.explanationSuccess,
          explanationFailure: body.explanationFailure,
          whatToDoInstead: body.whatToDoInstead,
          isPublished: body.isPublished,
        },
      });

      await recordAuditLog({
        organizationId: auth.organizationId,
        actorId: auth.userId,
        action: "SCENARIO_CREATED",
        targetType: "Scenario",
        targetId: created.id,
        ipAddress: request.ip,
      });

      return reply.status(201).send({ scenario: created });
    }
  );

  // PATCH /api/v1/scenarios/:id (tenant-scoped)
  app.patch(
    "/scenarios/:id",
    { preHandler: [requireAuth, requireRole("CONTENT_AUTHOR", "ORG_ADMIN")] },
    async (request, reply) => {
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const body = UpdateScenarioSchema.parse(request.body);
      const auth = request.auth!;

      const existing = await prisma.scenario.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError(404, "SCENARIO_NOT_FOUND", "Scenario not found");
      }
      if (
        existing.organizationId &&
        existing.organizationId !== auth.organizationId &&
        auth.role !== "SUPER_ADMIN"
      ) {
        throw new AppError(404, "SCENARIO_NOT_FOUND", "Scenario not found");
      }
      if (!existing.organizationId && auth.role !== "SUPER_ADMIN") {
        throw new AppError(403, "FORBIDDEN", "Only Super Admins can modify global library scenarios");
      }

      const updated = await prisma.scenario.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          channel: body.channel,
          difficulty: body.difficulty,
          skillTag: body.skillTag,
          contentJson: body.contentJson as object | undefined,
          redFlagsJson: body.redFlagsJson as object | undefined,
          correctAction: body.correctAction,
          explanationSuccess: body.explanationSuccess,
          explanationFailure: body.explanationFailure,
          whatToDoInstead: body.whatToDoInstead,
          isPublished: body.isPublished,
        },
      });

      await recordAuditLog({
        organizationId: auth.organizationId,
        actorId: auth.userId,
        action: "SCENARIO_UPDATED",
        targetType: "Scenario",
        targetId: id,
        ipAddress: request.ip,
      });

      return reply.send({ scenario: updated });
    }
  );

  // DELETE /api/v1/scenarios/:id (tenant-scoped)
  app.delete(
    "/scenarios/:id",
    { preHandler: [requireAuth, requireRole("CONTENT_AUTHOR", "ORG_ADMIN")] },
    async (request, reply) => {
      const { id } = z.object({ id: z.string() }).parse(request.params);
      const auth = request.auth!;

      const existing = await prisma.scenario.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError(404, "SCENARIO_NOT_FOUND", "Scenario not found");
      }
      if (
        existing.organizationId &&
        existing.organizationId !== auth.organizationId &&
        auth.role !== "SUPER_ADMIN"
      ) {
        throw new AppError(404, "SCENARIO_NOT_FOUND", "Scenario not found");
      }
      if (!existing.organizationId && auth.role !== "SUPER_ADMIN") {
        throw new AppError(403, "FORBIDDEN", "Only Super Admins can delete global library scenarios");
      }

      await prisma.scenario.delete({ where: { id } });
      return reply.send({ deleted: true });
    }
  );

  // GET /api/v1/questions (paginated, filterable; hides answer keys from learners)
  app.get(
    "/questions",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const query = PaginationQuerySchema.extend({
        skillTag: SkillTagEnum.optional(),
        difficulty: DifficultyEnum.optional(),
      }).parse(request.query);

      const isAuthor =
        request.auth!.role === "CONTENT_AUTHOR" ||
        request.auth!.role === "ORG_ADMIN" ||
        request.auth!.role === "SUPER_ADMIN";

      const where: any = {};
      if (!isAuthor) where.isPublished = true;
      if (query.skillTag) where.skillTag = query.skillTag;
      if (query.difficulty) where.difficulty = query.difficulty;
      if (query.search) {
        where.prompt = { contains: query.search, mode: "insensitive" };
      }

      const [total, items] = await Promise.all([
        prisma.question.count({ where }),
        prisma.question.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { createdAt: query.sortOrder },
        }),
      ]);

      return reply.send({
        items: items.map((q) => {
          const opts = Array.isArray(q.optionsJson) ? (q.optionsJson as any[]) : [];
          return {
            id: q.id,
            type: q.type,
            skillTag: q.skillTag,
            difficulty: q.difficulty,
            prompt: q.prompt,
            matchPairsJson: q.matchPairsJson,
            options: isAuthor
              ? opts
              : opts.map((o) => ({ id: o.id, text: o.text })),
            ...(isAuthor ? { explanation: q.explanation, isPublished: q.isPublished } : {}),
          };
        }),
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      });
    }
  );
}
