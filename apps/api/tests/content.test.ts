import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestPostgres, type TestDbContext } from "./helpers/test-db.js";

let dbCtx: TestDbContext;
let app: Awaited<ReturnType<typeof import("../src/app.js").buildApp>>;

describe("Milestone 2: Seed Data, Content Read APIs & Tenant Isolation", () => {
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

  it("verifies seed data counts (3 orgs, 40 users, 7 tracks, 60+ scenarios, 3 months attempts)", async () => {
    const { prisma } = await import("@adaptsec/db");
    const [orgCount, userCount, trackCount, scenarioCount, attemptCount] =
      await Promise.all([
        prisma.organization.count(),
        prisma.user.count(),
        prisma.track.count(),
        prisma.scenario.count(),
        prisma.attempt.count(),
      ]);

    expect(orgCount).toBe(3);
    expect(userCount).toBe(40);
    expect(trackCount).toBe(7);
    expect(scenarioCount).toBeGreaterThanOrEqual(60);
    expect(attemptCount).toBeGreaterThanOrEqual(300);
  });

  it("lists tracks, track details, paginated/filtered scenarios, and hides answer keys from learners", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "learner@meridian.in", password: "AdaptSec@2026!" },
    });
    expect(loginRes.statusCode).toBe(200);
    const learnerCookie = loginRes.cookies.find(
      (c) => c.name === "adaptsec_access"
    )!.value;

    // 1. Tracks
    const tracksRes = await app.inject({
      method: "GET",
      url: "/api/v1/tracks",
      cookies: { adaptsec_access: learnerCookie },
    });
    expect(tracksRes.statusCode).toBe(200);
    expect(tracksRes.json().items.length).toBe(7);

    // 2. Track detail
    const trackDetail = await app.inject({
      method: "GET",
      url: "/api/v1/tracks/phishing-and-smishing",
      cookies: { adaptsec_access: learnerCookie },
    });
    expect(trackDetail.statusCode).toBe(200);
    expect(trackDetail.json().track.lessons.length).toBeGreaterThanOrEqual(2);

    // 3. Paginated & filtered scenarios
    const scenList = await app.inject({
      method: "GET",
      url: "/api/v1/scenarios?channel=UPI&page=1&limit=5",
      cookies: { adaptsec_access: learnerCookie },
    });
    expect(scenList.statusCode).toBe(200);
    expect(scenList.json().items.length).toBeLessThanOrEqual(5);
    expect(scenList.json().pagination.total).toBeGreaterThanOrEqual(10);

    // 4. Scenario detail hides correctAction & redFlagsJson from LEARNER
    const firstSlug = scenList.json().items[0].slug;
    const scenDetail = await app.inject({
      method: "GET",
      url: `/api/v1/scenarios/${firstSlug}`,
      cookies: { adaptsec_access: learnerCookie },
    });
    expect(scenDetail.statusCode).toBe(200);
    expect(scenDetail.json().scenario.correctAction).toBeUndefined();
    expect(scenDetail.json().scenario.redFlagsJson).toBeUndefined();

    // 5. LEARNER cannot create scenarios (403)
    const forbidCreate = await app.inject({
      method: "POST",
      url: "/api/v1/scenarios",
      cookies: { adaptsec_access: learnerCookie },
      payload: {
        title: "Unauthorized Scenario",
        description: "Should be blocked",
        channel: "INBOX",
        skillTag: "phishing",
        contentJson: { body: "test" },
        correctAction: "REPORT_PHISH",
        explanationSuccess: "ok",
        explanationFailure: "fail",
        whatToDoInstead: "report",
      },
    });
    expect(forbidCreate.statusCode).toBe(403);
  });

  it("scopes org-custom scenarios strictly to the owning organization", async () => {
    const adminA = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "admin@meridian.in", password: "AdaptSec@2026!" },
    });
    const cookieA = adminA.cookies.find((c) => c.name === "adaptsec_access")!.value;

    // Create custom scenario in Org 1
    const created = await app.inject({
      method: "POST",
      url: "/api/v1/scenarios",
      cookies: { adaptsec_access: cookieA },
      payload: {
        title: "Meridian Custom Warehouse Phish",
        description: "Org-specific custom scenario",
        channel: "INBOX",
        difficulty: "INTERMEDIATE",
        skillTag: "phishing",
        contentJson: { body: "Custom payload" },
        correctAction: "REPORT_PHISH",
        explanationSuccess: "Good catch",
        explanationFailure: "Missed",
        whatToDoInstead: "Report",
        isPublished: true,
      },
    });
    expect(created.statusCode).toBe(201);
    const customSlug = created.json().scenario.slug;

    // Register Org B admin and verify they cannot see Org 1's custom scenario
    const regB = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "sec@othercorp.io",
        name: "Other Admin",
        password: "OtherPassword!2026",
        organizationName: "Other Corp",
      },
    });
    const cookieB = regB.cookies.find((c) => c.name === "adaptsec_access")!.value;

    const getByB = await app.inject({
      method: "GET",
      url: `/api/v1/scenarios/${customSlug}`,
      cookies: { adaptsec_access: cookieB },
    });
    expect(getByB.statusCode).toBe(404);
  });
});
