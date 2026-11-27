"use client";

import React, { useState, useEffect } from "react";
import { Scenario, Decision } from "@/lib/types";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
} from "lucide-react";

interface VoiceCallSimulatorProps {
  scenario: Scenario;
  onDecision: (decision: Decision, timeMs: number) => void;
  startTime: number;
}

export function VoiceCallSimulator({
  scenario,
  onDecision,
  startTime,
}: VoiceCallSimulatorProps) {
  const [callActive, setCallActive] = useState<boolean>(false);
  const [revealedLinesCount, setRevealedLinesCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const { scenarioContent } = scenario;

  const transcript = scenarioContent.callTranscript || [
    { speaker: "caller", text: scenarioContent.body, delaySec: 0 },
  ];

  // Auto-reveal transcript lines sequentially to simulate audio stream
  useEffect(() => {
    if (!callActive) return;

    if (revealedLinesCount < transcript.length) {
      const timer = setTimeout(() => {
        setRevealedLinesCount((prev) => prev + 1);
      }, (transcript[revealedLinesCount]?.delaySec || 3) * 1000);
      return () => clearTimeout(timer);
    }
  }, [callActive, revealedLinesCount, transcript]);

  const handleAction = (decision: Decision) => {
    const elapsed = Date.now() - startTime;
    onDecision(decision, elapsed);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-sm rounded-[36px] border-[5px] border-slate-700 bg-black p-2 shadow-2xl overflow-hidden relative">
        <div className="mx-auto h-4 w-28 rounded-b-xl bg-slate-800 flex items-center justify-center">
          <div className="h-1.5 w-10 rounded-full bg-slate-900" />
        </div>

        {/* Screen */}
        <div className="mt-1 flex flex-col h-[620px] rounded-[28px] bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden text-white p-5 justify-between">
          {!callActive ? (
            /* Incoming Ringing State */
            <div className="flex flex-col items-center justify-between h-full py-8 text-center animate-fadeIn">
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  Incoming Voice Call
                </span>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-800/80 border-2 border-cyan-500/30 animate-pulse">
                  <User className="h-12 w-12 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    {scenarioContent.senderName || "Unknown Caller"}
                  </h3>
                  <p className="text-xs text-cyber-muted font-mono mt-0.5">
                    {scenarioContent.phoneCallerId || "+91 (Verified Spoofed Caller ID)"}
                  </p>
                </div>
              </div>

              {/* Call Controls: Decline or Accept */}
              <div className="w-full space-y-4">
                <div className="flex items-center justify-around">
                  <button
                    onClick={() => handleAction("REPORT_PHISH")}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-950/60 transition group-hover:scale-105">
                      <PhoneOff className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-[11px] font-semibold text-rose-300">Decline & Report</span>
                  </button>

                  <button
                    onClick={() => {
                      setCallActive(true);
                      setRevealedLinesCount(1);
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/60 transition group-hover:scale-105 animate-bounce">
                      <PhoneCall className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-300">Answer Call</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Pick up to listen to audio transcript</p>
              </div>
            </div>
          ) : (
            /* Active Call Streaming State */
            <div className="flex flex-col h-full justify-between space-y-3">
              {/* Call Header */}
              <div className="text-center border-b border-slate-800 pb-3">
                <span className="text-[10px] rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 font-bold uppercase tracking-wider">
                  Call in Progress • 00:24
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-1">
                  {scenarioContent.senderName || "Incoming Audio Stream"}
                </h4>
                <p className="text-[10px] text-cyber-muted font-mono">{scenarioContent.phoneCallerId}</p>
              </div>

              {/* Audio Transcript Ticker */}
              <div className="flex-1 overflow-y-auto space-y-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                {transcript.slice(0, revealedLinesCount).map((line, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-2.5 leading-relaxed animate-fadeIn ${
                      line.speaker === "caller"
                        ? "bg-slate-800/80 text-slate-200 border-l-2 border-rose-500"
                        : "bg-cyan-950/40 text-cyan-200 border-l-2 border-cyan-400"
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-cyber-muted block mb-0.5 font-mono">
                      {line.speaker === "caller" ? "Caller (Audio)" : "You"}
                    </span>
                    {line.text}
                  </div>
                ))}
                {revealedLinesCount < transcript.length && (
                  <div className="flex items-center gap-2 text-[11px] text-cyber-muted animate-pulse">
                    <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Caller is speaking...</span>
                  </div>
                )}
              </div>

              {/* Decision Actions Bar */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAction("REPORT_PHISH")}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2.5 text-xs font-bold transition shadow-lg shadow-rose-950/60"
                  >
                    <PhoneOff className="h-4 w-4" />
                    <span>Hang Up & Report</span>
                  </button>

                  <button
                    onClick={() => handleAction("ESCALATE_SOC")}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white py-2.5 text-xs font-bold transition"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Escalate / Callback</span>
                  </button>
                </div>

                <button
                  onClick={() => handleAction("COMPLY_REQUEST")}
                  className="w-full text-center text-[10px] text-slate-500 hover:text-slate-400 py-1"
                >
                  Simulate: Comply with Caller Demand
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
