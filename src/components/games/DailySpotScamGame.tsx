"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Flame,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import confetti from "canvas-confetti";

interface DailyChallengeCard {
  id: string;
  sender: string;
  text: string;
  isScam: boolean;
  clue: string;
}

const DAILY_CARDS: DailyChallengeCard[] = [
  {
    id: "d1",
    sender: "SMS: +91 98402 11928",
    text: "Power cutoff at 9:30 PM due to unpaid electricity bill. Call officer at 9840211928 to update bill.",
    isScam: true,
    clue: "Personal phone number and night disconnection threat",
  },
  {
    id: "d2",
    sender: "Email: notifications@github.com",
    text: "[GitHub] You were invited to join team 'security-core' on enterprise repository.",
    isScam: false,
    clue: "Legitimate notification from authenticated @github.com",
  },
  {
    id: "d3",
    sender: "WhatsApp: Save Little Ananya",
    text: "Urgent heart surgery donation required. Send funds to personal UPI: help.ananya@oksbi.",
    isScam: true,
    clue: "Personal UPI VPA used for unverified medical crowdfund",
  },
  {
    id: "d4",
    sender: "UPI Pop-up: OLX Buyer",
    text: "Enter your 6-digit UPI PIN to claim ₹12,000 sofa purchase advance.",
    isScam: true,
    clue: "UPI PIN is ONLY for debits, never to receive money",
  },
  {
    id: "d5",
    sender: "Email: traveldesk@enterprise.org",
    text: "Your flight to Bengaluru (IndiGo 6E-8921) confirmed. E-ticket attached.",
    isScam: false,
    clue: "Verified internal company domain and expected business itinerary",
  },
  {
    id: "d6",
    sender: "Voice Call: CBI Inspector",
    text: "Your Aadhaar is under Digital Arrest for money laundering. Transfer funds to RBI clearing account.",
    isScam: true,
    clue: "'Digital Arrest' is a total fiction with no legal existence",
  },
];

const LEADERBOARD_DATA = [
  { rank: 1, name: "Priya Sundaram", score: 2840, rankTitle: "Cyber Defense Vanguard", badges: 12 },
  { rank: 2, name: "Alex Mercer (You)", score: 2450, rankTitle: "Threat Hunter", badges: 8 },
  { rank: 3, name: "Sneha Patel", score: 2190, rankTitle: "Vigilant Defender", badges: 7 },
  { rank: 4, name: "Marcus Vance", score: 1980, rankTitle: "Security Specialist", badges: 9 },
  { rank: 5, name: "Rahul Nair", score: 1420, rankTitle: "Cyber Recruit", badges: 4 },
];

export function DailySpotScamGame() {
  const { addXp, updateSkillScore } = useApp();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [history, setHistory] = useState<{ card: DailyChallengeCard; correct: boolean }[]>([]);

  const startChallenge = () => {
    setIsPlaying(true);
    setTimeLeft(60);
    setCurrentIdx(0);
    setScore(0);
    setIsCompleted(false);
    setHistory([]);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleDecision = (userClaimedScam: boolean) => {
    const card = DAILY_CARDS[currentIdx];
    if (!card) return;

    const isCorrect = userClaimedScam === card.isScam;
    const nextScore = isCorrect ? score + 100 : Math.max(0, score - 50);
    setScore(nextScore);

    setHistory((prev) => [...prev, { card, correct: isCorrect }]);

    if (currentIdx + 1 < DAILY_CARDS.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      finishChallenge();
    }
  };

  const finishChallenge = () => {
    setIsPlaying(false);
    setIsCompleted(true);
    addXp(150);
    updateSkillScore("phishing", 85);
    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch (e) {}
  };

  const card = DAILY_CARDS[currentIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-2 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Flame className="h-4 w-4 fill-amber-500" />
            Daily 60-Second Speed Run
          </span>
          <span className="text-xs font-mono text-cyan-400 font-bold">
            Weekly Leaderboard Active
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Daily Spot the Scam</h1>
        <p className="text-xs text-cyber-muted leading-relaxed">
          Test your gut instincts under timed pressure. Identify whether each communication is a genuine message or an active attack before the 60-second timer runs out.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Column */}
        <div className="lg:col-span-2 space-y-4">
          {!isPlaying && !isCompleted && (
            <div className="rounded-3xl border border-cyber-border bg-cyber-card p-8 text-center space-y-6 shadow-2xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Flame className="h-8 w-8 fill-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Ready for Today&apos;s Challenge?</h3>
                <p className="text-xs text-cyber-muted max-w-sm mx-auto">
                  6 rapid-fire scenarios. 60 seconds. High speed bonus and streak multiplier.
                </p>
              </div>
              <button
                onClick={startChallenge}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold px-6 py-3 text-xs shadow-lg shadow-amber-950/40 transition hover:scale-105"
              >
                Start 60s Speed Run
              </button>
            </div>
          )}

          {isPlaying && card && (
            <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                <span className="text-xs font-mono text-cyan-400">Card {currentIdx + 1} of {DAILY_CARDS.length}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {timeLeft}s Left
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-[#050811] px-3 py-1 rounded-lg border border-cyber-border">
                    {score} PTS
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-cyber-border bg-[#050811] p-6 space-y-3">
                <span className="text-[10px] font-mono font-bold text-cyan-400 block">{card.sender}</span>
                <p className="text-sm text-slate-100 font-medium leading-relaxed">{card.text}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleDecision(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 text-xs shadow-lg shadow-rose-950/60 active:scale-95 transition"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>SCAM / ATTACK</span>
                </button>

                <button
                  onClick={() => handleDecision(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 text-xs shadow-lg shadow-emerald-950/60 active:scale-95 transition"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>SAFE / LEGITIMATE</span>
                </button>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-cyber-border pb-3">
                <h3 className="font-bold text-lg text-white">Daily Run Finished!</h3>
                <span className="text-xl font-bold font-mono text-cyan-400">{score} PTS</span>
              </div>

              <div className="space-y-2 text-xs">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      h.correct ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300" : "border-rose-500/30 bg-rose-950/20 text-rose-300"
                    }`}
                  >
                    <span>{h.card.sender}: &quot;{h.card.text.slice(0, 45)}...&quot;</span>
                    <span className="text-[10px] font-mono">{h.correct ? "✓ Correct" : "❌ Missed"}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={startChallenge}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2 text-xs transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Try Speed Run Again</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Leaderboard Column */}
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              Weekly Leaderboard
            </h3>
            <span className="text-[10px] text-cyber-muted font-mono">Org-Scoped</span>
          </div>

          <div className="space-y-2">
            {LEADERBOARD_DATA.map((player) => (
              <div
                key={player.rank}
                className={`flex items-center justify-between rounded-xl p-3 text-xs transition border ${
                  player.name.includes("You")
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200 font-bold"
                    : "border-cyber-border bg-[#050811] text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      player.rank === 1
                        ? "bg-amber-500 text-black"
                        : player.rank === 2
                        ? "bg-slate-300 text-black"
                        : player.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {player.rank}
                  </span>
                  <div>
                    <p className="leading-tight">{player.name}</p>
                    <p className="text-[10px] text-cyber-muted font-mono">{player.rankTitle}</p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <p className="text-cyan-400 font-bold">{player.score.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-500">{player.badges} Badges</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
