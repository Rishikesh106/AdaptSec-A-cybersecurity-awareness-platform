import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestPostgres, type TestDbContext } from "./helpers/test-db.js";

let dbCtx: TestDbContext;
let app: Awaited<ReturnType<typeof import("../src/app.js").buildApp>>;

describe("API Health, Docs & Auth Flow", () => {
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

  it("GET /health and /ready return 200", async () => {
    const h = await app.inject({ method: "GET", url: "/health" });
    expect(h.statusCode).toBe(200);
    expect(h.json().status).toBe("ok");

    const r = await app.inject({ method: "GET", url: "/ready" });
    expect(r.statusCode).toBe(200);
    expect(r.json().database).toBe("connected");
  });

  it("GET /api/docs serves OpenAPI Swagger UI", async () => {
    const res = await app.inject({ method: "GET", url: "/api/docs/json" });
    expect(res.statusCode).toBe(200);
    expect(res.json().info.title).toBe("AdaptSec Enterprise API");
  });

  it("registers, verifies email, logs in, lists/revokes sessions, resets password, and enforces lockout", async () => {
    // 1. Register
    const reg = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "priya.nair@meridian.in",
        name: "Priya Nair",
        password: "StrongPassword!2026",
        organizationName: "Meridian Logistics",
        department: "Security",
      },
    });
    expect(reg.statusCode).toBe(201);
    const regBody = reg.json();
    expect(regBody.user.email).toBe("priya.nair@meridian.in");
    expect(regBody.user.activeRole).toBe("ORG_ADMIN");
    const accessCookie = reg.cookies.find((c) => c.name === "adaptsec_access");
    expect(accessCookie).toBeDefined();

    // 2. Verify email
    const verify = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify-email",
      payload: { token: regBody.devVerificationToken },
    });
    expect(verify.statusCode).toBe(200);
    expect(verify.json().verified).toBe(true);

    // 3. /me
    const me = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      cookies: { adaptsec_access: accessCookie!.value },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().user.emailVerified).toBe(true);

    // 4. Login with wrong password 5 times -> lockout (423)
    for (let i = 0; i < 5; i++) {
      const fail = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: { email: "priya.nair@meridian.in", password: "WrongPassword123" },
      });
      expect(fail.statusCode).toBe(401);
    }

    const locked = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "priya.nair@meridian.in", password: "StrongPassword!2026" },
    });
    expect(locked.statusCode).toBe(423);

    // 5. Forgot + reset password clears lockout
    const forgot = await app.inject({
      method: "POST",
      url: "/api/v1/auth/forgot-password",
      payload: { email: "priya.nair@meridian.in" },
    });
    expect(forgot.statusCode).toBe(200);

    const reset = await app.inject({
      method: "POST",
      url: "/api/v1/auth/reset-password",
      payload: {
        token: forgot.json().devResetToken,
        password: "NewStrongPassword!2026",
      },
    });
    expect(reset.statusCode).toBe(200);

    // 6. Login succeeds with new password
    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "priya.nair@meridian.in", password: "NewStrongPassword!2026" },
    });
    expect(login.statusCode).toBe(200);
    const newAccess = login.cookies.find((c) => c.name === "adaptsec_access")!.value;

    // 7. Sessions list
    const sessions = await app.inject({
      method: "GET",
      url: "/api/v1/auth/sessions",
      cookies: { adaptsec_access: newAccess },
    });
    expect(sessions.statusCode).toBe(200);
    expect(sessions.json().sessions.length).toBe(1);

    // 8. Logout
    const logout = await app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      cookies: { adaptsec_access: newAccess },
    });
    expect(logout.statusCode).toBe(200);

    const afterLogout = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      cookies: { adaptsec_access: newAccess },
    });
    expect(afterLogout.statusCode).toBe(401);
  });
});
