"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ALL_SKILL_IDS, SKILL_CATEGORIES } from "@/lib/skills";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";

const BASELINE_QUESTIONS = [
  {
    id: "b1",
    skill: "phishing",
    q: "You receive an email from 'support@apple-security-verify.net' claiming your iCloud was hacked with a link to confirm password. What do you do?",
    options: [
      { text: "Click the link immediately to prevent photos from leaking", score: 20 },
      { text: "Inspect domain 'apple-security-verify.net', recognize it is not apple.com, and report phishing", score: 95 },
      { text: "Reply asking if this is a genuine email", score: 40 },
    ],
  },
  {
    id: "b2",
    skill: "payments",
    q: "A buyer on OLX sends a QR code stating: 'Scan this QR code and enter your UPI PIN to receive ₹8,000'. What will happen?",
    options: [
      { text: "₹8,000 will be credited into your savings account", score: 10 },
      { text: "₹8,000 will be debited (stolen) from your account because UPI PIN is only for outgoing payments", score: 98 },
      { text: "The transaction will be held in escrow by RBI", score: 30 },
    ],
  },
  {
    id: "b3",
    skill: "credentials",
    q: "Which password strategy offers the strongest defense against modern offline GPU brute-force cracking?",
    options: [
      { text: "An 8-character string like 'Tr0ub4dor&'", score: 55 },
      { text: "A 18-character memorable passphrase like 'cobalt-falcon-velvet-orbit'", score: 96 },
      { text: "Reusing your childhood pet's name with an exclamation mark", score: 20 },
    ],
  },
  {
    id: "b4",
    skill: "social_eng",
    q: "A caller sounding identical to your Managing Director urgently demands an off-the-books wire transfer for a confidential acquisition. What is the mandatory protocol?",
    options: [
      { text: "Execute the wire immediately because executive defiance hurts performance appraisals", score: 15 },
      { text: "Hang up and perform an out-of-band callback to the executive's known verified corporate number", score: 95 },
      { text: "Ask them to message you on personal WhatsApp", score: 35 },
    ],
  },
];

export default function BaselineAssessmentPage() {
  const router = useRouter();
  const { updateSkillScore, addXp } = useApp();
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [accumulatedScores, setAccumulatedScores] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = BASELINE_QUESTIONS[currentIdx];

  const handleNext = () => {
    if (selectedScore === null) return;

    const nextScores = { ...accumulatedScores, [currentQ.skill]: selectedScore };
    setAccumulatedScores(nextScores);
    setSelectedScore(null);

    if (currentIdx + 1 < BASELINE_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Calculate and save baseline mastery
      for (const [skillTag, score] of Object.entries(nextScores)) {
        updateSkillScore(skillTag, score);
      }
      addXp(300);
      setIsFinished(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-[#0b1329] to-[#0d1838] p-6 sm:p-8 space-y-2">
        <span className="text-xs font-bold text-cyber-primary uppercase tracking-wider font-mono">
          Onboarding • 10-Minute Adaptive Baseline
        </span>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Calibrate Your Human Risk Profile
        </h1>
        <p className="text-xs text-cyber-muted leading-relaxed">
          Answer real attack dilemma checkpoints to establish your starting benchmark across phishing, credentials, UPI fraud, and AI voice clone defense.
        </p>
      </div>

      {!isFinished ? (
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-cyber-muted">
            <span>Assessment Step {currentIdx + 1} of {BASELINE_QUESTIONS.length}</span>
            <span className="text-cyan-400 font-bold uppercase">{currentQ.skill}</span>
          </div>

          <h3 className="text-base font-semibold text-slate-100 leading-snug">
            {currentQ.q}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((opt, i) => (
              <div
                key={i}
                onClick={() => setSelectedScore(opt.score)}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-xs cursor-pointer transition ${
                  selectedScore === opt.score
                    ? "border-cyan-400 bg-cyan-500/10 text-cyan-200 font-semibold"
                    : "border-cyber-border bg-[#050811] text-slate-300 hover:border-cyan-500/40"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center text-[9px] ${
                    selectedScore === opt.score ? "border-cyan-400 bg-cyan-500 text-black font-bold" : "border-slate-600"
                  }`}
                >
                  {selectedScore === opt.score ? "✓" : ""}
                </div>
                <span>{opt.text}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-cyber-border">
            <button
              onClick={handleNext}
              disabled={selectedScore === null}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold px-5 py-2 text-xs shadow-lg shadow-cyan-950/40 transition"
            >
              <span>{currentIdx + 1 < BASELINE_QUESTIONS.length ? "Continue" : "Complete Baseline"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-emerald-500/30 bg-cyber-card p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Award className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Baseline Assessment Completed!</h2>
            <p className="text-xs text-cyber-muted max-w-md mx-auto">
              Your initial Human Risk Profile has been calibrated. Recommended learning tracks and weak-skill target scenarios are now personalized on your dashboard.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-2.5 text-xs shadow-lg shadow-cyan-950/40 transition"
            >
              <span>Go to Your Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
