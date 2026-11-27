"use client";

import React, { useState } from "react";
import { Scenario, Decision } from "@/lib/types";
import {
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  Search,
} from "lucide-react";

interface FakeLoginSpotterProps {
  scenario: Scenario;
  onDecision: (decision: Decision, timeMs: number) => void;
  startTime: number;
}

export function FakeLoginSpotter({
  scenario,
  onDecision,
  startTime,
}: FakeLoginSpotterProps) {
  const [showCertDetails, setShowCertDetails] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("alex.mercer@enterprise.org");
  const [password, setPassword] = useState<string>("");

  const { scenarioContent } = scenario;
  const isHttps = scenarioContent.fakeLoginPageUrl?.startsWith("https://") ?? false;

  const handleAction = (decision: Decision) => {
    const elapsed = Date.now() - startTime;
    onDecision(decision, elapsed);
  };

  return (
    <div className="flex flex-col h-[700px] rounded-2xl border border-cyber-border bg-[#0b111e] overflow-hidden shadow-2xl relative">
      {/* Browser Chrome Window Header */}
      <div className="flex flex-col border-b border-cyber-border bg-[#080d18] px-4 py-2.5 space-y-2">
        {/* Browser Tabs & Window Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            {/* Active Tab */}
            <div className="ml-3 flex items-center gap-2 rounded-t-lg bg-cyber-card px-3 py-1 text-xs font-semibold text-slate-200 border-t border-x border-cyber-border">
              <span>{scenarioContent.fakeLoginBrandedCompany || "Authentication Gateway"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction("REPORT_PHISH")}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 text-xs font-bold transition shadow-lg shadow-rose-950/40"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Report Phishing Site</span>
            </button>
            <button
              onClick={() => handleAction("ENTER_CREDENTIALS")}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 text-xs font-medium border border-cyber-border transition"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Legitimate Site</span>
            </button>
          </div>
        </div>

        {/* Browser Address Bar (Crucial Spotting Element) */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-cyber-border bg-[#05070e] px-3 py-1.5 text-xs font-mono">
            {/* SSL Padlock (Clickable for Cert details) */}
            <button
              onClick={() => setShowCertDetails(!showCertDetails)}
              className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                isHttps
                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
              }`}
              title="Click to inspect SSL Certificate"
            >
              {isHttps ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              <span>{isHttps ? "Secure" : "Not Secure"}</span>
            </button>

            {/* URL String */}
            <span className="text-slate-200 font-semibold select-all">
              {scenarioContent.fakeLoginPageUrl || "https://login.microsoft.com.auth-portal.co/signin"}
            </span>
          </div>
        </div>
      </div>

      {/* SSL Details Popover */}
      {showCertDetails && (
        <div className="absolute top-20 left-6 z-40 w-80 rounded-xl border border-cyber-border bg-cyber-card p-4 shadow-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-cyber-border pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Info className="h-4 w-4 text-cyan-400" />
              Certificate Inspection
            </span>
            <button onClick={() => setShowCertDetails(false)} className="text-cyber-muted hover:text-white">✕</button>
          </div>
          <p><span className="text-cyber-muted">Issued To:</span> {scenarioContent.fakeLoginPageUrl?.split("/")[2]}</p>
          <p><span className="text-cyber-muted">Issuer:</span> Let&apos;s Encrypt Free DV Authority</p>
          <p className="text-[11px] text-amber-300 bg-amber-950/20 p-2 rounded border border-amber-500/20">
            ⚠️ Note: An SSL padlock only guarantees encryption in transit; attackers commonly obtain free SSL certificates for phishing domains!
          </p>
        </div>
      )}

      {/* Rendered Web Page View */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-[#070b14] p-6">
        <div className="w-full max-w-md rounded-2xl border border-cyber-border bg-[#0d1627] p-8 shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 font-bold text-white text-lg">
              {(scenarioContent.fakeLoginBrandedCompany || "A")[0]}
            </div>
            <h3 className="text-xl font-bold text-white">
              {scenarioContent.fakeLoginBrandedCompany || "Single Sign-On"}
            </h3>
            <p className="text-xs text-cyber-muted">Enter your organizational credentials to continue</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction("ENTER_CREDENTIALS");
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address or Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-cyber-border bg-[#050811] px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-cyber-border bg-[#050811] px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 py-3 text-xs font-bold text-white transition shadow-lg shadow-cyan-950/40"
            >
              Sign In (Submit Credentials)
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => handleAction("REPORT_PHISH")}
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              This looks suspicious — Report Phishing Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
