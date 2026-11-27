"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getScenarioById, ALL_SEED_SCENARIOS } from "@/data/seedScenarios";
import { Scenario, Decision } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { calculateNewMastery } from "@/lib/adaptive";
import { InboxSimulator } from "@/components/simulators/InboxSimulator";
import { SmsWhatsappSimulator } from "@/components/simulators/SmsWhatsappSimulator";
import { UpiSimulator } from "@/components/simulators/UpiSimulator";
import { VoiceCallSimulator } from "@/components/simulators/VoiceCallSimulator";
import { FakeLoginSpotter } from "@/components/simulators/FakeLoginSpotter";
import { SimulationFeedbackModal } from "@/components/simulators/SimulationFeedbackModal";
import { ArrowLeft, Clock, Shield } from "lucide-react";
import confetti from "canvas-confetti";

export default function SimulationArenaPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { currentUser, addXp, updateSkillScore, markScenarioCompleted } = useApp();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [lastAttempt, setLastAttempt] = useState<{
    decision: Decision;
    isCorrect: boolean;
    timeMs: number;
    newMastery: number;
    xpEarned: number;
  } | null>(null);

  useEffect(() => {
    if (slug) {
      const found = getScenarioById(slug);
      if (found) {
        setScenario(found);
        setStartTime(Date.now());
        setElapsedSeconds(0);
        setShowFeedback(false);
      }
    }
  }, [slug]);

  // Live timer for decision hesitation tracking
  useEffect(() => {
    if (showFeedback) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, showFeedback]);

  if (!scenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-slate-400">Loading simulation scenario...</p>
        <Link href="/simulations" className="text-cyan-400 hover:underline text-xs">
          ← Back to Simulation Catalog
        </Link>
      </div>
    );
  }

  const handleDecision = (decision: Decision, timeMs: number) => {
    // Check correctness:
    // Reporting phish is correct if attack scenario; Ignore is correct if legitimate
    const isCorrect =
      decision === scenario.correctAction ||
      (scenario.correctAction === "REPORT_PHISH" && decision === "ESCALATE_SOC");

    const currentMastery = currentUser.skillsMastery[scenario.skillTag] || 50;

    const { newMastery } = calculateNewMastery({
      currentMastery,
      difficulty: scenario.difficulty,
      isCorrect,
      timeMs,
      flagsFoundCount: isCorrect ? scenario.redFlags.length : 0,
      totalFlagsCount: scenario.redFlags.length,
    });

    const xpEarned = isCorrect ? 150 : 25;

    // Trigger fireworks confetti on correct defense!
    if (isCorrect) {
      try {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
    }

    addXp(xpEarned);
    updateSkillScore(scenario.skillTag, newMastery);
    markScenarioCompleted(scenario.id);

    setLastAttempt({
      decision,
      isCorrect,
      timeMs,
      newMastery,
      xpEarned,
    });
    setShowFeedback(true);
  };

  const handleNext = () => {
    // Find next uncompleted scenario
    const currentIndex = ALL_SEED_SCENARIOS.findIndex((s) => s.id === scenario.id);
    const nextScenario = ALL_SEED_SCENARIOS[currentIndex + 1] || ALL_SEED_SCENARIOS[0];
    router.push(`/simulations/${nextScenario.slug}`);
  };

  const handleRetry = () => {
    setShowFeedback(false);
    setStartTime(Date.now());
    setElapsedSeconds(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Top Breadcrumb & Live Hesitation Timer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyber-border pb-3">
        <Link
          href="/simulations"
          className="flex items-center gap-1.5 text-xs text-cyber-muted hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit Simulation</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-2.5 py-1 text-xs font-mono text-cyan-300">
            <Clock className="h-3.5 w-3.5" />
            <span>Hesitation Timer: {elapsedSeconds}s</span>
          </div>
          <span className="text-xs text-slate-500">Skill: {scenario.skillTag.replace("_", " ")}</span>
        </div>
      </div>

      {/* Simulator Switcher by Channel */}
      {scenario.channel === "INBOX" && (
        <InboxSimulator scenario={scenario} onDecision={handleDecision} startTime={startTime} />
      )}
      {(scenario.channel === "SMS" || scenario.channel === "WHATSAPP") && (
        <SmsWhatsappSimulator scenario={scenario} onDecision={handleDecision} startTime={startTime} />
      )}
      {scenario.channel === "UPI" && (
        <UpiSimulator scenario={scenario} onDecision={handleDecision} startTime={startTime} />
      )}
      {scenario.channel === "VOICE_CALL" && (
        <VoiceCallSimulator scenario={scenario} onDecision={handleDecision} startTime={startTime} />
      )}
      {scenario.channel === "FAKE_LOGIN" && (
        <FakeLoginSpotter scenario={scenario} onDecision={handleDecision} startTime={startTime} />
      )}

      {/* Feedback Overlay Modal */}
      {showFeedback && lastAttempt && (
        <SimulationFeedbackModal
          scenario={scenario}
          userDecision={lastAttempt.decision}
          isCorrect={lastAttempt.isCorrect}
          timeMs={lastAttempt.timeMs}
          newMasteryScore={lastAttempt.newMastery}
          xpEarned={lastAttempt.xpEarned}
          onNext={handleNext}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
