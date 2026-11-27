"use client";

import React from "react";
import Link from "next/link";
import { SEED_THREAT_FEED } from "@/data/seedThreatFeed";
import {
  Radio,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Calendar,
  ExternalLink,
} from "lucide-react";

export default function ThreatFeedPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-[#0b1329] to-[#0d1838] p-6 sm:p-8 space-y-2 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
            Active Cyber Threat Intelligence Feed
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Scam of the Week
        </h1>
        <p className="text-xs text-cyber-muted leading-relaxed max-w-2xl">
          Curated threat intelligence dissecting active campaigns reported across India and globally. Every threat card is linked directly to a playable behavioral simulation.
        </p>
      </div>

      {/* Threat Cards Stream */}
      <div className="space-y-4">
        {SEED_THREAT_FEED.map((scam) => (
          <div
            key={scam.id}
            className="rounded-3xl border border-cyber-border bg-cyber-card hover:border-cyan-500/40 p-6 sm:p-8 space-y-4 transition shadow-xl group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyber-border pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold px-2 py-0.5 border border-rose-500/30 uppercase">
                  {scam.threatLevel} THREAT
                </span>
                <span className="text-xs text-cyan-400 font-mono font-semibold">
                  {scam.category}
                </span>
              </div>
              <span className="text-xs text-cyber-muted font-mono">{scam.date}</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition">
                {scam.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {scam.summary}
              </p>
            </div>

            {/* Real World Impact */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-1">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                Real-World Impact Telemetry:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{scam.realWorldIncident}</p>
            </div>

            {/* Key Indicators */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-muted font-mono">
                Attack Signatures & Red Flags:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {scam.keyIndicators.map((ind, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-xl bg-[#050811] p-3 border border-cyber-border">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-cyber-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-emerald-400 font-medium">
                🛡️ Defense Rule: {scam.preventiveAdvice}
              </p>

              {scam.simulationScenarioId && (
                <Link
                  href="/simulations"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-4 py-2 text-xs shadow-lg shadow-cyan-950/40 transition shrink-0"
                >
                  <span>Practice in Simulation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
