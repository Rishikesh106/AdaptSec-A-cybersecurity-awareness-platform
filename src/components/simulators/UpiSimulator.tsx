"use client";

import React, { useState } from "react";
import { Scenario, Decision } from "@/lib/types";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";

interface UpiSimulatorProps {
  scenario: Scenario;
  onDecision: (decision: Decision, timeMs: number) => void;
  startTime: number;
}

export function UpiSimulator({ scenario, onDecision, startTime }: UpiSimulatorProps) {
  const [pinInput, setPinInput] = useState<string>("");
  const [showPinWarning, setShowPinWarning] = useState<boolean>(false);
  const { scenarioContent } = scenario;

  const handleAction = (decision: Decision) => {
    const elapsed = Date.now() - startTime;
    onDecision(decision, elapsed);
  };

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 6) {
      const next = pinInput + digit;
      setPinInput(next);
      if (next.length >= 4) {
        setShowPinWarning(true);
      }
    }
  };

  const clearPin = () => {
    setPinInput("");
    setShowPinWarning(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-sm rounded-[36px] border-[5px] border-slate-700 bg-black p-2 shadow-2xl overflow-hidden relative">
        <div className="mx-auto h-4 w-28 rounded-b-xl bg-slate-800 flex items-center justify-center">
          <div className="h-1.5 w-10 rounded-full bg-slate-900" />
        </div>

        {/* UPI Application Screen */}
        <div className="mt-1 flex flex-col h-[640px] rounded-[28px] bg-gradient-to-b from-[#18122B] to-[#0f0c1b] overflow-hidden text-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-purple-900/30 bg-[#251947]/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 font-bold text-xs">
                ⚡
              </div>
              <span className="font-bold text-xs tracking-tight">Bharat UPI Payment Gateway</span>
            </div>
            <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] text-purple-300 font-mono">
              NPCI SECURE
            </span>
          </div>

          {/* Payment Request Card */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                Payment Collect Request
              </span>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                ₹{(scenarioContent.upiAmount || 15000).toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Requested by: <span className="text-purple-300">{scenarioContent.upiMerchantName || "OLX Clearance"}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                VPA: {scenarioContent.upiVpa || "merchant98218@paytm"}
              </p>
              {scenarioContent.upiNote && (
                <div className="mt-2 rounded-lg bg-black/40 px-3 py-1.5 text-xs text-amber-300 border border-amber-500/20">
                  Note: &quot;{scenarioContent.upiNote}&quot;
                </div>
              )}
            </div>

            {/* Critical Security Warning Card */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>The Golden Rule of UPI</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Entering your UPI PIN will <strong>DEBIT</strong> ₹{(scenarioContent.upiAmount || 15000).toLocaleString("en-IN")} from your bank account. You <strong>never</strong> enter a PIN to receive funds.
              </p>
            </div>

            {/* Virtual PIN Pad simulation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Enter 4 or 6-digit UPI PIN:</span>
                <button onClick={clearPin} className="text-[10px] text-purple-400 hover:underline">
                  Clear
                </button>
              </div>
              <div className="flex justify-center gap-2 py-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`h-9 w-9 rounded-xl border flex items-center justify-center text-lg font-bold ${
                      pinInput.length > idx
                        ? "border-purple-400 bg-purple-500/20 text-white"
                        : "border-slate-700 bg-slate-900 text-slate-600"
                    }`}
                  >
                    {pinInput.length > idx ? "•" : ""}
                  </div>
                ))}
              </div>

              {/* Virtual Keypad digits */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "✓"].map((key, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (key === "C") clearPin();
                      else if (key === "✓") {
                        if (pinInput.length >= 4) {
                          handleAction("APPROVE_PAYMENT");
                        }
                      } else {
                        handlePinDigit(key.toString());
                      }
                    }}
                    className="rounded-xl border border-purple-900/40 bg-purple-950/30 py-2.5 text-sm font-bold text-slate-200 hover:bg-purple-800/40 active:scale-95 transition"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-purple-900/40 bg-[#160f29] p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAction("REPORT_PHISH")}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2.5 text-xs font-bold transition shadow-lg shadow-rose-950/50"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Decline & Report</span>
              </button>

              <button
                onClick={() => handleAction("APPROVE_PAYMENT")}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white py-2.5 text-xs font-bold transition"
              >
                <span>Authorize & Pay</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
