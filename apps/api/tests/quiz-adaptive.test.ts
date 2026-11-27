import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestPostgres, type TestDbContext } from "./helpers/test-db.js";

let dbCtx: TestDbContext;
let app: Awaited<ReturnType<typeof import("../src/app.js").buildApp>>;

describe("Milestone 4: Quiz Engine & Adaptive Recommendations API", () => {
  beforeAll(async () => {
    dbCtx = await startTestPostgres();
    const { prisma } = await import("@adaptsec/db");
    const { runSeed } = await import("../../../packages/db/prisma/seed.js");
    await runSeed(prisma);

    const { buildApp } = await import("../src/app.js");
    app = await buildApp();
  });

  afterAll(async () => {
    await app?.close();
    const { prisma } = await import("@adaptsec/db");
    await prisma.$disconnect();
    await dbCtx?.close();
  });

  it("returns skill mastery, adaptive recommendation, non-repeating quiz session, and scores question attempts", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "learner@meridian.in", password: "AdaptSec@2026!" },
    });
    const cookie = loginRes.cookies.find((c) => c.name === "adaptsec_access")!.value;

    // 1. Skills Mastery
    const masteryRes = await app.inject({
      method: "GET",
      url: "/api/v1/skills/mastery",
      cookies: { adaptsec_access: cookie },
    });
    expect(masteryRes.statusCode).toBe(200);
    expect(masteryRes.json().skills.length).toBe(7);
    expect(typeof masteryRes.json().humanRiskScore).toBe("number");

    // 2. Next Best Recommendation
    const recRes = await app.inject({
      method: "GET",
      url: "/api/v1/recommendations/next",
      cookies: { adaptsec_access: cookie },
    });
    expect(recRes.statusCode).toBe(200);
    expect(recRes.json().recommendation.title).toBeDefined();

    // 3. Quiz Session (strips isCorrect, no duplicates)
    const quizRes = await app.inject({
      method: "GET",
      url: "/api/v1/quiz/session?mode=timed&limit=6",
      cookies: { adaptsec_access: cookie },
    });
    expect(quizRes.statusCode).toBe(200);
    const questions = quizRes.json().questions;
    expect(questions.length).toBe(6);
    expect(quizRes.json().timeLimitSeconds).toBe(6 * 45);
    expect(questions[0].options[0].isCorrect).toBeUndefined();
    const uniqueIds = new Set(questions.map((q: any) => q.id));
    expect(uniqueIds.size).toBe(6);

    // 4. Submit Quiz Question Attempt
    const firstQ = questions[0];
    const qAttempt = await app.inject({
      method: "POST",
      url: "/api/v1/attempts",
      cookies: { adaptsec_access: cookie },
      payload: {
        questionId: firstQ.id,
        decision: firstQ.options[0].id,
        selectedOptionIds: [firstQ.options[0].id],
        timeMs: 8500,
      },
    });
    expect(qAttempt.statusCode).toBe(201);
    expect(typeof qAttempt.json().isCorrect).toBe("boolean");
    expect(qAttempt.json().explanation).toBeDefined();
    expect(qAttempt.json().skillMastery.nextReviewAt).toBeDefined();
  });
});
