import { describe, it, expect } from "vitest";
import {
  calculateNewMastery,
  calculateSM2NextReview,
  computeHumanRiskScore,
  recommendNextActivity,
} from "../src/lib/adaptive.js";

describe("Pure Adaptive Engine Unit Tests", () => {
  it("increases mastery on correct response with flags spotted and penalizes rushed errors", () => {
    const win = calculateNewMastery({
      currentScore: 50,
      difficulty: "INTERMEDIATE",
      isCorrect: true,
      timeMs: 12000,
      flagsFoundCount: 3,
      totalFlagsCount: 3,
    });
    expect(win.newScore).toBeGreaterThan(50);
    expect(win.delta).toBeGreaterThan(0);

    const fail = calculateNewMastery({
      currentScore: 65,
      difficulty: "ADVANCED",
      isCorrect: false,
      timeMs: 2000,
      flagsFoundCount: 0,
      totalFlagsCount: 2,
    });
    expect(fail.newScore).toBeLessThan(65);
    expect(fail.speedBonus).toBe(-3.5);
  });

  it("computes SM-2 intervals (1d -> 3d -> 7d) and resets on failure", () => {
    const r1 = calculateSM2NextReview(4, { repetition: 0, intervalDays: 1, easeFactor: 2.5 });
    expect(r1.state.repetition).toBe(1);
    expect(r1.state.intervalDays).toBe(1);

    const r2 = calculateSM2NextReview(5, r1.state);
    expect(r2.state.repetition).toBe(2);
    expect(r2.state.intervalDays).toBe(3);

    const r3 = calculateSM2NextReview(5, r2.state);
    expect(r3.state.repetition).toBe(3);
    expect(r3.state.intervalDays).toBe(7);

    const reset = calculateSM2NextReview(1, r3.state);
    expect(reset.state.repetition).toBe(0);
    expect(reset.state.intervalDays).toBe(1);
  });

  it("escalates Human Risk Score when phishing or payments mastery is low", () => {
    const safeRisk = computeHumanRiskScore({
      phishing: 90,
      credentials: 88,
      payments: 92,
      social_eng: 85,
      browsing_wifi: 85,
      data_privacy: 90,
      incident_response: 90,
    });
    expect(safeRisk).toBeLessThan(20);

    const highRisk = computeHumanRiskScore({
      phishing: 25,
      credentials: 70,
      payments: 30,
      social_eng: 70,
      browsing_wifi: 70,
      data_privacy: 70,
      incident_response: 70,
    });
    expect(highRisk).toBeGreaterThan(45);
  });

  it("recommends overdue SM-2 skill first, then lowest mastery skill", () => {
    const pastDate = new Date(Date.now() - 86400000);
    const rec = recommendNextActivity(
      [
        { skillTag: "payments", score: 25, nextReviewAt: null },
        { skillTag: "credentials", score: 60, nextReviewAt: pastDate },
      ],
      [
        { id: "s1", slug: "pay-1", title: "Pay Sim", channel: "UPI", difficulty: "BEGINNER", skillTag: "payments" },
        { id: "s2", slug: "cred-1", title: "Cred Sim", channel: "FAKE_LOGIN", difficulty: "INTERMEDIATE", skillTag: "credentials" },
      ],
      []
    );
    expect(rec.skillTag).toBe("credentials");
    expect(rec.scenarioSlug).toBe("cred-1");
  });
});
