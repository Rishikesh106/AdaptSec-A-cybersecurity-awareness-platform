/**
 * AdaptSec Adaptive Engine
 * 
 * Provides:
 * 1. Elo / IRT-style Per-Skill Mastery Rating (0 - 100 scale)
 * 2. SM-2 Spaced Repetition Scheduling for Missed Attack Indicators
 * 3. Human Risk Score (0 = lowest risk / resilient, 100 = extreme risk)
 * 4. Next Best Learning Activity Recommender
 */

import { Difficulty, Scenario, UserProfile } from "./types";
import { ALL_SKILL_IDS } from "./skills";

// Difficulty weight mapping for IRT/Elo calculations
export const DIFFICULTY_FACTORS: Record<Difficulty, number> = {
  BEGINNER: 1.0,
  INTERMEDIATE: 1.5,
  ADVANCED: 2.2,
  EXPERT: 3.0,
};

// Expected baseline response times (in ms) per channel/difficulty
export const TARGET_DECISION_TIME_MS: Record<Difficulty, number> = {
  BEGINNER: 18000,
  INTERMEDIATE: 22000,
  ADVANCED: 28000,
  EXPERT: 35000,
};

export interface MasteryUpdateParams {
  currentMastery: number; // 0 to 100
  difficulty: Difficulty;
  isCorrect: boolean;
  timeMs: number;
  flagsFoundCount: number;
  totalFlagsCount: number;
}

export interface MasteryUpdateResult {
  newMastery: number;
  delta: number;
  speedBonus: number;
  flagBonus: number;
}

/**
 * Calculates updated skill mastery score (0-100) using Elo/IRT sensitivity
 */
export function calculateNewMastery({
  currentMastery,
  difficulty,
  isCorrect,
  timeMs,
  flagsFoundCount,
  totalFlagsCount,
}: MasteryUpdateParams): MasteryUpdateResult {
  const diffFactor = DIFFICULTY_FACTORS[difficulty] || 1.5;
  const targetTime = TARGET_DECISION_TIME_MS[difficulty] || 20000;

  // Expected probability of success based on current mastery (Logistic IRT model)
  // Logistic curve centered around mastery level corresponding to difficulty
  const difficultyThreshold = (diffFactor - 1.0) * 30 + 35; // 35 for beginner, 50 for int, 71 for adv, 95 for exp
  const expectedProb = 1 / (1 + Math.exp(-(currentMastery - difficultyThreshold) / 15));

  // Dynamic K-factor: higher impact for learners with fewer data points or intermediate ranges
  const baseK = 14 * diffFactor;

  // Flag identification completeness ratio (0.0 to 1.0)
  const flagRatio = totalFlagsCount > 0 ? flagsFoundCount / totalFlagsCount : (isCorrect ? 1.0 : 0.0);

  // Time factor: quick correct responses earn a small bonus, quick incorrect responses penalize for impulsiveness
  const timeRatio = Math.max(0.4, Math.min(2.5, timeMs / targetTime));
  let speedAdjustment = 0;
  if (isCorrect) {
    // If correct and took time to examine (not instantaneous blind guess)
    if (timeMs > 3000 && timeRatio <= 1.2) {
      speedAdjustment = 2.0; // vigilant & swift
    } else if (timeMs <= 3000) {
      speedAdjustment = 0.5; // suspicious quick click
    }
  } else {
    // If wrong and rushed under 4 seconds, extra penalty for impulsivity
    if (timeMs < 4000) {
      speedAdjustment = -3.5;
    }
  }

  // Outcome score: 1.0 = fully correct + all flags, 0 = failed
  let actualOutcome = isCorrect ? 0.7 + (flagRatio * 0.3) : (flagRatio * 0.2);

  // Primary Elo delta
  let delta = baseK * (actualOutcome - expectedProb) + speedAdjustment;

  // Cap max change per single scenario to keep progression stable
  delta = Math.max(-18, Math.min(18, delta));

  const newMastery = Math.max(0, Math.min(100, Math.round(currentMastery + delta)));

  return {
    newMastery,
    delta: Math.round(delta * 10) / 10,
    speedBonus: speedAdjustment,
    flagBonus: Math.round(flagRatio * 100),
  };
}

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm for Missed Red Flags & Concepts
 * Quality scale (0 to 5):
 * 5 - Perfect response, spotted all red flags quickly
 * 4 - Correct response after hesitation, spotted key flags
 * 3 - Correct response with difficulty, missed minor flags
 * 2 - Incorrect response, but identified some flags
 * 1 - Incorrect response, missed all flags
 * 0 - Complete failure / clicked malicious payload
 */
export interface SM2State {
  repetition: number;
  intervalDays: number;
  easeFactor: number;
}

