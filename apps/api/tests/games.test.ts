import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestPostgres, type TestDbContext } from "./helpers/test-db.js";

let dbCtx: TestDbContext;
let app: Awaited<ReturnType<typeof import("../src/app.js").buildApp>>;

describe("Milestone 5: Games with Server-Validated Scoring", () => {
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

  it("validates threat-triage events and computes authoritative serverScore", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "learner@meridian.in", password: "AdaptSec@2026!" },
    });
    const cookie = loginRes.cookies.find((c) => c.name === "adaptsec_access")!.value;

    const start = await app.inject({
      method: "POST",
      url: "/api/v1/games/threat-triage/start",
      cookies: { adaptsec_access: cookie },
    });
    expect(start.statusCode).toBe(201);
    const { sessionId, items } = start.json();
    expect(items.length).toBeGreaterThanOrEqual(4);

    // Submit 2 triage events (tr-1 is SAFE, tr-2 is PHISH)
    const ev1 = await app.inject({
      method: "POST",
      url: "/api/v1/games/threat-triage/event",
      cookies: { adaptsec_access: cookie },
      payload: { sessionId, itemId: "tr-1", action: "SAFE" },
    });
    expect(ev1.statusCode).toBe(200);
    expect(ev1.json().event.isCorrect).toBe(true);

    // Duplicate event blocked
    const dup = await app.inject({
      method: "POST",
      url: "/api/v1/games/threat-triage/event",
      cookies: { adaptsec_access: cookie },
      payload: { sessionId, itemId: "tr-1", action: "SAFE" },
    });
    expect(dup.statusCode).toBe(400);

    const ev2 = await app.inject({
      method: "POST",
      url: "/api/v1/games/threat-triage/event",
      cookies: { adaptsec_access: cookie },
      payload: { sessionId, itemId: "tr-2", action: "REPORT" },
    });
    expect(ev2.statusCode).toBe(200);
    expect(ev2.json().event.isCorrect).toBe(true);

    const finish = await app.inject({
      method: "POST",
      url: "/api/v1/games/threat-triage/finish",
      cookies: { adaptsec_access: cookie },
      payload: { sessionId },
    });
    expect(finish.statusCode).toBe(200);
    expect(finish.json().serverScore).toBe(200);
    expect(finish.json().xpAwarded).toBeGreaterThan(0);
    expect(finish.json().review.length).toBe(2);
  });

  it("validates netshield wave controls and passforge metadata-only scoring", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "learner@meridian.in", password: "AdaptSec@2026!" },
    });
    const cookie = loginRes.cookies.find((c) => c.name === "adaptsec_access")!.value;

    // NetShield
    const nsStart = await app.inject({
      method: "POST",
      url: "/api/v1/games/netshield/start",
      cookies: { adaptsec_access: cookie },
    });
    expect(nsStart.statusCode).toBe(201);
    const nsSid = nsStart.json().sessionId;

    const nsWave = await app.inject({
      method: "POST",
      url: "/api/v1/games/netshield/event",
      cookies: { adaptsec_access: cookie },
      payload: {
        sessionId: nsSid,
        wave: 1,
        placements: [
          { threat: "PHISHING", control: "EMAIL_FILTER" },
          { threat: "MALWARE", control: "VPN_TLS" }, // wrong control
        ],
      },
    });
    expect(nsWave.statusCode).toBe(200);
    expect(nsWave.json().event.results[0].blocked).toBe(true);
    expect(nsWave.json().event.results[1].blocked).toBe(false);

    const nsFinish = await app.inject({
      method: "POST",
      url: "/api/v1/games/netshield/finish",
      cookies: { adaptsec_access: cookie },
      payload: { sessionId: nsSid },
    });
    expect(nsFinish.statusCode).toBe(200);
    expect(nsFinish.json().serverScore).toBe(100);

    // PassForge (metadata only)
    const pfStart = await app.inject({
      method: "POST",
      url: "/api/v1/games/passforge/start",
      cookies: { adaptsec_access: cookie },
    });
    const pfSid = pfStart.json().sessionId;

    await app.inject({
      method: "POST",
      url: "/api/v1/games/passforge/event",
      cookies: { adaptsec_access: cookie },
      payload: { sessionId: pfSid, length: 24, wordCount: 4, zxcvbnScore: 4 },
    });

    const pfFinish = await app.inject({
      method: "POST",
      url: "/api/v1/games/passforge/finish",
      cookies: { adaptsec_access: cookie },
      payload: { sessionId: pfSid },
    });
    expect(pfFinish.statusCode).toBe(200);
    expect(pfFinish.json().serverScore).toBe(400);
  });
});
