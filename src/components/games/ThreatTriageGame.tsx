"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TriageEmail {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  isPhish: boolean;
  redFlags: string[];
}

const TRIAGE_BANK: TriageEmail[] = [
  {
    id: "e1",
    sender: "Accounts Team <billing@acme-corporate.org>",
    subject: "Monthly Expense Reimbursement Approved",
    preview: "Your travel claim #EXP-928 has been credited to your salary account.",
    isPhish: false,
    redFlags: [],
  },
  {
    id: "e2",
    sender: "IT Helpdesk <support@it-portal-passwords.co.in>",
    subject: "Password Reset Required Within 1 Hour",
    preview: "Failure to verify will lead to account deactivation. Click here to confirm.",
    isPhish: true,
    redFlags: ["External domain 'it-portal-passwords.co.in'", "1-hour artificial urgency hook"],
  },
  {
    id: "e3",
    sender: "DHL Tracking <package@dhl-delivery-hub.top>",
    subject: "Shipment #892182 Failed Delivery Attempt",
    preview: "Pay ₹25 handling fee to reschedule redelivery: http://dhl-pay.top",
    isPhish: true,
    redFlags: ["Suspicious .top top-level domain", "Requests fee via unknown web portal"],
  },
  {
    id: "e4",
    sender: "GitHub <notifications@github.com>",
    subject: "[enterprise-core] Pull Request #14 Opened",
    preview: "Sarah opened pull request: 'feat: add zero-trust policy engine'.",
    isPhish: false,
    redFlags: [],
  },
  {
    id: "e5",
    sender: "Income Tax <refunds@incometax-gov-in.net>",
    subject: "Approved Tax Refund of ₹24,800",
    preview: "Submit NetBanking credentials to disburse pending refund to your account.",
    isPhish: true,
    redFlags: ["Deceptive .net domain masquerading as government", "Requests banking credentials"],
  },
  {
    id: "e6",
    sender: "Jira Cloud <jira@enterprise.atlassian.net>",
    subject: "SEC-102: New Task Assigned to you",
    preview: "Alex, please review the firewall rules before tomorrow's audit.",
    isPhish: false,
    redFlags: [],
  },
  {
    id: "e7",
    sender: "CEO Sundar <sundar.exec.corp@gmail.com>",
    subject: "Quick Task: Are you at your desk?",
    preview: "I need you to buy 5x Apple gift cards right now for client gifts.",
    isPhish: true,
    redFlags: ["Executive using personal Gmail address", "Gift card purchase request"],
  },
  {
    id: "e8",
    sender: "Slack Legal <compliance@slack-internal.org>",
    subject: "Your Message Archive Download is Ready",
    preview: "Download attached 'Slack_Export_Private_Chats.zip' (42 MB).",
    isPhish: true,
    redFlags: ["Unsolicited corporate chat archive", "Third-party host delivering zip file"],
  },
];

