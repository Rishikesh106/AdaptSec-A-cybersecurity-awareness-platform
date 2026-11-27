"use client";

import React, { useState, useEffect } from "react";
import zxcvbn from "zxcvbn";
import { useApp } from "@/context/AppContext";
import {
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Lock,
  Copy,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";

export function PassForgeLabGame() {
  const { addXp, updateSkillScore } = useApp();
  const [password, setPassword] = useState<string>("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [challengeMode, setChallengeMode] = useState<boolean>(true);
  const [challengeCompleted, setChallengeCompleted] = useState<boolean>(false);

  // Challenge constraints
  const minLength = 16;
  const wordCountTarget = 4;
  const words = password.trim().split(/[\s\-_.]+/).filter((w) => w.length > 2);
  const meetsLength = password.length >= minLength;
  const meetsWords = words.length >= wordCountTarget;
  const meetsEntropy = analysis ? analysis.score >= 4 : false;
  const meetsAll = meetsLength && meetsWords && meetsEntropy;

  useEffect(() => {
    if (!password) {
      setAnalysis(null);
      return;
    }
    // 100% client-side zxcvbn analysis (zero network transmission)
    const res = zxcvbn(password);
    setAnalysis(res);

    if (meetsAll && !challengeCompleted) {
      setChallengeCompleted(true);
      addXp(200);
      updateSkillScore("credentials", 90);
      try {
        confetti({ particleCount: 75, spread: 70 });
      } catch (e) {}
    }
  }, [password, meetsAll, challengeCompleted]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const samplePassphrases = [
    "velvet-cobalt-falcon-orbit",
    "breeze-crypto-glacier-matrix",
    "lunar-timber-cascade-signal",
    "meadow-solstice-beacon-harbor",
  ];

  const handleInsertSample = (phrase: string) => {
    setPassword(phrase);
  };

  const getScoreColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "bg-rose-500 text-rose-300";
      case 2:
        return "bg-amber-500 text-amber-300";
      case 3:
        return "bg-cyan-500 text-cyan-300";
      case 4:
        return "bg-emerald-500 text-emerald-300";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-2 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-cyber-primary uppercase tracking-wider font-mono">
            Client-Side Password & Passphrase Security Lab
          </span>
          <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
            <Lock className="h-3 w-3" /> 100% Local (Never Sent to Server)
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">PassForge Lab</h1>
        <p className="text-xs text-cyber-muted leading-relaxed">
          Test real-time entropy calculation, offline GPU crack time estimates, dictionary breach pattern detectors, and craft resilient multi-word passphrases.
        </p>
      </div>

      {/* Challenge Card */}
      <div className="rounded-3xl border border-cyber-border bg-[#090e1a] p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Active Challenge: The Multi-Word Memorable Passphrase
          </h3>
          <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-300 font-mono">
            +200 XP Reward
          </span>
        </div>
        <p className="text-xs text-cyber-muted">
          Modern GPUs crack 8-character complex passwords like &apos;P@$$w0rd&apos; in seconds. Construct a passphrase with at least <strong>4 dictionary words</strong> and <strong>16+ characters</strong>.
        </p>

        {/* Checklists */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div
            className={`flex items-center gap-2 rounded-xl p-3 border text-xs font-medium ${
              meetsLength
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                : "border-cyber-border bg-[#050811] text-slate-400"
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${meetsLength ? "text-emerald-400" : "text-slate-600"}`} />
            <span>16+ Characters ({password.length}/{minLength})</span>
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl p-3 border text-xs font-medium ${
              meetsWords
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                : "border-cyber-border bg-[#050811] text-slate-400"
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${meetsWords ? "text-emerald-400" : "text-slate-600"}`} />
            <span>4+ Words ({words.length}/{wordCountTarget})</span>
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl p-3 border text-xs font-medium ${
              meetsEntropy
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                : "border-cyber-border bg-[#050811] text-slate-400"
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${meetsEntropy ? "text-emerald-400" : "text-slate-600"}`} />
            <span>Very Strong (Tier 4 Score)</span>
          </div>
        </div>
      </div>

      {/* Interactive Input Terminal */}
      <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200">
            Type or Construct Passphrase:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. velvet-cobalt-falcon-orbit"
              className="flex-1 rounded-2xl border border-cyber-border bg-[#050811] px-4 py-3.5 text-sm sm:text-base font-mono text-cyan-300 placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              disabled={!password}
              className="rounded-2xl border border-cyber-border bg-slate-800 hover:bg-slate-700 disabled:opacity-40 p-3.5 text-slate-200 transition"
              title="Copy to clipboard"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPassword("")}
              className="rounded-2xl border border-cyber-border bg-slate-800 hover:bg-slate-700 p-3.5 text-slate-400 hover:text-white transition"
              title="Clear input"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
          {copyFeedback && (
            <p className="text-[11px] font-mono text-emerald-400">✓ Copied to clipboard!</p>
          )}
        </div>

        {/* Quick Sample Word Tiles (Re-imagined Bubble Vault from user original prototype!) */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-cyber-muted">Sample Vault Words (Click to append):</span>
          <div className="flex flex-wrap gap-2">
            {["velvet", "cobalt", "falcon", "orbit", "glacier", "matrix", "beacon", "crypto", "harbor", "solstice"].map(
              (word) => (
                <button
                  key={word}
                  onClick={() => setPassword((prev) => (prev ? `${prev}-${word}` : word))}
                  className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 hover:border-cyan-500/50 hover:bg-cyan-950/40 px-3 py-1 text-xs font-mono text-cyan-300 transition"
                >
                  +{word}
                </button>
              )
            )}
          </div>
        </div>

        {/* Analysis Telemetry Cards */}
        {analysis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Crack Time Telemetry */}
            <div className="rounded-2xl border border-cyber-border bg-[#050811] p-5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyber-muted font-mono">
                GPU Offline Attack Resistance
              </span>
              <div className="text-2xl font-extrabold text-white tracking-tight">
                {analysis.crack_times_display.offline_slow_hashing_1e4_per_second}
              </div>
              <p className="text-xs text-cyber-muted">
                Online Throttled Attack: <span className="text-slate-200 font-mono">{analysis.crack_times_display.online_throttling_100_per_hour}</span>
              </p>

              {/* Strength Meter Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-cyber-muted">Calculated Strength:</span>
                  <span className="font-bold text-cyan-300">
                    {["Very Weak", "Weak", "Fair", "Strong", "Very Strong"][analysis.score]}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex gap-1 p-0.5">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-full transition-all ${
                        analysis.score >= step + 1
                          ? getScoreColor(analysis.score).split(" ")[0]
                          : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Pattern & Breach Warnings */}
            <div className="rounded-2xl border border-cyber-border bg-[#050811] p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyber-muted font-mono">
                Pattern & Dictionary Warnings
              </span>
              {analysis.feedback.warning ? (
                <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>{analysis.feedback.warning}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>No predictable dictionary or leetspeak patterns identified.</span>
                </div>
              )}

              {analysis.feedback.suggestions && analysis.feedback.suggestions.length > 0 && (
                <div className="space-y-1 text-xs text-slate-300 pt-1">
                  <span className="text-cyber-muted block">Suggestions:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    {analysis.feedback.suggestions.map((sug: string, i: number) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-cyber-border p-8 text-center text-xs text-cyber-muted">
            Type or click words above to test password entropy and crack-time metrics in real time.
          </div>
        )}
      </div>
    </div>
  );
}
