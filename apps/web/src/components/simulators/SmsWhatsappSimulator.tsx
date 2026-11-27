"use client";

import React from "react";
import type { SimulatorProps } from "./InboxSimulator";
import { ShieldAlert, ShieldCheck, MessageSquare, ExternalLink, FileText } from "lucide-react";

export function SmsWhatsappSimulator({
  scenario,
  onSubmitDecision,
  isSubmitting,
}: SimulatorProps) {
  const c = scenario.contentJson || {};
  const isWhatsApp = scenario.channel === "WHATSAPP";

  return (
    <div className="flex justify-center">
      <div className="max-w-sm w-full rounded-lg border border-border bg-surface shadow-card overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-canvas px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-4 w-4 text-brand" strokeWidth={1.75} />
            <div>
              <div className="text-xs font-semibold text-ink-primary">
                {c.senderName || c.phoneCallerId || "Unknown"}
              </div>
              <div className="text-[11px] font-mono text-ink-muted">
                {c.phoneCallerId || (isWhatsApp ? "WhatsApp" : "SMS")}
              </div>
            </div>
          </div>
          <span className="rounded bg-subtle px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
            {isWhatsApp ? "WhatsApp" : "SMS"}
          </span>
        </div>

        {/* Message Thread */}
        <div className="p-4 bg-canvas min-h-[320px] space-y-3">
          <div className="rounded-md border border-border bg-surface p-3.5 text-sm text-ink-primary space-y-2 shadow-card">
            <p className="whitespace-pre-line leading-relaxed">{c.body}</p>

            {Array.isArray(c.attachments) && c.attachments.length > 0 && (
              <div className="rounded border border-border bg-canvas p-2 text-xs flex items-center gap-2">
                <FileText className="h-4 w-4 text-risk-high shrink-0" />
                <span className="font-mono text-ink-primary truncate">
                  {c.attachments[0].fileName}
                </span>
              </div>
            )}

            {Array.isArray(c.links) && c.links.length > 0 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onSubmitDecision("CLICK_LINK")}
                className="inline-flex items-center gap-1 text-xs font-mono text-brand underline hover:text-brand-hover"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="truncate max-w-[260px]">
                  {c.links[0].actualUrl}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border bg-surface p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmitDecision("REPORT_PHISH")}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-risk-high px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Report & block</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmitDecision("IGNORE_SAFE")}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-ink-primary hover:bg-subtle disabled:opacity-50"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-risk-low" />
              <span>Mark as safe</span>
            </button>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmitDecision("CLICK_LINK")}
            className="w-full text-center text-xs text-ink-muted hover:text-ink-primary py-1"
          >
            Simulate tapping link / file
          </button>
        </div>
      </div>
    </div>
  );
}
