"use client";

import React from "react";
import { Scenario, Decision, RedFlag } from "@/lib/types";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

interface SimulationFeedbackModalProps {
  scenario: Scenario;
  userDecision: Decision;
  isCorrect: boolean;
  timeMs: number;
  newMasteryScore: number;
  xpEarned: number;
  onNext: () => void;
  onRetry: () => void;
}

export function SimulationFeedbackModal({
  scenario,
  userDecision,
  isCorrect,
  timeMs,
  newMasteryScore,
  xpEarned,
  onNext,
  onRetry,
}: SimulationFeedbackModalProps) {
  const seconds = (timeMs / 1000).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        {/* Outcome Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border pb-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isCorrect
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {isCorrect ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isCorrect ? "Threat Neutralized!" : "Vulnerability Triggered"}
              </h2>
              <p className="text-xs text-cyber-muted mt-0.5">
                Your Action: <span className="font-semibold text-slate-200">{userDecision.replace("_", " ")}</span>
                {" • "}
                Optimal: <span className="font-semibold text-cyber-primary">{scenario.correctAction.replace("_", " ")}</span>
              </p>
            </div>
          </div>

          {/* Telemetry Stats: XP & Time */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyber-border bg-[#050811] px-3 py-1.5 text-center">
              <span className="text-[10px] text-cyber-muted block font-mono">Decision Time</span>
              <span className="text-xs font-bold text-cyan-400 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" /> {seconds}s
              </span>
            </div>
            <div className="rounded-xl border border-cyber-border bg-[#050811] px-3 py-1.5 text-center">
              <span className="text-[10px] text-cyber-muted block font-mono">XP Earned</span>
              <span className="text-xs font-bold text-cyber-secondary flex items-center justify-center gap-1">
                <Zap className="h-3 w-3 fill-cyber-secondary" /> +{xpEarned}
              </span>
            </div>
          </div>
        </div>

        {/* Narrative Explanation */}
        <div
          className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed border ${
            isCorrect
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/20 border-rose-500/30 text-rose-200"
          }`}
        >
          {isCorrect ? scenario.explanationOnSuccess : scenario.explanationOnFailure}
        </div>

        {/* Red Flags Dissected (The Behavior Change Engine) */}
        {scenario.redFlags.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-muted flex items-center gap-1.5 font-mono">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              Attack Red Flags Breakdown ({scenario.redFlags.length})
            </h4>

            <div className="grid gap-2.5">
              {scenario.redFlags.map((flag: RedFlag) => (
                <div
                  key={flag.id}
                  className="rounded-xl border border-cyber-border bg-[#050811] p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{flag.title}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        flag.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{flag.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What To Do Instead Section */}
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-1">
          <h5 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            Active Cyber Defense Takeaway:
          </h5>
          <p className="text-xs text-slate-200 leading-relaxed">{scenario.whatToDoInstead}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-cyber-border">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-xl border border-cyber-border bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-4 py-2 text-xs font-semibold transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2.5 text-xs shadow-lg shadow-cyan-950/60 transition hover:scale-[1.02]"
          >
            <span>Next Recommended Challenge</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
