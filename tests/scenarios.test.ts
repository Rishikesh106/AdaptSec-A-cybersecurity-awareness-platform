import { describe, it, expect } from "vitest";
import { ALL_SEED_SCENARIOS } from "../src/data/seedScenarios";
import { SEED_TRACKS } from "../src/data/seedTracks";
import { SEED_QUESTIONS } from "../src/data/seedQuestions";

describe("Scenario Catalog & Data Integrity", () => {
  it("should have at least 60 scenarios as mandated by enterprise specs", () => {
    expect(ALL_SEED_SCENARIOS.length).toBeGreaterThanOrEqual(60);
  });

  it("should cover all 5 required attack simulation channels", () => {
    const channels = new Set(ALL_SEED_SCENARIOS.map((s) => s.channel));
    expect(channels.has("INBOX")).toBe(true);
    expect(channels.has("SMS")).toBe(true);
    expect(channels.has("WHATSAPP")).toBe(true);
    expect(channels.has("UPI")).toBe(true);
    expect(channels.has("VOICE_CALL")).toBe(true);
    expect(channels.has("FAKE_LOGIN")).toBe(true);
  });

  it("should ensure every scenario has valid actions, explanations, and slug identifiers", () => {
    const validActions = [
      "REPORT_PHISH",
      "IGNORE_SAFE",
      "CLICK_LINK",
      "ENTER_CREDENTIALS",
      "APPROVE_PAYMENT",
      "COMPLY_REQUEST",
      "ESCALATE_SOC",
    ];

    const slugs = new Set<string>();

    ALL_SEED_SCENARIOS.forEach((scenario) => {
      expect(scenario.id).toBeDefined();
      expect(scenario.title.length).toBeGreaterThan(5);
      expect(scenario.slug).toBeDefined();
      expect(slugs.has(scenario.slug)).toBe(false); // uniqueness
      slugs.add(scenario.slug);

      expect(validActions).toContain(scenario.correctAction);
      expect(scenario.explanationOnSuccess.length).toBeGreaterThan(10);
      expect(scenario.explanationOnFailure.length).toBeGreaterThan(10);
      expect(scenario.whatToDoInstead.length).toBeGreaterThan(10);
    });
  });

  it("should ensure all attack scenarios have properly categorized red flags", () => {
    const attackScenarios = ALL_SEED_SCENARIOS.filter(
      (s) => s.correctAction === "REPORT_PHISH" || s.correctAction === "ESCALATE_SOC"
    );

    attackScenarios.forEach((s) => {
      expect(s.redFlags.length).toBeGreaterThan(0);
      s.redFlags.forEach((rf) => {
        expect(rf.id).toBeDefined();
        expect(rf.title.length).toBeGreaterThan(2);
        expect(rf.explanation.length).toBeGreaterThan(10);
        expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(rf.severity);
      });
    });
  });

  it("should verify 7 complete learning tracks and curriculum lessons", () => {
    expect(SEED_TRACKS.length).toBe(7);
  });
});
