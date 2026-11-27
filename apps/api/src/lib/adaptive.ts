import type { Difficulty } from "@adaptsec/shared";

export const DIFFICULTY_FACTORS: Record<Difficulty, number> = {
  BEGINNER: 1.0,
  INTERMEDIATE: 1.5,
  ADVANCED: 2.2,
  EXPERT: 3.0,
};

export const TARGET_DECISION_TIME_MS: Record<Difficulty, number> = {
  BEGINNER: 18000,
  INTERMEDIATE: 22000,
  ADVANCED: 28000,
  EXPERT: 35000,
};

export const SKILL_WEIGHTS: Record<string, number> = {
  phishing: 0.22,
  credentials: 0.18,
  payments: 0.20,
  social_eng: 0.15,
  browsing_wifi: 0.10,
  data_privacy: 0.08,
  incident_response: 0.07,
};

export interface MasteryUpdateInput {
  currentScore: number;
  difficulty: Difficulty;
  isCorrect: boolean;
  timeMs: number;
  flagsFoundCount: number;
  totalFlagsCount: number;
}

export interface MasteryUpdateOutput {
  newScore: number;
  delta: number;
  speedBonus: number;
}

/**
 * Pure Elo/IRT-style per-skill mastery update (0 - 100 scale).
 */
export function calculateNewMastery({
  currentScore,
  difficulty,
  isCorrect,
  timeMs,
  flagsFoundCount,
  totalFlagsCount,
}: MasteryUpdateInput): MasteryUpdateOutput {
  const diffFactor = DIFFICULTY_FACTORS[difficulty] ?? 1.5;
  const targetTime = TARGET_DECISION_TIME_MS[difficulty] ?? 20000;

  const threshold = (diffFactor - 1.0) * 30 + 35;
  const expectedProb = 1 / (1 + Math.exp(-(currentScore - threshold) / 15));
  const baseK = 14 * diffFactor;

  const flagRatio =
    totalFlagsCount > 0
      ? Math.min(1, flagsFoundCount / totalFlagsCount)
      : isCorrect
      ? 1.0
      : 0.0;

  const timeRatio = Math.max(0.4, Math.min(2.5, timeMs / targetTime));
  let speedBonus = 0;
  if (isCorrect) {
    speedBonus = timeMs > 3000 && timeRatio <= 1.2 ? 2.0 : 0.5;
  } else if (timeMs < 4000) {
    speedBonus = -3.5;
  }

  const actualOutcome = isCorrect ? 0.7 + flagRatio * 0.3 : flagRatio * 0.2;
  let delta = baseK * (actualOutcome - expectedProb) + speedBonus;
  delta = Math.max(-18, Math.min(18, delta));

  const newScore = Math.max(0, Math.min(100, Math.round(currentScore + delta)));

  return {
    newScore,
    delta: Math.round(delta * 10) / 10,
    speedBonus,
  };
}

export interface SM2State {
  repetition: number;
  intervalDays: number;
  easeFactor: number;
}

/**
 * Pure SuperMemo SM-2 spaced repetition scheduler.
 */
export function calculateSM2NextReview(
  quality: number,
  prev: SM2State = { repetition: 0, intervalDays: 1, easeFactor: 2.5 }
): { nextReviewAt: Date; state: SM2State } {
  let { repetition, intervalDays, easeFactor } = prev;
  const q = Math.max(0, Math.min(5, quality));

  if (q >= 3) {
    if (repetition === 0) intervalDays = 1;
    else if (repetition === 1) intervalDays = 3;
    else if (repetition === 2) intervalDays = 7;
    else intervalDays = Math.round(intervalDays * easeFactor);
    repetition += 1;
  } else {
    repetition = 0;
    intervalDays = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  return {
    nextReviewAt,
    state: {
      repetition,
      intervalDays,
      easeFactor: Math.round(easeFactor * 100) / 100,
    },
  };
}

/**
 * Computes Human Risk Score (0 = safest, 100 = highest risk).
 */
export function computeHumanRiskScore(
  skills: Record<string, number>
): number {
  let weightedSum = 0;
  let weightTotal = 0;

  for (const [skill, weight] of Object.entries(SKILL_WEIGHTS)) {
    const score = skills[skill] ?? 50;
    weightedSum += score * weight;
    weightTotal += weight;
  }

  const avgMastery = weightTotal > 0 ? weightedSum / weightTotal : 50;
  let risk = 100 - avgMastery;

  const paymentScore = skills.payments ?? 50;
  const phishingScore = skills.phishing ?? 50;
  if (paymentScore < 45 || phishingScore < 45) {
    risk = Math.min(100, risk * 1.15);
  }

  return Math.max(0, Math.min(100, Math.round(risk)));
}
