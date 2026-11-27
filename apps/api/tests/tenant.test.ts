import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestPostgres, type TestDbContext } from "./helpers/test-db.js";

let dbCtx: TestDbContext;
let app: Awaited<ReturnType<typeof import("../src/app.js").buildApp>>;

describe("RBAC & Multi-Tenancy Isolation", () => {
  beforeAll(async () => {
    dbCtx = await startTestPostgres();
    const { buildApp } = await import("../src/app.js");
    app = await buildApp();
  });

  afterAll(async () => {
    await app?.close();
    const { prisma } = await import("@adaptsec/db");
    await prisma.$disconnect();
    await dbCtx?.close();
  });

  it("prevents Org A from reading/mutating Org B data and enforces LEARNER RBAC", async () => {
    // Register Org A Admin
    const regA = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "admin.a@orga.io",
        name: "Admin A",
        password: "PasswordA!2026",
        organizationName: "Org Alpha",
      },
    });
    const cookieA = regA.cookies.find((c) => c.name === "adaptsec_access")!.value;

    // Register Org B Admin
    const regB = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "admin.b@orgb.io",
        name: "Admin B",
        password: "PasswordB!2026",
        organizationName: "Org Beta",
      },
    });
    const cookieB = regB.cookies.find((c) => c.name === "adaptsec_access")!.value;

    // Org A invites a LEARNER
    const invA = await app.inject({
      method: "POST",
      url: "/api/v1/invites",
      cookies: { adaptsec_access: cookieA },
      payload: {
        email: "learner.a@orga.io",
        role: "LEARNER",
        department: "Finance",
      },
    });
    expect(invA.statusCode).toBe(201);
    const inviteTokenA = invA.json().devInviteToken;
    const inviteIdA = invA.json().invite.id;

    // Org B cannot see Org A's invites or revoke Org A's invite
    const listB = await app.inject({
      method: "GET",
      url: "/api/v1/invites",
      cookies: { adaptsec_access: cookieB },
    });
    expect(listB.statusCode).toBe(200);
    expect(listB.json().items.length).toBe(0);

    const revokeByB = await app.inject({
      method: "DELETE",
      url: `/api/v1/invites/${inviteIdA}`,
      cookies: { adaptsec_access: cookieB },
    });
    expect(revokeByB.statusCode).toBe(404);

    // Learner accepts Org A invite
    const accept = await app.inject({
      method: "POST",
      url: "/api/v1/invites/accept",
      payload: {
        token: inviteTokenA,
        name: "Learner Alpha",
        password: "LearnerPass!2026",
      },
    });
    expect(accept.statusCode).toBe(200);
    const learnerMembershipId = accept.json().membership.id;

    // Org B cannot update Org A's learner membership
    const patchByB = await app.inject({
      method: "PATCH",
      url: `/api/v1/memberships/${learnerMembershipId}`,
      cookies: { adaptsec_access: cookieB },
      payload: { role: "ORG_ADMIN" },
    });
    expect(patchByB.statusCode).toBe(404);

    // Learner logs in and is blocked from admin endpoints (403 Forbidden)
    const loginLearner = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "learner.a@orga.io", password: "LearnerPass!2026" },
    });
    expect(loginLearner.statusCode).toBe(200);
    const learnerCookie = loginLearner.cookies.find(
      (c) => c.name === "adaptsec_access"
    )!.value;

    const learnerReadMembers = await app.inject({
      method: "GET",
      url: "/api/v1/memberships",
      cookies: { adaptsec_access: learnerCookie },
    });
    expect(learnerReadMembers.statusCode).toBe(403);
  });
});
