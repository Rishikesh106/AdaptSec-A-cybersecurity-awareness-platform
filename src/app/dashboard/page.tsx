"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { SKILL_CATEGORIES } from "@/lib/skills";
import { recommendNextActivity } from "@/lib/adaptive";
import { ALL_SEED_SCENARIOS } from "@/data/seedScenarios";
import { SEED_BADGES } from "@/data/seedBadges";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Flame,
  Award,
  ArrowRight,
  TrendingDown,
  Target,
  Sparkles,
  BookOpen,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function LearnerDashboardPage() {
  const { currentUser, completedScenarioIds } = useApp();

  // Next Best Activity from pure Adaptive Engine
  const recommended = recommendNextActivity(
    currentUser,
    ALL_SEED_SCENARIOS,
    completedScenarioIds
  );

  // Data for Recharts Radar
  const radarData = Object.entries(currentUser.skillsMastery).map(([skillKey, score]) => {
    const meta = SKILL_CATEGORIES[skillKey];
    return {
      skill: meta ? meta.shortName : skillKey,
      score: score,
      benchmark: meta ? meta.benchmarkScore : 80,
    };
  });

  const riskTier =
    currentUser.humanRiskScore <= 25
      ? { label: "Cyber Guardian", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" }
      : currentUser.humanRiskScore <= 50
      ? { label: "Moderate Vulnerability", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" }
      : { label: "Critical Human Risk", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome & Cyber Rank Hero */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-[#0b1329] via-[#09152b] to-[#0d1838] p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {currentUser.organizationName || "Enterprise"} • {currentUser.department}
              </span>
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyber-primary border border-cyan-800">
                ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs text-cyber-muted max-w-xl">
              Cyber Rank: <strong className="text-white">{currentUser.cyberRankTitle}</strong> • Level {currentUser.level} Defender
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyber-border bg-[#050811]/90 p-4 text-center min-w-[130px]">
              <span className="text-[10px] font-mono text-cyber-muted block">HUMAN RISK SCORE</span>
              <span className={`text-2xl font-black ${riskTier.color}`}>
                {currentUser.humanRiskScore}
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </span>
              <span className="text-[10px] text-cyber-muted block mt-0.5">{riskTier.label}</span>
            </div>

            <div className="rounded-2xl border border-cyber-border bg-[#050811]/90 p-4 text-center min-w-[110px]">
              <span className="text-[10px] font-mono text-cyber-muted block">STREAK</span>
              <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-400">
                <Flame className="h-5 w-5 fill-amber-500" />
                <span>{currentUser.streakDays}d</span>
              </div>
              <span className="text-[10px] text-cyber-muted block mt-0.5">Consecutive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Next Step (The Adaptive Engine Action Card) */}
      <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-[#071324] to-blue-950/30 p-6 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Adaptive Engine Next Best Activity
          </span>
          <span className="rounded bg-cyan-900/60 text-cyan-200 px-2 py-0.5 text-[10px] font-bold font-mono">
            Targeting Weak Spot
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">{recommended.title}</h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {recommended.reason}
            </p>
          </div>

          <Link
            href={
              recommended.scenarioId
                ? `/simulations/${ALL_SEED_SCENARIOS.find((s) => s.id === recommended.scenarioId)?.slug || "microsoft-365-urgent-password-reset"}`
                : "/games"
            }
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2.5 text-xs shadow-lg shadow-cyan-950/40 transition hover:scale-105 shrink-0"
          >
            <span>Launch Activity</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Radar Chart & Skill Competencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart Card */}
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div>
              <h3 className="font-bold text-base text-white">7-Domain Skill Radar</h3>
              <p className="text-xs text-cyber-muted">Actual competency vs enterprise 80% benchmark</p>
            </div>
            <Target className="h-5 w-5 text-cyan-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(0, 240, 255, 0.15)" />
                <PolarAngleAxis dataKey="skill" stroke="#8899ac" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                <Radar
                  name="Your Mastery"
                  dataKey="score"
                  stroke="#00f0ff"
                  fill="#00f0ff"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Target Benchmark"
                  dataKey="benchmark"
                  stroke="#ff007f"
                  fill="#ff007f"
                  fillOpacity={0.1}
                  strokeDasharray="4 4"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-cyan-400" />
              <span className="text-slate-300">Your Score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-pink-500 opacity-60" />
              <span className="text-slate-400">Target Benchmark</span>
            </div>
          </div>
        </div>

        {/* Per-Skill Score Breakdown */}
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div>
              <h3 className="font-bold text-base text-white">Competency Breakdown</h3>
              <p className="text-xs text-cyber-muted">Updated in real-time by the adaptive engine</p>
            </div>
            <Zap className="h-5 w-5 text-amber-400" />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {Object.entries(currentUser.skillsMastery).map(([skillKey, score]) => {
              const meta = SKILL_CATEGORIES[skillKey];
              return (
                <div
                  key={skillKey}
                  className="rounded-2xl border border-cyber-border bg-[#050811] p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      {meta ? meta.name : skillKey}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        score >= 80 ? "text-emerald-400" : score >= 60 ? "text-cyan-400" : "text-amber-400"
                      }`}
                    >
                      {score}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-cyan-400" : "bg-amber-400"
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-cyber-border pb-3">
          <div>
            <h3 className="font-bold text-base text-white">Earned Badges & Credentials</h3>
            <p className="text-xs text-cyber-muted">Behavioral milestones awarded for verified defense competency</p>
          </div>
          <Award className="h-5 w-5 text-cyber-primary" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SEED_BADGES.slice(0, 4).map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center text-center rounded-2xl border border-cyber-border bg-[#050811] p-4 space-y-2 hover:border-cyan-500/40 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyber-primary border border-cyan-500/30">
                <Award className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-xs text-slate-100">{badge.title}</h4>
              <p className="text-[10px] text-cyber-muted line-clamp-2 leading-relaxed">
                {badge.description}
              </p>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-mono text-cyan-300 font-bold uppercase">
                {badge.tier}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
