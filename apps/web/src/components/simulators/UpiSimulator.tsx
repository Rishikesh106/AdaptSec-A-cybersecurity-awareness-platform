"use client";

import React, { useState } from "react";
import type { SimulatorProps } from "./InboxSimulator";
import { ShieldAlert, CreditCard, AlertTriangle } from "lucide-react";

export function UpiSimulator({
  scenario,
  onSubmitDecision,
  isSubmitting,
}: SimulatorProps) {
  const [pin, setPin] = useState("");
  const c = scenario.contentJson || {};

  return (
    <div className="flex justify-center">
      <div className="max-w-sm w-full rounded-lg border border-border bg-surface shadow-card overflow-hidden">
        <div className="border-b border-border bg-canvas px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-primary">
            <CreditCard className="h-4 w-4 text-brand" strokeWidth={1.75} />
            <span>UPI Payment Request</span>
          </div>
          <span className="text-[11px] font-mono text-ink-muted">NPCI</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-md border border-border bg-canvas p-4 text-center space-y-1">
            <div className="text-xs text-ink-muted">Amount</div>
            <div className="text-2xl font-semibold text-ink-primary tabular-nums">
              Rs. {Number(c.upiAmount || 15000).toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-ink-secondary pt-1">
              Payee: <span className="font-medium text-ink-primary">{c.senderName || "Merchant"}</span>
            </div>
            <div className="text-xs font-mono text-ink-muted">
              VPA: {c.upiVpa || "payee@oknord"}
            </div>
          </div>

          <p className="text-xs text-ink-secondary leading-relaxed">{c.body}</p>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              UPI protocol rule: entering your PIN always debits your account. Never enter a PIN to receive money.
            </span>
          </div>

          <div>
            <label
              htmlFor="upi-pin-input"
              className="block text-xs font-medium text-ink-primary mb-1"
            >
              Simulated UPI PIN (optional test)
            </label>
            <input
              id="upi-pin-input"
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-mono tracking-widest text-ink-primary focus:border-brand focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmitDecision("REPORT_PHISH")}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-risk-high px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Decline & report</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmitDecision("APPROVE_PAYMENT")}
              className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-ink-primary hover:bg-subtle disabled:opacity-50"
            >
              Authorize & pay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
