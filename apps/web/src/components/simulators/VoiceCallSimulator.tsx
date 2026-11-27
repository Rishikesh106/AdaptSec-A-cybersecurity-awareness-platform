"use client";

import React, { useState, useEffect } from "react";
import type { SimulatorProps } from "./InboxSimulator";
import { PhoneCall, PhoneOff, ShieldAlert, ShieldCheck } from "lucide-react";

export function VoiceCallSimulator({
  scenario,
  onSubmitDecision,
  isSubmitting,
}: SimulatorProps) {
  const [answered, setAnswered] = useState(false);
  const [revealedCount, setRevealedCount] = useState(1);
  const c = scenario.contentJson || {};

  const lines: Array<{ speaker: string; text: string }> = Array.isArray(
    c.callTranscript
  )
    ? c.callTranscript
    : [{ speaker: "caller", text: c.body || "" }];

  useEffect(() => {
    if (!answered || revealedCount >= lines.length) return;
    const t = setTimeout(() => setRevealedCount((n) => n + 1), 2200);
    return () => clearTimeout(t);
  }, [answered, revealedCount, lines.length]);

  return (
    <div className="flex justify-center">
      <div className="max-w-md w-full rounded-lg border border-border bg-surface shadow-card overflow-hidden">
        <div className="border-b border-border bg-canvas px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-primary">
            <PhoneCall className="h-4 w-4 text-brand" strokeWidth={1.75} />
            <span>Voice Call Transcript</span>
          </div>
          <span className="text-xs font-mono text-ink-muted">
            {c.phoneCallerId || "Unknown Caller"}
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-center border-b border-border pb-3">
            <div className="text-sm font-semibold text-ink-primary">
              {c.senderName || "Incoming Call"}
            </div>
            <div className="text-xs font-mono text-ink-muted">
              {c.phoneCallerId}
            </div>
          </div>

          {!answered ? (
            <div className="py-6 text-center space-y-4">
              <p className="text-xs text-ink-secondary">
                Answer the call to review the live audio transcript and decide how to respond.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onSubmitDecision("REPORT_PHISH")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-risk-high px-3.5 py-2 text-xs font-medium text-white hover:bg-red-700"
                >
                  <PhoneOff className="h-3.5 w-3.5" />
                  <span>Decline & report</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAnswered(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-xs font-medium text-white hover:bg-brand-hover"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Answer call</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md border border-border bg-canvas p-3.5 space-y-2.5 max-h-64 overflow-y-auto">
                {lines.slice(0, revealedCount).map((line, i) => (
                  <div
                    key={i}
                    className="rounded border border-border bg-surface p-2.5 text-xs text-ink-primary"
                  >
                    <span className="font-semibold uppercase text-[10px] text-ink-muted block mb-0.5">
                      {line.speaker === "caller" ? "Caller" : "You"}
                    </span>
                    {line.text}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onSubmitDecision("REPORT_PHISH")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-risk-high px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                >
                  <PhoneOff className="h-3.5 w-3.5" />
                  <span>Hang up & report</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onSubmitDecision("IGNORE_SAFE")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-ink-primary hover:bg-subtle"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-risk-low" />
                  <span>Legitimate call</span>
                </button>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onSubmitDecision("COMPLY_REQUEST")}
                className="w-full text-center text-xs text-ink-muted hover:text-ink-primary"
              >
                Simulate complying with caller request
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
