import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestPostgres, type TestDbContext } from "./helpers/test-db.js";

let dbCtx: TestDbContext;
let app: Awaited<ReturnType<typeof import("../src/app.js").buildApp>>;

describe("Milestone 6: Learner Analytics, Org Leaderboards, Badges & Certificates", () => {
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

  it("returns user analytics, org-scoped leaderboard, badges, and issues + publicly verifies certificates", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "learner@meridian.in", password: "AdaptSec@2026!" },
    });
    const cookie = loginRes.cookies.find((c) => c.name === "adaptsec_access")!.value;

    // 1. User Analytics
    const analyticsRes = await app.inject({
      method: "GET",
      url: "/api/v1/analytics/user",
      cookies: { adaptsec_access: cookie },
    });
    expect(analyticsRes.statusCode).toBe(200);
    expect(analyticsRes.json().skills.length).toBe(7);
    expect(analyticsRes.json().recentAttempts.length).toBeGreaterThan(0);

    // 2. Org-scoped leaderboard (only Meridian members, never Apex FinTech)
    const lbRes = await app.inject({
      method: "GET",
      url: "/api/v1/leaderboards?limit=50",
      cookies: { adaptsec_access: cookie },
    });
    expect(lbRes.statusCode).toBe(200);
    expect(lbRes.json().items.length).toBe(22); // 4 primary + 18 Meridian members

    // 3. Badges
    const badgesRes = await app.inject({
      method: "GET",
      url: "/api/v1/badges",
      cookies: { adaptsec_access: cookie },
    });
    expect(badgesRes.statusCode).toBe(200);
    expect(badgesRes.json().items.some((b: any) => b.slug === "first-report" && b.earned)).toBe(true);

    // 4. Verify seeded certificate publicly without auth
    const verifySeeded = await app.inject({
      method: "GET",
      url: "/api/v1/certificates/verify/ADAPT-2026-MERIDIAN-001",
    });
    expect(verifySeeded.statusCode).toBe(200);
    expect(verifySeeded.json().verified).toBe(true);
    expect(verifySeeded.json().certificate.recipientName).toBe("Aarav Sharma");

    // 5. Issue new certificate for a track with >=60% mastery
    const tracksRes = await app.inject({
      method: "GET",
      url: "/api/v1/tracks",
      cookies: { adaptsec_access: cookie },
    });
    const trackId = tracksRes.json().items[0].id;

    // Ensure learner has >=60 mastery in that track skill
    const { prisma } = await import("@adaptsec/db");
    const me = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      cookies: { adaptsec_access: cookie },
    });
    await prisma.skillMastery.updateMany({
      where: { userId: me.json().user.id },
      data: { score: 82 },
    });

    const issued = await app.inject({
      method: "POST",
      url: "/api/v1/certificates/issue",
      cookies: { adaptsec_access: cookie },
      payload: { trackId },
    });
    expect(issued.statusCode).toBe(201);
    const newCode = issued.json().certificate.certificateCode;

    // Verify newly issued certificate publicly
    const verifyNew = await app.inject({
      method: "GET",
      url: `/api/v1/certificates/verify/${newCode}`,
    });
    expect(verifyNew.statusCode).toBe(200);
    expect(verifyNew.json().verified).toBe(true);
  });
});
