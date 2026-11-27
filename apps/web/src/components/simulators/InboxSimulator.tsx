"use client";

import React, { useState } from "react";
import {
  Mail,
  Paperclip,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Flag,
  ExternalLink,
  FileText,
  X,
  Info,
} from "lucide-react";

export interface SimulatorProps {
  scenario: {
    id: string;
    title: string;
    channel: string;
    contentJson: Record<string, any>;
  };
  onSubmitDecision: (decision: string) => void;
  isSubmitting: boolean;
}

export function InboxSimulator({
  scenario,
  onSubmitDecision,
  isSubmitting,
}: SimulatorProps) {
  const [showHeaders, setShowHeaders] = useState(false);
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);
  const [inspectAttachment, setInspectAttachment] = useState<any | null>(null);

  const c = scenario.contentJson || {};
  const headers = c.headers || {
    spf: "softfail",
    dkim: "neutral",
    dmarc: "fail",
    returnPath: `bounce@${c.senderDomain || "external.example"}`,
  };

  return (
    <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden relative">
      {/* Mail Client Toolbar */}
      <div className="border-b border-border bg-canvas px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
          <Mail className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
          <span>Enterprise Mail Client · Inbox</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmitDecision("REPORT_PHISH")}
            className="inline-flex items-center gap-1.5 rounded-md bg-risk-high px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Report phish</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmitDecision("ESCALATE_SOC")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-subtle disabled:opacity-50"
          >
            <Flag className="h-3.5 w-3.5 text-risk-medium" />
            <span>Escalate to SOC</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmitDecision("IGNORE_SAFE")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-subtle disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-risk-low" />
            <span>Mark as safe</span>
          </button>
        </div>
      </div>

      {/* Email Header & Content */}
      <div className="p-6 space-y-5">
        <h2 className="text-lg font-semibold text-ink-primary border-b border-border pb-3">
          {c.subject || scenario.title}
        </h2>

        <div className="rounded-md border border-border bg-canvas p-4 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="text-sm">
              <div className="font-semibold text-ink-primary">
                {c.senderName || "Unknown Sender"}{" "}
                <span className="font-mono text-xs font-normal text-ink-secondary">
                  &lt;{c.senderAddress || "unknown@external.example"}&gt;
                </span>
              </div>
              <div className="text-xs text-ink-muted mt-0.5">
                To: {c.recipientName || "Employee"} &lt;
                {c.recipientAddress || "employee@company.in"}&gt;
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHeaders((v) => !v)}
              className="inline-flex items-center gap-1 rounded border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink-secondary hover:text-ink-primary"
            >
              <Info className="h-3.5 w-3.5" />
              <span>{showHeaders ? "Hide headers" : "Inspect headers"}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  showHeaders ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {showHeaders && (
            <div className="mt-2 rounded border border-border bg-surface p-3 font-mono text-xs text-ink-secondary space-y-1">
              <div>
                <span className="font-semibold text-ink-primary">Return-Path:</span>{" "}
                {headers.returnPath}
              </div>
              <div>
                <span className="font-semibold text-ink-primary">SPF:</span>{" "}
                {headers.spf} ·{" "}
                <span className="font-semibold text-ink-primary">DKIM:</span>{" "}
                {headers.dkim} ·{" "}
                <span className="font-semibold text-ink-primary">DMARC:</span>{" "}
                {headers.dmarc}
              </div>
              <div>
                <span className="font-semibold text-ink-primary">Sender Domain:</span>{" "}
                {c.senderDomain || "unknown"}
              </div>
            </div>
          )}
        </div>

        {/* Attachments */}
        {Array.isArray(c.attachments) && c.attachments.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-ink-muted flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5" />
              <span>Attachments ({c.attachments.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.attachments.map((att: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInspectAttachment(att)}
                  className="flex items-center gap-2.5 rounded-md border border-border bg-canvas px-3 py-2 text-left hover:bg-subtle"
                >
                  <FileText className="h-4 w-4 text-ink-secondary" />
                  <div className="text-xs">
                    <div className="font-medium text-ink-primary">
                      {att.fileName}
                    </div>
                    <div className="text-ink-muted">
                      {att.fileSize} · Click to inspect
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="rounded-md border border-border bg-surface p-5 text-sm text-ink-primary leading-relaxed whitespace-pre-line">
          {c.body}
        </div>

        {/* Interactive Links */}
        {Array.isArray(c.links) && c.links.length > 0 && (
          <div className="rounded-md border border-border bg-canvas p-4 space-y-2">
            <div className="text-xs font-medium text-ink-muted flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Embedded hyperlinks (hover to inspect destination URL)</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {c.links.map((link: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isSubmitting}
                  onMouseEnter={() => setHoveredUrl(link.actualUrl)}
                  onMouseLeave={() => setHoveredUrl(null)}
                  onFocus={() => setHoveredUrl(link.actualUrl)}
                  onBlur={() => setHoveredUrl(null)}
                  onClick={() => onSubmitDecision("CLICK_LINK")}
                  className="text-sm font-medium text-brand underline hover:text-brand-hover"
                >
                  {link.anchor}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hover URL Status Bar */}
      {hoveredUrl && (
        <div className="border-t border-border bg-subtle px-4 py-1.5 font-mono text-xs text-ink-primary">
          Target URL: <span className="font-semibold">{hoveredUrl}</span>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {inspectAttachment && (
        <div
          role="dialog"
          aria-label="Attachment inspection"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <div className="max-w-md w-full rounded-lg border border-border bg-surface p-5 shadow-popover space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="text-sm font-semibold text-ink-primary">
                Attachment Inspection
              </h3>
              <button
                type="button"
                onClick={() => setInspectAttachment(null)}
                aria-label="Close attachment modal"
                className="text-ink-muted hover:text-ink-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs space-y-1.5 text-ink-secondary">
              <div>
                <span className="font-medium text-ink-primary">File name:</span>{" "}
                <span className="font-mono">{inspectAttachment.fileName}</span>
              </div>
              <div>
                <span className="font-medium text-ink-primary">Size:</span>{" "}
                {inspectAttachment.fileSize}
              </div>
              <div>
                <span className="font-medium text-ink-primary">Type:</span>{" "}
                {inspectAttachment.fileType}
              </div>
              {Array.isArray(inspectAttachment.suspiciousCharacteristics) &&
                inspectAttachment.suspiciousCharacteristics.length > 0 && (
                  <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2.5 text-amber-900">
                    <div className="font-semibold mb-1">Scanner Notes</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {inspectAttachment.suspiciousCharacteristics.map(
                        (item: string, i: number) => (
                          <li key={i}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setInspectAttachment(null)}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-subtle"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setInspectAttachment(null);
                  onSubmitDecision("CLICK_LINK");
                }}
                className="rounded-md bg-risk-high px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                Open attachment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
