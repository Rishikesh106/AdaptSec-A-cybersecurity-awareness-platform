"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { ThreatTriageConsole } from "@/components/games/ThreatTriageConsole";
import { PassForgeLabConsole } from "@/components/games/PassForgeLabConsole";
import { NetShieldConsole } from "@/components/games/NetShieldConsole";

type LabTab = "threat-triage" | "passforge" | "netshield" | "daily-spot";

export default function GamesPage() {
  const [tab, setTab] = useState<LabTab>("threat-triage");

  const tabs: Array<{ id: LabTab; label: string }> = [
    { id: "threat-triage", label: "Threat Triage" },
    { id: "passforge", label: "PassForge Lab" },
    { id: "netshield", label: "NetShield Defense" },
    { id: "daily-spot", label: "Daily 60s Spot the Scam" },
  ];

  return (
    <AppShell breadcrumb="Training Labs">
      <div className="space-y-6 max-w-4xl">
        <div className="border-b border-border pb-4">
          <h1 className="text-xl font-semibold text-ink-primary">
            Interactive Training Labs
          </h1>
          <p className="text-sm text-ink-secondary">
            Practice rapid threat triage, client-side passphrase engineering, and safeguard deployment with server-validated scoring.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Training lab modules"
          className="flex flex-wrap gap-2 border-b border-border pb-3"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.id
                  ? "bg-brand text-white"
                  : "border border-border bg-surface text-ink-secondary hover:bg-subtle hover:text-ink-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "threat-triage" && <ThreatTriageConsole mode="threat-triage" />}
        {tab === "passforge" && <PassForgeLabConsole />}
        {tab === "netshield" && <NetShieldConsole />}
        {tab === "daily-spot" && <ThreatTriageConsole mode="daily-spot" />}
      </div>
    </AppShell>
  );
}
