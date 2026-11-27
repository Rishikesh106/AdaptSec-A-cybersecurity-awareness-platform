"use client";

import React, { useState } from "react";
import { Scenario, Decision } from "@/lib/types";
import {
  ShieldAlert,
  ShieldCheck,
  Flag,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  FileWarning,
  ExternalLink,
  MessageSquare,
  Lock,
} from "lucide-react";

interface SmsWhatsappSimulatorProps {
  scenario: Scenario;
  onDecision: (decision: Decision, timeMs: number) => void;
  startTime: number;
}

export function SmsWhatsappSimulator({
  scenario,
  onDecision,
  startTime,
}: SmsWhatsappSimulatorProps) {
  const isWhatsApp = scenario.channel === "WHATSAPP";
  const { scenarioContent } = scenario;

  const handleAction = (decision: Decision) => {
    const elapsed = Date.now() - startTime;
    onDecision(decision, elapsed);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Phone Hardware Mockup Frame */}
      <div className="w-full max-w-sm rounded-[36px] border-[5px] border-slate-700 bg-black p-2 shadow-2xl overflow-hidden relative">
        {/* Notch / Speaker bar */}
        <div className="mx-auto h-4 w-28 rounded-b-xl bg-slate-800 flex items-center justify-center">
          <div className="h-1.5 w-10 rounded-full bg-slate-900" />
        </div>

        {/* Screen Display Container */}
        <div
          className={`mt-1 flex flex-col h-[600px] rounded-[28px] overflow-hidden ${
            isWhatsApp ? "bg-[#0c1317]" : "bg-slate-950"
          }`}
        >
          {/* Top Messaging App Header */}
          {isWhatsApp ? (
            /* WhatsApp Header */
            <div className="flex items-center justify-between bg-[#1f2c34] px-3 py-2.5 text-white border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-600 font-bold text-xs text-white">
                  {(scenarioContent.senderName || scenarioContent.phoneCallerId || "?")[0]}
                </div>
                <div>
                  <h4 className="text-xs font-semibold leading-tight text-slate-100">
                    {scenarioContent.senderName || scenarioContent.phoneCallerId}
                  </h4>
                  <p className="text-[10px] text-emerald-400">online</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Video className="h-4 w-4" />
                <Phone className="h-4 w-4" />
                <MoreVertical className="h-4 w-4" />
              </div>
            </div>
          ) : (
            /* SMS Header */
            <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-xs text-white">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {scenarioContent.phoneCallerId || "SMS Alert"}
                  </h4>
                  <p className="text-[10px] text-slate-400">Standard SMS/MMS</p>
                </div>
              </div>
              <span className="text-[10px] rounded bg-slate-800 px-2 py-0.5 text-slate-300">Carrier</span>
            </div>
          )}

          {/* Chat Messages Body Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Encryption notice */}
            <div className="mx-auto flex max-w-[220px] items-center justify-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-center text-[10px] text-amber-300/80">
              <Lock className="h-3 w-3 shrink-0" />
              <span>Messages are simulated for security training</span>
            </div>

            {/* Inbound Attack Message Bubble */}
            <div className="flex flex-col items-start space-y-1">
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md ${
                  isWhatsApp
                    ? "rounded-tl-none bg-[#202c33] text-slate-100 border border-slate-700/40"
                    : "rounded-tl-none bg-slate-800 text-slate-100 border border-slate-700/50"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">{scenarioContent.body}</p>

                {/* Attachments inside mobile bubble if any */}
                {scenarioContent.attachments && scenarioContent.attachments.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {scenarioContent.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-xl bg-black/40 p-2 border border-slate-700/60"
                      >
                        <FileWarning className="h-5 w-5 text-rose-400 shrink-0" />
                        <div className="text-[11px] overflow-hidden">
                          <p className="font-semibold text-rose-300 truncate">{att.fileName}</p>
                          <p className="text-[9px] text-slate-400">{att.fileSize} • Android Package</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Links inside message bubble */}
                {scenarioContent.links && scenarioContent.links.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-slate-700/40 pt-1.5">
                    {scenarioContent.links.map((link, i) => (
                      <div
                        key={i}
                        onClick={() => handleAction("CLICK_LINK")}
                        className="flex items-center gap-1 text-[11px] text-cyan-400 underline font-mono cursor-pointer hover:text-cyan-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate">{link.actualUrl}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                  <span>10:42 AM</span>
                  {isWhatsApp && <CheckCheck className="h-3 w-3 text-cyan-400" />}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Mobile Action Buttons */}
          <div className="border-t border-slate-800 bg-[#111b21] p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAction("REPORT_PHISH")}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2 text-xs font-bold transition shadow-lg shadow-rose-950/40"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Report & Block</span>
              </button>

              <button
                onClick={() => handleAction("IGNORE_SAFE")}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 text-xs font-medium border border-slate-700 transition"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Safe / Ignore</span>
              </button>
            </div>

            <button
              onClick={() => handleAction("CLICK_LINK")}
              className="w-full text-center text-[10px] text-slate-500 hover:text-slate-400 py-1"
            >
              Simulate: Tap Link / Download File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
