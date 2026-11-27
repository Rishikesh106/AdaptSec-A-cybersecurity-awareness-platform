"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ALL_SEED_SCENARIOS } from "@/data/seedScenarios";
import { Channel, Difficulty } from "@/lib/types";
import {
  Mail,
  MessageSquare,
  CreditCard,
  PhoneCall,
  Lock,
  Target,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function SimulationsListPage() {
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { completedScenarioIds } = useApp();

  const channels: { id: string; label: string; icon: any }[] = [
    { id: "ALL", label: "All Channels", icon: Target },
    { id: "INBOX", label: "Email Inbox", icon: Mail },
    { id: "SMS", label: "Mobile SMS", icon: MessageSquare },
    { id: "WHATSAPP", label: "WhatsApp", icon: MessageSquare },
    { id: "UPI", label: "UPI & Payments", icon: CreditCard },
    { id: "VOICE_CALL", label: "Voice / Vishing", icon: PhoneCall },
    { id: "FAKE_LOGIN", label: "Fake Login Spotter", icon: Lock },
  ];

  const filtered = ALL_SEED_SCENARIOS.filter((s) => {
    const channelMatch = selectedChannel === "ALL" || s.channel === selectedChannel;
    const diffMatch = selectedDifficulty === "ALL" || s.difficulty === selectedDifficulty;
    const searchMatch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return channelMatch && diffMatch && searchMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-[#0b1329] via-[#09152b] to-[#0d1838] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyber-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Multi-Channel Threat Arena</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Realistic Attack Simulations
          </h1>
          <p className="text-sm text-cyber-muted leading-relaxed">
            Face real-world social engineering, UPI traps, deepfake voice calls, and fake login spotters. Your hesitation time and red flags missed determine your adaptive learning curve.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Channel Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {channels.map((ch) => {
            const Icon = ch.icon;
            const isSelected = selectedChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/40"
                    : "bg-cyber-card text-slate-400 hover:text-slate-200 border border-cyber-border"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-cyber-primary" : "text-slate-400"}`} />
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Difficulty */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border border-cyber-border bg-cyber-card px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none w-48 sm:w-64"
          />

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="rounded-xl border border-cyber-border bg-cyber-card px-3 py-2 text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((scenario) => {
          const isDone = completedScenarioIds.includes(scenario.id);
          return (
            <div
              key={scenario.id}
              className="flex flex-col justify-between rounded-2xl border border-cyber-border bg-cyber-card hover:border-cyan-500/40 p-5 transition shadow-lg hover:shadow-cyan-950/20 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-slate-700">
                    {scenario.channel.replace("_", " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    {isDone && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                      </span>
                    )}
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        scenario.difficulty === "BEGINNER"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : scenario.difficulty === "INTERMEDIATE"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : scenario.difficulty === "ADVANCED"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {scenario.difficulty}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition line-clamp-1">
                    {scenario.title}
                  </h3>
                  <p className="mt-1 text-xs text-cyber-muted line-clamp-2 leading-relaxed">
                    {scenario.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-cyber-border/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {scenario.redFlags.length} Red Flags Embedded
                </span>
                <Link
                  href={`/simulations/${scenario.slug}`}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold transition"
                >
                  <span>Launch Sim</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
