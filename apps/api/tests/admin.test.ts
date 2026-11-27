import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestPostgres, type TestDbContext } from "./helpers/test-db.js";

let dbCtx: TestDbContext;
let app: Awaited<ReturnType<typeof import("../src/app.js").buildApp>>;

describe("Milestone 7: Org Risk Analytics, Campaigns, Reports & Scam Feed", () => {
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

  it("enforces RBAC, serves org analytics, manages campaigns, generates CSV/PDF reports, and isolates tenants", async () => {
    const learnerLogin = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "learner@meridian.in", password: "AdaptSec@2026!" },
    });
    const learnerCookie = learnerLogin.cookies.find(
      (c) => c.name === "adaptsec_access"
    )!.value;

    const adminLogin = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "admin@meridian.in", password: "AdaptSec@2026!" },
    });
    const adminCookie = adminLogin.cookies.find(
      (c) => c.name === "adaptsec_access"
    )!.value;

    // 1. RBAC: Learner blocked from admin endpoints
    const forbiddenAnalytics = await app.inject({
      method: "GET",
      url: "/api/v1/analytics/org",
      cookies: { adaptsec_access: learnerCookie },
    });
    expect(forbiddenAnalytics.statusCode).toBe(403);

    const forbiddenCampaign = await app.inject({
      method: "POST",
      url: "/api/v1/campaigns",
      cookies: { adaptsec_access: learnerCookie },
      payload: {
        title: "Unauthorized Campaign",
        description: "Should be rejected by RBAC",
        deadline: new Date(Date.now() + 86400000).toISOString(),
      },
    });
    expect(forbiddenCampaign.statusCode).toBe(403);

    // 2. Org Risk Analytics
    const orgAnalyticsRes = await app.inject({
      method: "GET",
      url: "/api/v1/analytics/org",
      cookies: { adaptsec_access: adminCookie },
    });
    expect(orgAnalyticsRes.statusCode).toBe(200);
    const analyticsBody = orgAnalyticsRes.json();
    expect(analyticsBody.overview.totalMembers).toBeGreaterThan(0);
    expect(analyticsBody.departmentRisk.length).toBeGreaterThan(0);
    expect(analyticsBody.memberRiskTable.items.length).toBeGreaterThan(0);

    // 3. Campaign Create, Remind & Learner Assignment Check
    const createCampRes = await app.inject({
      method: "POST",
      url: "/api/v1/campaigns",
      cookies: { adaptsec_access: adminCookie },
      payload: {
        title: "Q4 Phishing & UPI Readiness",
        description: "Mandatory simulation campaign for Meridian teams.",
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        launchNow: true,
      },
    });
    expect(createCampRes.statusCode).toBe(201);
    const campaignId = createCampRes.json().campaign.id as string;
    expect(
      createCampRes.json().campaign.assignments.length
    ).toBeGreaterThan(0);

    const remindRes = await app.inject({
      method: "POST",
      url: `/api/v1/campaigns/${campaignId}/remind`,
      cookies: { adaptsec_access: adminCookie },
    });
    expect(remindRes.statusCode).toBe(200);
    expect(remindRes.json().remindedCount).toBeGreaterThan(0);

    const learnerAssignRes = await app.inject({
      method: "GET",
      url: "/api/v1/campaign-assignments",
      cookies: { adaptsec_access: learnerCookie },
    });
    expect(learnerAssignRes.statusCode).toBe(200);
    expect(
      learnerAssignRes
        .json()
        .items.some((a: { campaignId: string }) => a.campaignId === campaignId)
    ).toBe(true);

    // 4. Report Exports (CSV & PDF) + Download
    const csvReq = await app.inject({
      method: "POST",
      url: "/api/v1/reports/export",
      cookies: { adaptsec_access: adminCookie },
      payload: { format: "CSV", reportType: "ORG_RISK_SUMMARY" },
    });
    expect(csvReq.statusCode).toBe(201);
    const csvExportId = csvReq.json().export.id as string;
    expect(csvReq.json().export.status).toBe("READY");

    const csvDownload = await app.inject({
      method: "GET",
      url: `/api/v1/reports/export/${csvExportId}/download`,
      cookies: { adaptsec_access: adminCookie },
    });
    expect(csvDownload.statusCode).toBe(200);
    expect(csvDownload.headers["content-type"]).toContain("text/csv");
    expect(csvDownload.body).toContain("Human Risk Score");

    const pdfReq = await app.inject({
      method: "POST",
      url: "/api/v1/reports/export",
      cookies: { adaptsec_access: adminCookie },
      payload: { format: "PDF", reportType: "ORG_RISK_SUMMARY" },
    });
    expect(pdfReq.statusCode).toBe(201);
    const pdfExportId = pdfReq.json().export.id as string;
    expect(pdfReq.json().export.status).toBe("READY");

    const pdfDownload = await app.inject({
      method: "GET",
      url: `/api/v1/reports/export/${pdfExportId}/download`,
      cookies: { adaptsec_access: adminCookie },
    });
    expect(pdfDownload.statusCode).toBe(200);
    expect(pdfDownload.headers["content-type"]).toContain("application/pdf");
    expect(pdfDownload.rawPayload.subarray(0, 4).toString()).toBe("%PDF");

    // 5. Scam of the Week CRUD + Learner Read
    const scamCreate = await app.inject({
      method: "POST",
      url: "/api/v1/scam-of-the-week",
      cookies: { adaptsec_access: adminCookie },
      payload: {
        title: "Fake KYC Update UPI Collect Scam",
        category: "UPI Fraud",
        channel: "UPI",
        threatLevel: "CRITICAL",
        summary: "Fraudsters send fake bank KYC links requesting UPI PIN approval.",
        realWorldIncident: "Observed targeting finance and college staff in Q4.",
        indicators: ["Unsolicited SMS link", "Collect request disguised as refund"],
        preventiveAdvice: "Never enter your UPI PIN to receive funds.",
      },
    });
    expect(scamCreate.statusCode).toBe(201);

    const scamRead = await app.inject({
      method: "GET",
      url: "/api/v1/scam-of-the-week?channel=UPI",
      cookies: { adaptsec_access: learnerCookie },
    });
    expect(scamRead.statusCode).toBe(200);
    expect(scamRead.json().items.length).toBeGreaterThan(0);

    // 6. Cross-Tenant Isolation for Campaigns & Report Downloads
    const otherOrgReg = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "otheradmin@isolation-test.io",
        name: "Other Org Admin",
        password: "StrongPassword@2026!",
        organizationName: "Isolation Test Org",
        department: "Security",
      },
    });
    expect(otherOrgReg.statusCode).toBe(201);
    const otherCookie = otherOrgReg.cookies.find(
      (c) => c.name === "adaptsec_access"
    )!.value;

    const crossCampRes = await app.inject({
      method: "GET",
      url: `/api/v1/campaigns/${campaignId}`,
      cookies: { adaptsec_access: otherCookie },
    });
    expect(crossCampRes.statusCode).toBe(404);

    const crossReportRes = await app.inject({
      method: "GET",
      url: `/api/v1/reports/export/${csvExportId}/download`,
      cookies: { adaptsec_access: otherCookie },
    });
    expect(crossReportRes.statusCode).toBe(404);
  });
});
