import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestPostgres, type TestDbContext } from "./helpers/test-db.js";

let dbCtx: TestDbContext;
let app: Awaited<ReturnType<typeof import("../src/app.js").buildApp>>;

describe("Milestone 3: Attempts API, Server Scoring & DB Persistence", () => {
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

  it("scores scenario attempts server-side, updates XP and SkillMastery, and persists across requests", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "learner@meridian.in", password: "AdaptSec@2026!" },
    });
    const cookie = loginRes.cookies.find((c) => c.name === "adaptsec_access")!.value;
    const initialXp = loginRes.json().user.xp;

    // Fetch a phishing scenario
    const scenRes = await app.inject({
      method: "GET",
      url: "/api/v1/scenarios/inbox-kestrel-password-expiry",
      cookies: { adaptsec_access: cookie },
    });
    expect(scenRes.statusCode).toBe(200);
    const scenarioId = scenRes.json().scenario.id;

    // 1. Submit correct REPORT_PHISH decision
    const correctAttempt = await app.inject({
      method: "POST",
      url: "/api/v1/attempts",
      cookies: { adaptsec_access: cookie },
      payload: {
        scenarioId,
        decision: "REPORT_PHISH",
        timeMs: 11200,
      },
    });
    expect(correctAttempt.statusCode).toBe(201);
    const body1 = correctAttempt.json();
    expect(body1.isCorrect).toBe(true);
    expect(body1.xpAwarded).toBe(120);
    expect(body1.redFlags.length).toBeGreaterThan(0);
    expect(body1.flagsMissed.length).toBe(0);
    expect(body1.skillMastery.skillTag).toBe("phishing");

    // Verify XP persisted in /auth/me
    const meAfter = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      cookies: { adaptsec_access: cookie },
    });
    expect(meAfter.json().user.xp).toBe(initialXp + 120);

    // 2. Submit incorrect CLICK_LINK decision -> decreases mastery & records missed flags
    const wrongAttempt = await app.inject({
      method: "POST",
      url: "/api/v1/attempts",
      cookies: { adaptsec_access: cookie },
      payload: {
        scenarioId,
        decision: "CLICK_LINK",
        timeMs: 2500,
      },
    });
    expect(wrongAttempt.statusCode).toBe(201);
    const body2 = wrongAttempt.json();
    expect(body2.isCorrect).toBe(false);
    expect(body2.flagsMissed.length).toBeGreaterThan(0);
    expect(body2.skillMastery.score).toBeLessThan(body1.skillMastery.score);

    // 3. List attempts scoped to learner
    const listRes = await app.inject({
      method: "GET",
      url: `/api/v1/attempts?scenarioId=${scenarioId}`,
      cookies: { adaptsec_access: cookie },
    });
    expect(listRes.statusCode).toBe(200);
    expect(listRes.json().items.length).toBeGreaterThanOrEqual(2);
  });

  it("enforces multi-tenant isolation on GET /api/v1/attempts", async () => {
    // Register Org B admin
    const regB = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "audit@isolatedorg.io",
        name: "Isolated Admin",
        password: "IsolatedPass!2026",
        organizationName: "Isolated Org",
      },
    });
    const cookieB = regB.cookies.find((c) => c.name === "adaptsec_access")!.value;

    const attemptsB = await app.inject({
      method: "GET",
      url: "/api/v1/attempts",
      cookies: { adaptsec_access: cookieB },
    });
    expect(attemptsB.statusCode).toBe(200);
    expect(attemptsB.json().items.length).toBe(0);
  });
});
