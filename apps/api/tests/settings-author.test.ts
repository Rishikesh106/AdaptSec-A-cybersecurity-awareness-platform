import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestPostgres, type TestDbContext } from "./helpers/test-db.js";

let dbCtx: TestDbContext;
let app: Awaited<ReturnType<typeof import("../src/app.js").buildApp>>;

describe("Milestone 8: Settings, Data Export/Deletion & Content Authoring", () => {
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

  it("manages profile/org settings, exports personal data, deletes account, and supports scenario import/export", async () => {
    const adminLogin = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "admin@meridian.in", password: "AdaptSec@2026!" },
    });
    const adminCookie = adminLogin.cookies.find(
      (c) => c.name === "adaptsec_access"
    )!.value;

    const authorLogin = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "author@meridian.in", password: "AdaptSec@2026!" },
    });
    const authorCookie = authorLogin.cookies.find(
      (c) => c.name === "adaptsec_access"
    )!.value;

    // 1. Settings Read & Org Settings Update (Admin)
    const getSettings = await app.inject({
      method: "GET",
      url: "/api/v1/settings",
      cookies: { adaptsec_access: adminCookie },
    });
    expect(getSettings.statusCode).toBe(200);
    expect(getSettings.json().organization).not.toBeNull();

    const patchOrg = await app.inject({
      method: "PATCH",
      url: "/api/v1/settings/org",
      cookies: { adaptsec_access: adminCookie },
      payload: {
        settingsJson: { passThreshold: 80, mfaEnforcementPolicy: "REQUIRED" },
      },
    });
    expect(patchOrg.statusCode).toBe(200);
    expect(patchOrg.json().organization.settingsJson.passThreshold).toBe(80);

    // 2. Author Question Create & Scenario Export/Import
    const createQ = await app.inject({
      method: "POST",
      url: "/api/v1/questions",
      cookies: { adaptsec_access: authorCookie },
      payload: {
        type: "MCQ",
        skillTag: "phishing",
        difficulty: "INTERMEDIATE",
        prompt: "What is the safest way to verify an urgent CFO wire transfer email?",
        optionsJson: [
          { id: "a", text: "Call the CFO via known internal extension", isCorrect: true },
          { id: "b", text: "Reply directly to the email", isCorrect: false },
        ],
        explanation: "Out-of-band verification prevents BEC fraud.",
      },
    });
    expect(createQ.statusCode).toBe(201);

    const exportScenarios = await app.inject({
      method: "GET",
      url: "/api/v1/scenarios/export",
      cookies: { adaptsec_access: authorCookie },
    });
    expect(exportScenarios.statusCode).toBe(200);
    const exported = JSON.parse(exportScenarios.body);
    expect(exported.scenarios.length).toBeGreaterThan(0);

    const importScenarios = await app.inject({
      method: "POST",
      url: "/api/v1/scenarios/import",
      cookies: { adaptsec_access: authorCookie },
      payload: {
        scenarios: [
          {
            title: "Imported BEC Wire Lure",
            description: "Imported scenario for finance team verification.",
            channel: "INBOX",
            difficulty: "INTERMEDIATE",
            skillTag: "social_eng",
            contentJson: { subject: "Urgent Invoice", body: "Please wire today." },
            redFlagsJson: [{ id: "urgency", label: "Artificial urgency" }],
            correctAction: "REPORT_PHISH",
            explanationSuccess: "Well spotted.",
            explanationFailure: "Verify wire requests out-of-band.",
            whatToDoInstead: "Confirm via finance portal.",
            isPublished: true,
          },
        ],
      },
    });
    expect(importScenarios.statusCode).toBe(201);
    expect(importScenarios.json().importedCount).toBe(1);

    // 3. Register a fresh user, update profile, export personal data, and delete account
    const reg = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "deleteme@adaptsec-test.io",
        name: "Temp User",
        password: "StrongPassword@2026!",
        organizationName: "Temp Delete Org",
        department: "QA",
      },
    });
    expect(reg.statusCode).toBe(201);
    const tempCookie = reg.cookies.find((c) => c.name === "adaptsec_access")!.value;

    const patchProfile = await app.inject({
      method: "PATCH",
      url: "/api/v1/settings/profile",
      cookies: { adaptsec_access: tempCookie },
      payload: {
        name: "Temp User Updated",
        notificationPrefs: { weeklyDigest: false },
      },
    });
    expect(patchProfile.statusCode).toBe(200);
    expect(patchProfile.json().profile.name).toBe("Temp User Updated");

    const dataExport = await app.inject({
      method: "GET",
      url: "/api/v1/settings/data-export",
      cookies: { adaptsec_access: tempCookie },
    });
    expect(dataExport.statusCode).toBe(200);
    expect(JSON.parse(dataExport.body).user.email).toBe("deleteme@adaptsec-test.io");

    const delAcc = await app.inject({
      method: "DELETE",
      url: "/api/v1/settings/account",
      cookies: { adaptsec_access: tempCookie },
      payload: { confirmEmail: "deleteme@adaptsec-test.io" },
    });
    expect(delAcc.statusCode).toBe(200);
    expect(delAcc.json().deleted).toBe(true);
  });
});
