"use client";

import React, { useState } from "react";
import { ALL_SEED_SCENARIOS } from "@/data/seedScenarios";
import { Scenario, Channel, Difficulty, Decision } from "@/lib/types";
import {
  PenTool,
  Plus,
  Download,
  Upload,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Save,
  Trash2,
} from "lucide-react";

export default function ContentAuthorStudioPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([...ALL_SEED_SCENARIOS]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(ALL_SEED_SCENARIOS[0]);
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState<string>(selectedScenario.title);
  const [channel, setChannel] = useState<Channel>(selectedScenario.channel);
  const [difficulty, setDifficulty] = useState<Difficulty>(selectedScenario.difficulty);
  const [skillTag, setSkillTag] = useState<string>(selectedScenario.skillTag);
  const [bodyContent, setBodyContent] = useState<string>(selectedScenario.scenarioContent.body);
  const [correctAction, setCorrectAction] = useState<Decision>(selectedScenario.correctAction);
  const [isPublished, setIsPublished] = useState<boolean>(selectedScenario.isPublished);

  const handleSelectScenario = (scen: Scenario) => {
    setSelectedScenario(scen);
    setTitle(scen.title);
    setChannel(scen.channel);
    setDifficulty(scen.difficulty);
    setSkillTag(scen.skillTag);
    setBodyContent(scen.scenarioContent.body);
    setCorrectAction(scen.correctAction);
    setIsPublished(scen.isPublished);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Scenario = {
      ...selectedScenario,
      title,
      channel,
      difficulty,
      skillTag,
      scenarioContent: {
        ...selectedScenario.scenarioContent,
        body: bodyContent,
      },
      correctAction,
      isPublished,
    };

    setScenarios((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedScenario(updated);
    setSaveNotification("✓ Scenario saved and published to live catalog successfully!");
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const handleCreateNew = () => {
    const newScen: Scenario = {
      id: `scen-custom-${Date.now()}`,
      slug: `custom-scenario-${Date.now()}`,
      title: "New Custom Attack Scenario",
      channel: "INBOX",
      difficulty: "INTERMEDIATE",
      skillTag: "phishing",
      description: "Author-created threat simulation.",
      scenarioContent: {
        body: "Enter scenario narrative text here...",
      },
      redFlags: [
        {
          id: `rf-custom-${Date.now()}`,
          category: "URL",
          title: "Suspicious Link",
          explanation: "Pointed to an unauthenticated external server.",
          severity: "HIGH",
        },
      ],
      correctAction: "REPORT_PHISH",
      explanationOnSuccess: "Great detection of the custom threat!",
      explanationOnFailure: "Vulnerability triggered in simulation.",
      whatToDoInstead: "Inspect domains before clicking.",
      isPublished: true,
      orderIndex: scenarios.length + 1,
    };

    setScenarios([newScen, ...scenarios]);
    handleSelectScenario(newScen);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenarios, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `adaptsec_scenarios_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-[#0b1329] to-[#0d1838] p-6 sm:p-8 space-y-3 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Content Authoring & Threat Engineering Studio
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Scenario & Question CMS
            </h1>
            <p className="text-xs text-cyber-muted max-w-xl">
              Design realistic attacks across all 5 channels with real-time preview, embedded red flags, draft/publish controls, and JSON export/import.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3.5 py-2 text-xs shadow-lg shadow-cyan-950/40 transition hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>Create Scenario</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 rounded-xl border border-cyber-border bg-[#050811] hover:border-cyan-500/40 text-slate-300 hover:text-white px-3.5 py-2 text-xs font-semibold transition"
            >
              <Download className="h-4 w-4" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {saveNotification && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs font-bold text-emerald-300 animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* 2-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenarios Catalog Sidebar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-muted font-mono">
              Scenario Catalog ({scenarios.length})
            </h3>
          </div>

          <div className="max-h-[700px] overflow-y-auto space-y-2 pr-1">
            {scenarios.map((scen) => {
              const isSelected = selectedScenario.id === scen.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen)}
                  className={`rounded-2xl border p-3.5 space-y-1.5 cursor-pointer transition ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-200 shadow-md"
                      : "border-cyber-border bg-cyber-card text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-cyan-400 font-bold">{scen.channel}</span>
                    <span className="text-slate-500">{scen.difficulty}</span>
                  </div>
                  <h4 className="font-bold text-xs leading-snug line-clamp-1">{scen.title}</h4>
                  <p className="text-[10px] text-cyber-muted line-clamp-1">{scen.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor & Live Preview Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-cyber-border bg-cyber-card p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isEditing ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-cyber-muted hover:text-white"
                }`}
              >
                Authoring Form
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  !isEditing ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-cyber-muted hover:text-white"
                }`}
              >
                Live Simulator Preview
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1.5 text-cyber-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span>Published to Learners</span>
              </label>
            </div>
          </div>

          {isEditing ? (
            /* Editing Form */
            <form onSubmit={handleSave} className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">Scenario Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-cyber-border bg-[#050811] px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Delivery Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as Channel)}
                    className="w-full rounded-xl border border-cyber-border bg-[#050811] px-3 py-2 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="INBOX">Email Inbox</option>
                    <option value="SMS">SMS Message</option>
                    <option value="WHATSAPP">WhatsApp Chat</option>
                    <option value="UPI">UPI Payment Trap</option>
                    <option value="VOICE_CALL">Voice / Vishing Call</option>
                    <option value="FAKE_LOGIN">Fake Login Spotter</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full rounded-xl border border-cyber-border bg-[#050811] px-3 py-2 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Target Skill Tag</label>
                  <select
                    value={skillTag}
                    onChange={(e) => setSkillTag(e.target.value)}
                    className="w-full rounded-xl border border-cyber-border bg-[#050811] px-3 py-2 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="phishing">Phishing & Smishing</option>
                    <option value="credentials">Credentials & MFA</option>
                    <option value="payments">Payments & UPI Fraud</option>
                    <option value="social_eng">Social Engineering</option>
                    <option value="browsing_wifi">Browsing & Wi-Fi</option>
                    <option value="data_privacy">Data Privacy</option>
                    <option value="incident_response">Incident Response</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">Correct Learner Action</label>
                <select
                  value={correctAction}
                  onChange={(e) => setCorrectAction(e.target.value as Decision)}
                  className="w-full rounded-xl border border-cyber-border bg-[#050811] px-3 py-2 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="REPORT_PHISH">REPORT_PHISH (Attack Simulation)</option>
                  <option value="IGNORE_SAFE">IGNORE_SAFE (Legitimate Control Test)</option>
                  <option value="ESCALATE_SOC">ESCALATE_SOC (Escalate to Security Operations)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">Message / Payload Body Text</label>
                <textarea
                  rows={6}
                  value={bodyContent}
                  onChange={(e) => setBodyContent(e.target.value)}
                  className="w-full rounded-xl border border-cyber-border bg-[#050811] p-3 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-cyber-border">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 text-xs shadow-lg shadow-cyan-950/40 transition"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Scenario Changes</span>
                </button>
              </div>
            </form>
          ) : (
            /* Live Simulator Preview */
            <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 space-y-4">
              <span className="text-xs font-mono text-cyber-muted font-bold uppercase block">
                Live Simulator Preview Mode ({channel})
              </span>
              <div className="rounded-2xl border border-cyber-border bg-[#050811] p-5 space-y-3">
                <h3 className="font-bold text-sm text-white">{title}</h3>
                <div className="text-xs font-mono text-slate-300 bg-[#0a0f1d] p-4 rounded-xl whitespace-pre-line leading-relaxed">
                  {bodyContent}
                </div>
                <div className="flex items-center justify-between text-xs text-cyber-muted font-mono pt-2 border-t border-cyber-border">
                  <span>Target: {skillTag}</span>
                  <span className="text-cyan-400 font-bold">Optimal Decision: {correctAction}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
