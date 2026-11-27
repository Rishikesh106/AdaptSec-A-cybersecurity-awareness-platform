import { describe, it, expect } from "vitest";
import {
  calculateNewMastery,
  calculateSM2NextReview,
  computeHumanRiskScore,
  getCyberRank,
  recommendNextActivity,
} from "../src/lib/adaptive";
import { UserProfile, Scenario } from "../src/lib/types";

describe("Adaptive Engine: Elo/IRT Skill Mastery Scoring", () => {
  it("should increase mastery score on correct fast decision with flags spotted", () => {
    const result = calculateNewMastery({
      currentMastery: 50,
      difficulty: "INTERMEDIATE",
      isCorrect: true,
      timeMs: 12000,
      flagsFoundCount: 3,
      totalFlagsCount: 3,
    });

    expect(result.newMastery).toBeGreaterThan(50);
    expect(result.delta).toBeGreaterThan(0);
    expect(result.flagBonus).toBe(100);
  });

  it("should penalize score on incorrect rushed response", () => {
    const result = calculateNewMastery({
      currentMastery: 60,
      difficulty: "ADVANCED",
      isCorrect: false,
      timeMs: 2500, // rushed click under 4s
      flagsFoundCount: 0,
      totalFlagsCount: 2,
    });

    expect(result.newMastery).toBeLessThan(60);
    expect(result.delta).toBeLessThan(0);
    expect(result.speedBonus).toBeLessThan(0); // impulsive penalty
  });

  it("should enforce score boundary limits [0, 100]", () => {
    const high = calculateNewMastery({
      currentMastery: 98,
      difficulty: "BEGINNER",
      isCorrect: true,
      timeMs: 15000,
      flagsFoundCount: 1,
      totalFlagsCount: 1,
    });
    expect(high.newMastery).toBeLessThanOrEqual(100);

    const low = calculateNewMastery({
      currentMastery: 5,
      difficulty: "EXPERT",
      isCorrect: false,
      timeMs: 2000,
      flagsFoundCount: 0,
      totalFlagsCount: 3,
    });
    expect(low.newMastery).toBeGreaterThanOrEqual(0);
  });
});

describe("Adaptive Engine: SuperMemo SM-2 Spaced Repetition", () => {
  it("should schedule next review interval correctly on successful recall", () => {
    // Initial repetition
    const round1 = calculateSM2NextReview(4, {
      repetition: 0,
      intervalDays: 1,
      easeFactor: 2.5,
    });
    expect(round1.newState.repetition).toBe(1);
    expect(round1.newState.intervalDays).toBe(1);

    // Second repetition
    const round2 = calculateSM2NextReview(5, round1.newState);
    expect(round2.newState.repetition).toBe(2);
    expect(round2.newState.intervalDays).toBe(3);

    // Third repetition
    const round3 = calculateSM2NextReview(5, round2.newState);
    expect(round3.newState.repetition).toBe(3);
    expect(round3.newState.intervalDays).toBe(7);
  });

  it("should reset interval to 1 day on failed recall (quality < 3)", () => {
    const failed = calculateSM2NextReview(1, {
      repetition: 4,
      intervalDays: 21,
      easeFactor: 2.6,
    });
    expect(failed.newState.repetition).toBe(0);
    expect(failed.newState.intervalDays).toBe(1);
  });
});

describe("Adaptive Engine: Human Risk Score & Cyber Rank", () => {
  it("should calculate lower risk score when skills mastery is high", () => {
    const resilientSkills = {
      phishing: 90,
      credentials: 88,
      payments: 92,
      social_eng: 85,
      browsing_wifi: 85,
      data_privacy: 90,
      incident_response: 95,
    };
    const risk = computeHumanRiskScore(resilientSkills);
    expect(risk).toBeLessThan(25); // Resilient tier
  });

  it("should escalate risk score if payment or phishing mastery is low", () => {
    const vulnerableSkills = {
      phishing: 30, // critical weakness
      credentials: 70,
      payments: 25, // critical weakness
      social_eng: 70,
      browsing_wifi: 70,
      data_privacy: 70,
      incident_response: 70,
    };
    const risk = computeHumanRiskScore(vulnerableSkills);
    expect(risk).toBeGreaterThan(50);
  });

  it("should assign appropriate cyber ranks based on XP and Risk", () => {
    const recruit = getCyberRank(200, 70);
    expect(recruit.title).toBe("Cyber Recruit");

    const hunter = getCyberRank(2600, 45);
    expect(hunter.title).toBe("Threat Hunter");

    const sentinel = getCyberRank(16000, 10);
    expect(sentinel.title).toBe("Chief Cyber Sentinel");
  });
});

describe("Adaptive Engine: Next Best Activity Recommender", () => {
  const mockUser: UserProfile = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    role: "LEARNER",
    department: "Finance",
    xp: 2000,
    level: 3,
    streakDays: 4,
    humanRiskScore: 45,
    skillsMastery: {
      phishing: 75,
      credentials: 80,
      payments: 35, // lowest skill
      social_eng: 70,
      browsing_wifi: 65,
      data_privacy: 80,
      incident_response: 60,
    },
    cyberRankTitle: "Threat Hunter",
    createdAt: "2026-01-01",
  };

  const mockScenarios: Scenario[] = [
    {
      id: "scen-phish-1",
      slug: "phish-test",
      title: "Phishing Test",
      channel: "INBOX",
      difficulty: "BEGINNER",
      skillTag: "phishing",
      description: "Test",
      scenarioContent: { body: "Test" },
      redFlags: [],
      correctAction: "REPORT_PHISH",
      explanationOnSuccess: "",
      explanationOnFailure: "",
      whatToDoInstead: "",
      isPublished: true,
      orderIndex: 1,
    },
    {
      id: "scen-pay-1",
      slug: "upi-trap-test",
      title: "UPI Trap Scenario",
      channel: "UPI",
      difficulty: "BEGINNER",
      skillTag: "payments",
      description: "UPI Test",
      scenarioContent: { body: "Test" },
      redFlags: [],
      correctAction: "REPORT_PHISH",
      explanationOnSuccess: "",
      explanationOnFailure: "",
      whatToDoInstead: "",
      isPublished: true,
      orderIndex: 2,
    },
  ];

  it("should recommend scenario targeting user's lowest skill (payments)", () => {
    const recommendation = recommendNextActivity(mockUser, mockScenarios, []);
    expect(recommendation.skillTag).toBe("payments");
    expect(recommendation.scenarioId).toBe("scen-pay-1");
  });
});