export function ThreatTriageGame() {
  const { addXp, updateSkillScore } = useApp();
  const [gameState, setGameState] = useState<"INTRO" | "PLAYING" | "REVIEW">("INTRO");
  const [queue, setQueue] = useState<TriageEmail[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [roundDecisions, setRoundDecisions] = useState<
    { item: TriageEmail; action: "REPORT" | "SAFE"; isCorrect: boolean }[]
  >([]);

  const startGame = () => {
    // Shuffle or ordered sequence
    setQueue([...TRIAGE_BANK]);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(35);
    setRoundDecisions([]);
    setGameState("PLAYING");
  };

  useEffect(() => {
    if (gameState !== "PLAYING") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const handleTriage = (action: "REPORT" | "SAFE") => {
    const currentItem = queue[currentIndex];
    if (!currentItem) return;

    const isCorrect =
      (action === "REPORT" && currentItem.isPhish) ||
      (action === "SAFE" && !currentItem.isPhish);

    const pointsDelta = isCorrect ? 100 + streak * 25 : -50;
    setScore((prev) => Math.max(0, prev + pointsDelta));
    setStreak((prev) => (isCorrect ? prev + 1 : 0));

    setRoundDecisions((prev) => [
      ...prev,
      { item: currentItem, action, isCorrect },
    ]);

    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameState("REVIEW");
    addXp(120);
    updateSkillScore("phishing", 80);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
  };

  const currentEmail = queue[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Intro Screen */}
      {gameState === "INTRO" && (
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyber-primary border border-cyan-500/40">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Threat Triage: Rapid Inbox Defense</h2>
            <p className="text-xs text-cyber-muted max-w-lg mx-auto leading-relaxed">
              Triage rapid streams of incoming corporate communications in under 35 seconds. Reward correct report/ignore actions; streak multipliers reward vigilance; post-round debrief shows exact red flags.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={startGame}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3 text-xs shadow-lg shadow-cyan-950/40 transition hover:scale-[1.02]"
            >
              <Zap className="h-4 w-4" />
              <span>Begin 35s Threat Triage</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Playing Screen */}
      {gameState === "PLAYING" && currentEmail && (
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* HUD Bar */}
          <div className="flex items-center justify-between border-b border-cyber-border pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                Email {currentIndex + 1}/{queue.length}
              </span>
              <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
                Streak: {streak}x
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-bold font-mono text-cyan-400">
                <Clock className="h-4 w-4" /> {timeLeft}s
              </div>
              <div className="rounded-xl border border-cyber-border bg-[#050811] px-3 py-1 font-mono text-xs font-bold text-cyber-secondary">
                {score} PTS
              </div>
            </div>
          </div>

          {/* Email Preview Card */}
          <div className="rounded-2xl border border-cyber-border bg-[#050811] p-6 space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block">From:</span>
              <p className="text-xs font-semibold text-white font-mono">{currentEmail.sender}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block">Subject:</span>
              <h3 className="text-sm font-bold text-slate-100">{currentEmail.subject}</h3>
            </div>

            <div className="rounded-xl border border-cyber-border bg-[#090d1a] p-4 text-xs text-slate-300 leading-relaxed">
              {currentEmail.preview}
            </div>
          </div>

          {/* Rapid Triage Action Controls */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => handleTriage("REPORT")}
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 text-xs shadow-lg shadow-rose-950/60 active:scale-95 transition"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>REPORT PHISH</span>
            </button>

            <button
              onClick={() => handleTriage("SAFE")}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 text-xs shadow-lg shadow-emerald-950/60 active:scale-95 transition"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>LEGITIMATE / SAFE</span>
            </button>
          </div>
        </div>
      )}

      {/* Review Screen (No alert() popups!) */}
      {gameState === "REVIEW" && (
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Round Triage Debrief</h2>
              <p className="text-xs text-cyber-muted mt-0.5">
                Detailed breakdown of false positives, false negatives, and spotted red flags.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-cyan-400 font-mono">{score} PTS</span>
              <p className="text-[10px] text-cyber-secondary font-mono">+120 XP Awarded</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="space-y-3">
            {roundDecisions.map((res, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-4 text-xs space-y-2 ${
                  res.isCorrect
                    ? "border-emerald-500/30 bg-emerald-950/10 text-emerald-200"
                    : "border-rose-500/30 bg-rose-950/10 text-rose-200"
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2">
                    {res.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-400" />
                    )}
                    <span>{res.item.subject}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono">
                    You: {res.action} • Real: {res.item.isPhish ? "PHISHING" : "LEGITIMATE"}
                  </span>
                </div>

                {res.item.redFlags.length > 0 && (
                  <div className="rounded-lg bg-black/40 p-2.5 text-[11px] text-slate-300 space-y-1 border border-cyber-border">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Red Flags in Message:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {res.item.redFlags.map((flag, fIdx) => (
                        <li key={fIdx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={startGame}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 text-xs transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Play Another Triage Round</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
