"use client";

import React, { useState } from "react";
import { ThreatTriageGame } from "@/components/games/ThreatTriageGame";
import { PassForgeLabGame } from "@/components/games/PassForgeLabGame";
import { NetShieldDefenseGame } from "@/components/games/NetShieldDefenseGame";
import { DailySpotScamGame } from "@/components/games/DailySpotScamGame";
import {
  Gamepad2,
  ShieldAlert,
  KeyRound,
  Shield,
  Flame,
  ArrowRight,
} from "lucide-react";

export default function GamesHubPage() {
  const [activeTab, setActiveTab] = useState<"triage" | "passforge" | "netshield" | "daily">("triage");

  const tabs = [
    {
      id: "triage",
      name: "Threat Triage",
      tagline: "Phish Shooter Reimagined",
      icon: ShieldAlert,
    },
    {
      id: "passforge",
      name: "PassForge Lab",
      tagline: "Client-Side Entropy & Crack-Time",
      icon: KeyRound,
    },
    {
      id: "netshield",
      name: "NetShield Defense",
      tagline: "Canvas Tower Defense",
      icon: Shield,
    },
    {
      id: "daily",
      name: "Daily 60s Scam Spotter",
      tagline: "Speed Run & Leaderboard",
      icon: Flame,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Game Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-2xl border p-4 text-left transition space-y-1 ${
                isSelected
                  ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-200 shadow-xl shadow-cyan-950/40"
                  : "border-cyber-border bg-cyber-card text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                {isSelected && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-white pt-1">{tab.name}</h3>
              <p className="text-[10px] text-cyber-muted line-clamp-1">{tab.tagline}</p>
            </button>
          );
        })}
      </div>

      {/* Render Active Game */}
      {activeTab === "triage" && <ThreatTriageGame />}
      {activeTab === "passforge" && <PassForgeLabGame />}
      {activeTab === "netshield" && <NetShieldDefenseGame />}
      {activeTab === "daily" && <DailySpotScamGame />}
    </div>
  );
}
