"use client";

import React, { useState } from "react";
import { Scenario, Decision } from "@/lib/types";
import {
  Mail,
  ShieldAlert,
  ShieldCheck,
  Paperclip,
  Clock,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  FileText,
  FileCode,
  Download,
  Info,
  Send,
  Flag,
  Trash2,
} from "lucide-react";

interface InboxSimulatorProps {
  scenario: Scenario;
  onDecision: (decision: Decision, timeMs: number) => void;
  startTime: number;
}

export function InboxSimulator({ scenario, onDecision, startTime }: InboxSimulatorProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState<boolean>(false);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
  const [showHeaders, setShowHeaders] = useState<boolean>(false);

  const { scenarioContent } = scenario;

  const handleAction = (decision: Decision) => {
    const elapsed = Date.now() - startTime;
    onDecision(decision, elapsed);
  };

  return (
    <div className="flex flex-col h-[750px] rounded-2xl border border-cyber-border bg-[#0b111e] overflow-hidden shadow-2xl relative">
      {/* Mail Client Chrome Bar */}
      <div className="flex items-center justify-between border-b border-cyber-border bg-[#080d18] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-semibold text-slate-300 ml-2">Outlook Cloud Web Access</span>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction("REPORT_PHISH")}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 px-3 py-1.5 text-xs font-bold transition shadow-lg shadow-rose-950/40"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>Report Phishing</span>
          </button>

          <button
            onClick={() => handleAction("ESCALATE_SOC")}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-3 py-1.5 text-xs font-bold transition"
          >
            <Flag className="h-3.5 w-3.5 text-amber-400" />
            <span>Escalate to SOC</span>
          </button>

          <button
            onClick={() => handleAction("IGNORE_SAFE")}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-cyber-border text-slate-200 px-3 py-1.5 text-xs font-medium transition"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Mark as Safe</span>
          </button>
        </div>
      </div>

      {/* Email Body & Header View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Folder Nav (Desktop) */}
        <div className="hidden md:flex w-48 flex-col border-r border-cyber-border bg-[#080d18]/60 p-3 text-xs space-y-1">
          <div className="flex items-center justify-between rounded-lg bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1.5 text-cyan-300 font-medium">
            <span className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> Inbox
            </span>
            <span className="rounded bg-cyan-500/20 px-1.5 text-[10px] font-bold">1</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-400 hover:bg-slate-800/40 cursor-pointer">
            <Send className="h-3.5 w-3.5" /> Sent Items
          </div>
          <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-400 hover:bg-slate-800/40 cursor-pointer">
            <Flag className="h-3.5 w-3.5" /> Flagged
          </div>
          <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-400 hover:bg-slate-800/40 cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" /> Deleted Items
          </div>
        </div>

        {/* Message Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Subject Line */}
          <div className="border-b border-cyber-border pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              {scenarioContent.subject || scenario.title}
            </h2>
          </div>

          {/* Sender & Recipient Metadata */}
          <div className="rounded-xl border border-cyber-border bg-[#0d1627] p-3.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 font-bold text-white text-sm">
                  {(scenarioContent.senderName || "Unknown")[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm">
                      {scenarioContent.senderName || "Unknown Sender"}
                    </span>
                    <span className="text-xs text-cyber-muted font-mono">
                      &lt;{scenarioContent.senderAddress || "unknown@domain.com"}&gt;
                    </span>
                  </div>
                  <p className="text-xs text-cyber-muted">
                    To: <span className="text-slate-300">{scenarioContent.recipientName || "Alex Mercer"}</span> &lt;{scenarioContent.recipientAddress || "alex.mercer@enterprise.org"}&gt;
                  </p>
                </div>
              </div>

              {/* Header Inspector Toggle */}
              <button
                onClick={() => setShowHeaders(!showHeaders)}
                className="flex items-center gap-1 rounded border border-cyber-border bg-slate-800/60 px-2 py-1 text-[11px] text-cyber-muted hover:text-white transition"
              >
                <Info className="h-3 w-3" />
                <span>{showHeaders ? "Hide Email Headers" : "Inspect Headers"}</span>
                <ChevronDown className={`h-3 w-3 transition ${showHeaders ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Expandable Technical Headers */}
            {showHeaders && (
              <div className="mt-3 rounded-lg bg-[#050811] p-3 font-mono text-[11px] text-slate-300 border border-cyber-border space-y-1">
                <p><span className="text-cyber-primary">Sender Domain:</span> {scenarioContent.senderDomain || "N/A"}</p>
                <p><span className="text-cyber-primary">Return-Path:</span> bounce@{scenarioContent.senderDomain || "unknown"}</p>
                <p><span className="text-cyber-primary">Authentication-Results:</span> spf=softfail (sender IP not in authorized SPF record); dkim=neutral</p>
                <p><span className="text-cyber-primary">Security Gateway Status:</span> External Mail Warning Injected</p>
              </div>
            )}
          </div>

          {/* Attachments Section if present */}
          {scenarioContent.attachments && scenarioContent.attachments.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-cyber-muted flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" /> Attachments ({scenarioContent.attachments.length})
              </span>
              <div className="flex flex-wrap gap-2.5">
                {scenarioContent.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedAttachment(att);
                      setShowAttachmentModal(true);
                    }}
                    className="flex items-center gap-2.5 rounded-xl border border-cyber-border bg-[#0d1627] hover:border-cyan-500/40 p-2.5 cursor-pointer transition group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20">
                      {att.fileType === "exe" || att.fileType === "iso" ? (
                        <FileCode className="h-4 w-4 text-rose-400" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-left text-xs">
                      <p className="font-semibold text-slate-200 group-hover:text-cyan-300">{att.fileName}</p>
                      <p className="text-[10px] text-cyber-muted">{att.fileSize} • Click to Inspect</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Body Content */}
          <div className="rounded-xl border border-cyber-border/70 bg-[#070b14] p-5 font-sans leading-relaxed text-sm text-slate-200 whitespace-pre-line">
            {scenarioContent.body}
          </div>

          {/* Hyperlinks Preview / Interactions */}
          {scenarioContent.links && scenarioContent.links.length > 0 && (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 space-y-2">
              <p className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" /> Interactive Link Inspection:
              </p>
              <div className="space-y-2">
                {scenarioContent.links.map((link, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredLink(link.actualUrl)}
                    onMouseLeave={() => setHoveredLink(null)}
                    onClick={() => handleAction("CLICK_LINK")}
                    className="inline-block text-cyan-400 underline font-medium hover:text-cyan-300 cursor-pointer mr-4 text-xs transition"
                  >
                    {link.anchor}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Browser / Email Client Hover Link Tooltip (at bottom left) */}
      {hoveredLink && (
        <div className="absolute bottom-2 left-2 z-30 max-w-lg rounded-md border border-cyber-border bg-[#05070e] px-2.5 py-1 text-[11px] font-mono text-cyan-400 shadow-xl flex items-center gap-1.5 animate-fadeIn">
          <span className="text-cyber-muted">Destination Target:</span>
          <span className="font-bold underline">{hoveredLink}</span>
        </div>
      )}

      {/* Attachment Inspection Modal */}
      {showAttachmentModal && selectedAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-cyber-border bg-cyber-card p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                Attachment Threat Inspection
              </h3>
              <button
                onClick={() => setShowAttachmentModal(false)}
                className="text-cyber-muted hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><span className="text-cyber-muted">File Name:</span> <strong className="text-white">{selectedAttachment.fileName}</strong></p>
              <p><span className="text-cyber-muted">Size:</span> {selectedAttachment.fileSize}</p>
              <p><span className="text-cyber-muted">MIME Type:</span> {selectedAttachment.fileType}</p>
              {selectedAttachment.suspiciousCharacteristics && selectedAttachment.suspiciousCharacteristics.length > 0 && (
                <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 space-y-1">
                  <p className="font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Security Scanner Flags:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                    {selectedAttachment.suspiciousCharacteristics.map((char: string, i: number) => (
                      <li key={i}>{char}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAttachmentModal(false)}
                className="rounded-lg border border-cyber-border bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowAttachmentModal(false);
                  handleAction("CLICK_LINK");
                }}
                className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 text-xs font-bold"
              >
                Run / Open File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
