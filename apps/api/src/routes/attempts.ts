import type { FastifyInstance } from "fastify";
import { prisma } from "@adaptsec/db";
import {
  SubmitAttemptSchema,
  PaginationQuerySchema,
  type Difficulty,
} from "@adaptsec/shared";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../lib/errors.js";
import {
  calculateNewMastery,
  calculateSM2NextReview,
} from "../lib/adaptive.js";
import { z } from "zod";

export async function attemptsRoutes(app: FastifyInstance) {
  // POST /api/v1/attempts — Server-side scoring, telemetry, XP & skill mastery update
  app.post("/attempts", { preHandler: [requireAuth] }, async (request, reply) => {
    const body = SubmitAttemptSchema.parse(request.body);
    const auth = request.auth!;

    if (!body.scenarioId && !body.questionId) {
      throw new AppError(
        400,
        "TARGET_REQUIRED",
        "Either scenarioId or questionId must be provided"
      );
    }

    if (body.scenarioId) {
      const scenario = await prisma.scenario.findFirst({
        where: {
          id: body.scenarioId,
          OR: [{ organizationId: null }, { organizationId: auth.organizationId }],
        },
      });

      if (!scenario) {
        throw new AppError(404, "SCENARIO_NOT_FOUND", "Scenario not found");
      }

      const isCorrect =
        body.decision === scenario.correctAction ||
        (scenario.correctAction === "REPORT_PHISH" &&
          body.decision === "ESCALATE_SOC");

      const redFlags = Array.isArray(scenario.redFlagsJson)
        ? (scenario.redFlagsJson as Array<{ id: string; title: string; category: string; explanation: string; severity: string }>)
        : [];

      const flagsFound = isCorrect
        ? redFlags.map((f) => f.id)
        : body.flagsFound.filter((id) => redFlags.some((f) => f.id === id));
      const flagsMissed = redFlags
        .map((f) => f.id)
        .filter((id) => !flagsFound.includes(id));

      const xpAwarded = isCorrect ? 120 : 20;

      const result = await prisma.$transaction(async (tx) => {
        const existingMastery = await tx.skillMastery.findUnique({
          where: {
            userId_organizationId_skillTag: {
              userId: auth.userId,
              organizationId: auth.organizationId,
              skillTag: scenario.skillTag,
            },
          },
        });

        const currentScore = existingMastery?.score ?? 50;
        const masteryCalc = calculateNewMastery({
          currentScore,
          difficulty: scenario.difficulty as Difficulty,
          isCorrect,
          timeMs: body.timeMs,
          flagsFoundCount: flagsFound.length,
          totalFlagsCount: redFlags.length,
        });

        const quality = isCorrect
          ? body.timeMs < 18000
            ? 5
            : 4
          : 1;
        const sm2 = calculateSM2NextReview(quality, {
          repetition: existingMastery?.repetition ?? 0,
          intervalDays: existingMastery?.intervalDays ?? 1,
          easeFactor: existingMastery?.easeFactor ?? 2.5,
        });

        const updatedMastery = await tx.skillMastery.upsert({
          where: {
            userId_organizationId_skillTag: {
              userId: auth.userId,
              organizationId: auth.organizationId,
              skillTag: scenario.skillTag,
            },
          },
          update: {
            score: masteryCalc.newScore,
            attemptsCount: { increment: 1 },
            correctCount: { increment: isCorrect ? 1 : 0 },
            easeFactor: sm2.state.easeFactor,
            intervalDays: sm2.state.intervalDays,
            repetition: sm2.state.repetition,
            nextReviewAt: sm2.nextReviewAt,
            lastTestedAt: new Date(),
          },
          create: {
            userId: auth.userId,
            organizationId: auth.organizationId,
            skillTag: scenario.skillTag,
            score: masteryCalc.newScore,
            attemptsCount: 1,
            correctCount: isCorrect ? 1 : 0,
            easeFactor: sm2.state.easeFactor,
            intervalDays: sm2.state.intervalDays,
            repetition: sm2.state.repetition,
            nextReviewAt: sm2.nextReviewAt,
            lastTestedAt: new Date(),
          },
        });

        const attempt = await tx.attempt.create({
          data: {
            organizationId: auth.organizationId,
            userId: auth.userId,
            scenarioId: scenario.id,
            decision: body.decision,
            isCorrect,
            timeMs: body.timeMs,
            flagsFoundJson: flagsFound,
            flagsMissedJson: flagsMissed,
            xpAwarded,
          },
        });

        await tx.xPEvent.create({
          data: {
            organizationId: auth.organizationId,
            userId: auth.userId,
            amount: xpAwarded,
            reason: `Simulation: ${scenario.title}`,
          },
        });

        const userRecord = await tx.user.findUnique({
          where: { id: auth.userId },
          select: { lastActiveAt: true, streakDays: true },
        });
        const now = new Date();
        const lastActive = userRecord?.lastActiveAt ?? now;
        const hoursSince = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
        const nextStreak =
          hoursSince >= 20 && hoursSince <= 48
            ? (userRecord?.streakDays ?? 0) + 1
            : userRecord?.streakDays || 1;

        await tx.user.update({
          where: { id: auth.userId },
          data: {
            xp: { increment: xpAwarded },
            streakDays: nextStreak,
            lastActiveAt: now,
          },
        });

        // Award "first-report" badge if correct
        if (isCorrect) {
          const badge = await tx.badge.findUnique({
            where: { slug: "first-report" },
          });
          if (badge) {
            await tx.userBadge.upsert({
              where: {
                userId_badgeId: { userId: auth.userId, badgeId: badge.id },
              },
              update: {},
              create: { userId: auth.userId, badgeId: badge.id },
            });
          }
        }

        return { attempt, updatedMastery, masteryCalc };
      });

      return reply.status(201).send({
        attempt: result.attempt,
        isCorrect,
        correctAction: scenario.correctAction,
        explanation: isCorrect
          ? scenario.explanationSuccess
          : scenario.explanationFailure,
        whatToDoInstead: scenario.whatToDoInstead,
        redFlags,
        flagsFound,
        flagsMissed,
        xpAwarded,
        skillMastery: {
          skillTag: scenario.skillTag,
          score: result.updatedMastery.score,
          delta: result.masteryCalc.delta,
          nextReviewAt: result.updatedMastery.nextReviewAt,
        },
      });
    }

    // Question attempt scoring (used in M4 Quiz Engine)
    const question = await prisma.question.findUnique({
      where: { id: body.questionId! },
    });
    if (!question) {
      throw new AppError(404, "QUESTION_NOT_FOUND", "Question not found");
    }

    const options = Array.isArray(question.optionsJson)
      ? (question.optionsJson as Array<{ id: string; text: string; isCorrect: boolean }>)
      : [];
    const correctIds = options.filter((o) => o.isCorrect).map((o) => o.id).sort();
    const submittedIds = (
      body.selectedOptionIds?.length ? body.selectedOptionIds : [body.decision]
    )
      .slice()
      .sort();

    const isCorrect =
      correctIds.length === submittedIds.length &&
      correctIds.every((id, i) => id === submittedIds[i]);

    const xpAwarded = isCorrect ? 60 : 10;

    const result = await prisma.$transaction(async (tx) => {
      const existingMastery = await tx.skillMastery.findUnique({
        where: {
          userId_organizationId_skillTag: {
            userId: auth.userId,
            organizationId: auth.organizationId,
            skillTag: question.skillTag,
          },
        },
      });

      const masteryCalc = calculateNewMastery({
        currentScore: existingMastery?.score ?? 50,
        difficulty: question.difficulty as Difficulty,
        isCorrect,
        timeMs: body.timeMs,
        flagsFoundCount: isCorrect ? 1 : 0,
        totalFlagsCount: 1,
      });

      const sm2 = calculateSM2NextReview(isCorrect ? 4 : 1, {
        repetition: existingMastery?.repetition ?? 0,
        intervalDays: existingMastery?.intervalDays ?? 1,
        easeFactor: existingMastery?.easeFactor ?? 2.5,
      });

      const updatedMastery = await tx.skillMastery.upsert({
        where: {
          userId_organizationId_skillTag: {
            userId: auth.userId,
            organizationId: auth.organizationId,
            skillTag: question.skillTag,
          },
        },
        update: {
          score: masteryCalc.newScore,
          attemptsCount: { increment: 1 },
          correctCount: { increment: isCorrect ? 1 : 0 },
          easeFactor: sm2.state.easeFactor,
          intervalDays: sm2.state.intervalDays,
          repetition: sm2.state.repetition,
          nextReviewAt: sm2.nextReviewAt,
          lastTestedAt: new Date(),
        },
        create: {
          userId: auth.userId,
          organizationId: auth.organizationId,
          skillTag: question.skillTag,
          score: masteryCalc.newScore,
          attemptsCount: 1,
          correctCount: isCorrect ? 1 : 0,
          easeFactor: sm2.state.easeFactor,
          intervalDays: sm2.state.intervalDays,
          repetition: sm2.state.repetition,
          nextReviewAt: sm2.nextReviewAt,
          lastTestedAt: new Date(),
        },
      });

      const attempt = await tx.attempt.create({
        data: {
          organizationId: auth.organizationId,
          userId: auth.userId,
          questionId: question.id,
          decision: submittedIds.join(","),
          isCorrect,
          timeMs: body.timeMs,
          xpAwarded,
        },
      });

      await tx.user.update({
        where: { id: auth.userId },
        data: { xp: { increment: xpAwarded }, lastActiveAt: new Date() },
      });

      return { attempt, updatedMastery, masteryCalc };
    });

    return reply.status(201).send({
      attempt: result.attempt,
      isCorrect,
      correctOptionIds: correctIds,
      explanation: question.explanation,
      xpAwarded,
      skillMastery: {
        skillTag: question.skillTag,
        score: result.updatedMastery.score,
        delta: result.masteryCalc.delta,
        nextReviewAt: result.updatedMastery.nextReviewAt,
      },
    });
  });

  // GET /api/v1/attempts (paginated, tenant-scoped)
  app.get("/attempts", { preHandler: [requireAuth] }, async (request, reply) => {
    const query = PaginationQuerySchema.extend({
      scenarioId: z.string().optional(),
      isCorrect: z.enum(["true", "false"]).optional(),
    }).parse(request.query);

    const auth = request.auth!;
    const isAdmin = auth.role === "ORG_ADMIN" || auth.role === "SUPER_ADMIN";

    const where: any = {
      organizationId: auth.organizationId,
    };
    if (!isAdmin) {
      where.userId = auth.userId;
    }
    if (query.scenarioId) where.scenarioId = query.scenarioId;
    if (query.isCorrect !== undefined) {
      where.isCorrect = query.isCorrect === "true";
    }

    const [total, items] = await Promise.all([
      prisma.attempt.count({ where }),
      prisma.attempt.findMany({
        where,
        include: {
          scenario: {
            select: { id: true, slug: true, title: true, channel: true, skillTag: true },
          },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);

    return reply.send({
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  });
}
