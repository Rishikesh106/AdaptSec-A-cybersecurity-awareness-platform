import type { FastifyInstance } from "fastify";
import { prisma } from "@adaptsec/db";
import { SkillTagEnum, type Difficulty } from "@adaptsec/shared";
import { requireAuth } from "../middleware/auth.js";
import {
  computeHumanRiskScore,
  recommendNextActivity,
  SKILL_WEIGHTS,
} from "../lib/adaptive.js";
import { z } from "zod";

export async function adaptiveRoutes(app: FastifyInstance) {
  // GET /api/v1/skills/mastery
  app.get(
    "/skills/mastery",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const auth = request.auth!;
      const rows = await prisma.skillMastery.findMany({
        where: {
          userId: auth.userId,
          organizationId: auth.organizationId,
        },
      });

      const now = new Date();
      const skillMap: Record<string, number> = {};
      const skills = Object.keys(SKILL_WEIGHTS).map((skillTag) => {
        const found = rows.find((r) => r.skillTag === skillTag);
        const score = found ? Math.round(found.score) : 50;
        skillMap[skillTag] = score;
        return {
          skillTag,
          score,
          attemptsCount: found?.attemptsCount ?? 0,
          correctCount: found?.correctCount ?? 0,
          nextReviewAt: found?.nextReviewAt ?? null,
          isDue: found?.nextReviewAt ? found.nextReviewAt <= now : false,
        };
      });

      const humanRiskScore = computeHumanRiskScore(skillMap);
      const dueReviewsCount = skills.filter((s) => s.isDue).length;

      return reply.send({
        humanRiskScore,
        dueReviewsCount,
        skills,
      });
    }
  );

  // GET /api/v1/recommendations/next
  app.get(
    "/recommendations/next",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const auth = request.auth!;

      const [masteries, attempts, scenarios] = await Promise.all([
        prisma.skillMastery.findMany({
          where: {
            userId: auth.userId,
            organizationId: auth.organizationId,
          },
          select: { skillTag: true, score: true, nextReviewAt: true },
        }),
        prisma.attempt.findMany({
          where: {
            userId: auth.userId,
            organizationId: auth.organizationId,
            scenarioId: { not: null },
            isCorrect: true,
          },
          select: { scenarioId: true },
        }),
        prisma.scenario.findMany({
          where: {
            isPublished: true,
            OR: [
              { organizationId: null },
              { organizationId: auth.organizationId },
            ],
          },
          select: {
            id: true,
            slug: true,
            title: true,
            channel: true,
            difficulty: true,
            skillTag: true,
          },
          orderBy: { orderIndex: "asc" },
        }),
      ]);

      const completedIds = attempts
        .map((a) => a.scenarioId)
        .filter((id): id is string => Boolean(id));

      const recommendation = recommendNextActivity(
        masteries,
        scenarios.map((s) => ({
          ...s,
          difficulty: s.difficulty as Difficulty,
        })),
        completedIds
      );

      return reply.send({ recommendation });
    }
  );

  // GET /api/v1/quiz/session — Non-repeating, spaced-repetition prioritized question set
  app.get(
    "/quiz/session",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const query = z
        .object({
          skillTag: SkillTagEnum.optional(),
          limit: z.coerce.number().int().min(1).max(25).default(8),
          mode: z.enum(["untimed", "timed"]).default("untimed"),
        })
        .parse(request.query);

      const auth = request.auth!;

      const [questions, missedAttempts, masteries] = await Promise.all([
        prisma.question.findMany({
          where: {
            isPublished: true,
            ...(query.skillTag ? { skillTag: query.skillTag } : {}),
          },
        }),
        prisma.attempt.findMany({
          where: {
            userId: auth.userId,
            organizationId: auth.organizationId,
            questionId: { not: null },
            isCorrect: false,
          },
          select: { questionId: true },
        }),
        prisma.skillMastery.findMany({
          where: {
            userId: auth.userId,
            organizationId: auth.organizationId,
          },
          select: { skillTag: true, score: true, nextReviewAt: true },
        }),
      ]);

      const missedSet = new Set(
        missedAttempts.map((a) => a.questionId).filter(Boolean)
      );
      const now = new Date();
      const dueSkills = new Set(
        masteries
          .filter((m) => m.nextReviewAt && m.nextReviewAt <= now)
          .map((m) => m.skillTag)
      );

      // Prioritize missed questions & due skills, without duplicates
      const prioritized = [...questions].sort((a, b) => {
        const aScore =
          (missedSet.has(a.id) ? 2 : 0) + (dueSkills.has(a.skillTag) ? 1 : 0);
        const bScore =
          (missedSet.has(b.id) ? 2 : 0) + (dueSkills.has(b.skillTag) ? 1 : 0);
        return bScore - aScore;
      });

      const selected = prioritized.slice(0, query.limit).map((q) => {
        const opts = Array.isArray(q.optionsJson) ? (q.optionsJson as any[]) : [];
        return {
          id: q.id,
          type: q.type,
          skillTag: q.skillTag,
          difficulty: q.difficulty,
          prompt: q.prompt,
          matchPairsJson: q.matchPairsJson,
          options: opts.map((o) => ({ id: o.id, text: o.text })),
          isSpacedReview: missedSet.has(q.id) || dueSkills.has(q.skillTag),
        };
      });

      return reply.send({
        mode: query.mode,
        timeLimitSeconds: query.mode === "timed" ? selected.length * 45 : null,
        questions: selected,
      });
    }
  );
}
