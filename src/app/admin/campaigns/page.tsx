"use client";

import React, { useState } from "react";
import { SEED_TRACKS } from "@/data/seedTracks";
import { Campaign } from "@/lib/types";
import {
  ShieldAlert,
  Calendar,
  Users,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Mail,
} from "lucide-react";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "camp-1",
      title: "Q4 2026 Executive Phishing & Smishing Resilience Campaign",
      description: "Mandatory corporate defense simulation and assessment for all engineering and finance personnel.",
      trackTitle: "Phishing, Smishing & Social Communication Defense",
      trackId: "track-phishing",
      targetDepartment: "Engineering & Finance",
      deadline: "2026-12-15",
      assignedCount: 48,
      completedCount: 38,
      averageScore: 82.5,
      status: "ACTIVE",
    },
    {
      id: "camp-2",
      title: "UPI & Digital Payment Fraud Defense Drive",
      description: "Equipping customer-facing and accounts staff against QR reverse traps and fake invoices.",
      trackTitle: "UPI, Digital Payments & Financial Fraud",
      trackId: "track-payments",
      targetDepartment: "Finance & Accounts",
      deadline: "2026-12-20",
      assignedCount: 24,
      completedCount: 19,
      averageScore: 78.0,
      status: "ACTIVE",
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDesc, setNewDesc] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>(SEED_TRACKS[0].id);
  const [selectedDept, setSelectedDept] = useState<string>("All Departments");
  const [reminderLogs, setReminderLogs] = useState<string[]>([]);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const trackObj = SEED_TRACKS.find((t) => t.id === selectedTrack);
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      title: newTitle,
      description: newDesc || "Company-wide cybersecurity behavioral drive.",
      trackTitle: trackObj ? trackObj.title : "Custom Defense Set",
      trackId: selectedTrack,
      targetDepartment: selectedDept,
      deadline: "2026-12-31",
      assignedCount: 64,
      completedCount: 0,
      averageScore: 0,
      status: "ACTIVE",
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    setShowCreateModal(false);
    setNewTitle("");
    setNewDesc("");
  };

  const handleDispatchReminders = (campaignTitle: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMsg = `[EMAIL DISPATCH ${timestamp}] Console Mock Adapter: Sent 12 automated email nudges to incomplete assignees for "${campaignTitle}".`;
    console.log(logMsg);
    setReminderLogs((prev) => [logMsg, ...prev]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-[#0b1329] via-[#09152b] to-[#0d1838] p-6 sm:p-8 space-y-3 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Workforce Campaign Orchestrator
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Training & Simulation Campaigns
            </h1>
            <p className="text-xs text-cyber-muted max-w-xl">
              Schedule corporate-wide training drives, track deadline compliance, and dispatch automated reminder emails.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2.5 text-xs shadow-lg shadow-cyan-950/40 transition hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>New Campaign Drive</span>
          </button>
        </div>
      </div>

      {/* Reminder Console Logs Output */}
      {reminderLogs.length > 0 && (
        <div className="rounded-2xl border border-cyber-border bg-[#050811] p-4 space-y-1.5 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Mail className="h-3.5 w-3.5" />
            <span>Email Provider Console Output (Console / Mock Adapter)</span>
          </div>
          {reminderLogs.map((log, idx) => (
            <p key={idx} className="text-emerald-300 text-[11px] leading-relaxed">
              {log}
            </p>
          ))}
        </div>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((camp) => {
          const completionPct = camp.assignedCount > 0 ? Math.round((camp.completedCount / camp.assignedCount) * 100) : 0;

          return (
            <div
              key={camp.id}
              className="rounded-3xl border border-cyber-border bg-cyber-card p-6 space-y-4 shadow-xl hover:border-cyan-500/40 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 font-mono">
                      {camp.status}
                    </span>
                    <span className="text-xs text-cyber-muted font-mono">
                      Target: {camp.targetDepartment}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{camp.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDispatchReminders(camp.title)}
                    className="flex items-center gap-1.5 rounded-xl border border-cyber-border bg-[#050811] hover:border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                    title="Send automated reminder email via console adapter"
                  >
                    <Send className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Send Reminders</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-cyber-muted block">ASSIGNED</span>
                  <span className="text-white font-bold">{camp.assignedCount} Personnel</span>
                </div>
                <div>
                  <span className="text-[10px] text-cyber-muted block">COMPLETED</span>
                  <span className="text-emerald-400 font-bold">{camp.completedCount} ({completionPct}%)</span>
                </div>
                <div>
                  <span className="text-[10px] text-cyber-muted block">AVG MASTERY SCORE</span>
                  <span className="text-cyan-400 font-bold">{camp.averageScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-cyber-muted block">DEADLINE</span>
                  <span className="text-amber-400 font-bold">{camp.deadline}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyber-secondary"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateCampaign}
            className="w-full max-w-lg rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <h3 className="font-bold text-base text-white">Create New Campaign Drive</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-cyber-muted hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Campaign Title</label>
              <input
                type="text"
                placeholder="e.g. Q1 2027 Urgent Executive Deepfake Vishing Drive"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-cyber-border bg-[#050811] px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Curriculum Learning Track</label>
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full rounded-xl border border-cyber-border bg-[#050811] px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
              >
                {SEED_TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full rounded-xl border border-cyber-border bg-[#050811] px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
              >
                <option value="All Departments">All Departments (116 users)</option>
                <option value="Finance & Accounts">Finance & Accounts (24 users)</option>
                <option value="Engineering & IT">Engineering & IT (68 users)</option>
                <option value="Human Resources">Human Resources (16 users)</option>
                <option value="Executive Leadership">Executive Leadership (8 users)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-cyber-border">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl border border-cyber-border bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2 text-xs shadow-lg shadow-cyan-950/40"
              >
                Deploy Campaign
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