export function calculateSM2NextReview(
  quality: number, // 0 to 5
  previousState: SM2State = { repetition: 0, intervalDays: 1, easeFactor: 2.5 }
): { nextReviewDate: Date; newState: SM2State } {
  let { repetition, intervalDays, easeFactor } = previousState;
  const q = Math.max(0, Math.min(5, quality));

  if (q >= 3) {
    if (repetition === 0) {
      intervalDays = 1;
    } else if (repetition === 1) {
      intervalDays = 3;
    } else if (repetition === 2) {
      intervalDays = 7;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    intervalDays = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return {
    nextReviewDate,
    newState: {
      repetition,
      intervalDays,
      easeFactor: Math.round(easeFactor * 100) / 100,
    },
  };
}

/**
 * Computes Human Risk Score (0 to 100)
 * 0-25: Resilient / Cyber Guardian
 * 26-50: Low-to-Moderate Risk
 * 51-75: Elevated Risk
 * 76-100: Critical Vulnerability
 */
export function computeHumanRiskScore(skillsMastery: Record<string, number>): number {
  const skillWeights: Record<string, number> = {
    phishing: 0.22,
    credentials: 0.18,
    payments: 0.20,
    social_eng: 0.15,
    browsing_wifi: 0.10,
    data_privacy: 0.08,
    incident_response: 0.07,
  };

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const skillId of ALL_SKILL_IDS) {
    const score = skillsMastery[skillId] ?? 50; // default initial baseline
    const weight = skillWeights[skillId] || 0.1;
    totalWeightedScore += score * weight;
    totalWeight += weight;
  }

  const averageMastery = totalWeight > 0 ? totalWeightedScore / totalWeight : 50;
  
  // Risk score is inversely proportional to mastery: 100 - mastery
  // Non-linear escalation for critical weaknesses under 40
  let rawRisk = 100 - averageMastery;
  
  const paymentScore = skillsMastery["payments"] ?? 50;
  const phishingScore = skillsMastery["phishing"] ?? 50;
  if (paymentScore < 45 || phishingScore < 45) {
    rawRisk = Math.min(100, rawRisk * 1.15);
  }

  return Math.max(0, Math.min(100, Math.round(rawRisk)));
}

/**
 * Returns Cyber Rank title based on XP & Risk Score
 */
export function getCyberRank(xp: number, riskScore: number): { title: string; tier: number; badgeColor: string } {
  if (xp >= 15000 && riskScore <= 15) return { title: "Chief Cyber Sentinel", tier: 6, badgeColor: "text-purple-400" };
  if (xp >= 9000 && riskScore <= 25) return { title: "Cyber Defense Vanguard", tier: 5, badgeColor: "text-cyan-400" };
  if (xp >= 5000 && riskScore <= 40) return { title: "Security Specialist", tier: 4, badgeColor: "text-emerald-400" };
  if (xp >= 2500) return { title: "Threat Hunter", tier: 3, badgeColor: "text-blue-400" };
  if (xp >= 1000) return { title: "Vigilant Defender", tier: 2, badgeColor: "text-amber-400" };
  return { title: "Cyber Recruit", tier: 1, badgeColor: "text-slate-400" };
}

/**
 * Recommends the Next Best Learning Activity targeting lowest mastery skills
 */
export interface RecommendedActivity {
  type: "SCENARIO" | "LESSON" | "SPACED_REVIEW" | "MINI_GAME";
  title: string;
  skillTag: string;
  difficulty: Difficulty;
  reason: string;
  scenarioId?: string;
  trackSlug?: string;
}

export function recommendNextActivity(
  user: UserProfile,
  scenarios: Scenario[],
  completedScenarioIds: string[] = []
): RecommendedActivity {
  // 1. Identify weakest skill
  let weakestSkill = ALL_SKILL_IDS[0];
  let minScore = 999;

  for (const skillId of ALL_SKILL_IDS) {
    const score = user.skillsMastery[skillId] ?? 50;
    if (score < minScore) {
      minScore = score;
      weakestSkill = skillId;
    }
  }

  // 2. Select appropriate difficulty based on skill mastery
  let targetDifficulty: Difficulty = "BEGINNER";
  if (minScore >= 75) targetDifficulty = "ADVANCED";
  else if (minScore >= 50) targetDifficulty = "INTERMEDIATE";

  // 3. Find uncompleted scenario in that skill & difficulty
  const candidates = scenarios.filter(
    (s) => s.skillTag === weakestSkill && !completedScenarioIds.includes(s.id)
  );

  const matched = candidates.find((s) => s.difficulty === targetDifficulty) || candidates[0];

  if (matched) {
    return {
      type: "SCENARIO",
      title: matched.title,
      skillTag: weakestSkill,
      difficulty: matched.difficulty,
      reason: `Targeting your lowest mastery area (${weakestSkill.replace("_", " ")}, score ${minScore}/100) to build resilience.`,
      scenarioId: matched.id,
    };
  }

  // Default fallback recommendation
  return {
    type: "MINI_GAME",
    title: "Threat Triage Simulation",
    skillTag: weakestSkill,
    difficulty: targetDifficulty,
    reason: "Test and sharpen your rapid threat detection instincts under timed pressure.",
  };
}
