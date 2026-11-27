"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { SKILL_CATEGORIES } from "@/lib/skills";
import {
  Building2,
  Users,
  AlertTriangle,
  Download,
  Eye,
  EyeOff,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Department Matrix data for Heatmap
const DEPARTMENT_RISK_MATRIX = [
  {
    department: "Finance & Accounting",
    headcount: 24,
    overallRisk: 52,
    skills: {
      phishing: 58,
      credentials: 48,
      payments: 42, // high risk
      social_eng: 55,
      browsing_wifi: 60,
      data_privacy: 64,
      incident_response: 50,
    },
  },
  {
    department: "Engineering & IT",
    headcount: 68,
    overallRisk: 22,
    skills: {
      phishing: 85,
      credentials: 90,
      payments: 80,
      social_eng: 75,
      browsing_wifi: 88,
      data_privacy: 82,
      incident_response: 92,
    },
  },
  {
    department: "Human Resources",
    headcount: 16,
    overallRisk: 44,
    skills: {
      phishing: 62,
      credentials: 70,
      payments: 65,
      social_eng: 46, // high risk (authority lures)
      browsing_wifi: 68,
      data_privacy: 84,
      incident_response: 58,
    },
  },
  {
    department: "Executive Leadership",
    headcount: 8,
    overallRisk: 38,
    skills: {
      phishing: 70,
      credentials: 80,
      payments: 72,
      social_eng: 48, // deepfake target
      browsing_wifi: 74,
      data_privacy: 78,
      incident_response: 75,
    },
  },
];

const HISTORICAL_TREND_DATA = [
  { month: "Jun 2026", avgRiskScore: 68, complianceRate: 42 },
  { month: "Jul 2026", avgRiskScore: 62, complianceRate: 58 },
  { month: "Aug 2026", avgRiskScore: 54, complianceRate: 71 },
  { month: "Sep 2026", avgRiskScore: 45, complianceRate: 84 },
  { month: "Oct 2026", avgRiskScore: 39, complianceRate: 91 },
  { month: "Nov 2026", avgRiskScore: 32, complianceRate: 95 },
];

const TOP_MISSED_FLAGS = [
  {
    title: "UPI Collect Request vs Receive Trap",
    category: "PAYMENT_TRAP",
    failureRate: "42% Missed",
    impact: "High financial loss potential via reverse payment trick",
  },
  {
    title: "Homoglyph Suffix in URL Bar ('googIe.com')",
    category: "URL",
    failureRate: "38% Missed",
    impact: "Credential harvesting on visually deceptive domains",
  },
  {
    title: "AI Deepfake Executive Voice Pretexting",
    category: "AUTH_BYPASS",
    failureRate: "35% Missed",
    impact: "Urgent wire transfers bypassing dual controls",
  },
  {
    title: "Disconnection Panic Hook at 9:30 PM",
    category: "PSYCHOLOGICAL_URGENCY",
    failureRate: "28% Missed",
    impact: "Installation of malicious APK tools on personal mobile devices",
  },
];

export default function OrgAdminDashboardPage() {
  const { currentUser } = useApp();
  const [privacyMaskActive, setPrivacyMaskActive] = useState<boolean>(true);

  const getHeatmapColor = (score: number) => {
    // Note: in skills, score is mastery (0-100, where 100 is best)
    if (score < 50) return "bg-rose-500/30 text-rose-300 border-rose-500/40";
    if (score < 70) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Department,Headcount,OverallRiskScore,PhishingMastery,PaymentsMastery,CredentialsMastery\n" +
      DEPARTMENT_RISK_MATRIX.map(
        (d) =>
          `"${d.department}",${d.headcount},${d.overallRisk},${d.skills.phishing},${d.skills.payments},${d.skills.credentials}`
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `adaptsec_risk_matrix_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-[#0b1329] via-[#09152b] to-[#0d1838] p-6 sm:p-8 space-y-3 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Enterprise Risk Intelligence • Acme Cyber Defense Corp
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Organization Risk Heatmap & Governance
            </h1>
            <p className="text-xs text-cyber-muted max-w-xl">
              Telemetry aggregated across 116 active team members. Detect human-layer vulnerabilities before adversaries exploit them.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrivacyMaskActive(!privacyMaskActive)}
              className="flex items-center gap-1.5 rounded-xl border border-cyber-border bg-[#050811] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Toggle Privacy-Respecting Aggregation Mode"
            >
              {privacyMaskActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{privacyMaskActive ? "Privacy Mask Active" : "Names Revealed"}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 text-xs shadow-lg shadow-cyan-950/40 transition"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-5 space-y-1">
          <span className="text-[10px] font-mono text-cyber-muted uppercase">Org Aggregate Risk</span>
          <div className="text-2xl font-black text-amber-400">32/100</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> -13% past 60 days
          </span>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-5 space-y-1">
          <span className="text-[10px] font-mono text-cyber-muted uppercase">Simulation Completion</span>
          <div className="text-2xl font-black text-cyan-400">94.8%</div>
          <span className="text-[10px] text-cyber-muted font-mono">110 / 116 Active Users</span>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-5 space-y-1">
          <span className="text-[10px] font-mono text-cyber-muted uppercase">Most Vulnerable Vector</span>
          <div className="text-2xl font-black text-rose-400">Payments & UPI</div>
          <span className="text-[10px] text-rose-300 font-mono">42% Missed Red Flags</span>
        </div>

        <div className="rounded-2xl border border-cyber-border bg-cyber-card p-5 space-y-1">
          <span className="text-[10px] font-mono text-cyber-muted uppercase">Verified Certificates</span>
          <div className="text-2xl font-black text-cyber-secondary">64 Issued</div>
          <span className="text-[10px] text-cyber-muted font-mono">Public Verification Portal</span>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-cyber-border pb-3">
          <div>
            <h3 className="font-bold text-base text-white">Department vs Skill Competency Heatmap</h3>
            <p className="text-xs text-cyber-muted">Green indicates resilient (&gt;70%), Amber moderate (50-70%), Rose critical (&lt;50%)</p>
          </div>
          <Building2 className="h-5 w-5 text-cyan-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cyber-border text-cyber-muted font-mono text-[11px]">
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-2 text-center">Headcount</th>
                <th className="py-2.5 px-2 text-center">Phishing</th>
                <th className="py-2.5 px-2 text-center">Credentials</th>
                <th className="py-2.5 px-2 text-center">Payments/UPI</th>
                <th className="py-2.5 px-2 text-center">Social Eng</th>
                <th className="py-2.5 px-2 text-center">Data Privacy</th>
                <th className="py-2.5 px-2 text-center">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {DEPARTMENT_RISK_MATRIX.map((dept, i) => (
                <tr key={i} className="hover:bg-slate-800/20 transition">
                  <td className="py-3 px-3 font-semibold text-slate-100">{dept.department}</td>
                  <td className="py-3 px-2 text-center font-mono text-cyber-muted">{dept.headcount}</td>

                  {/* Heatmap cells */}
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block w-12 py-1 rounded font-mono font-bold border ${getHeatmapColor(dept.skills.phishing)}`}>
                      {dept.skills.phishing}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block w-12 py-1 rounded font-mono font-bold border ${getHeatmapColor(dept.skills.credentials)}`}>
                      {dept.skills.credentials}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block w-12 py-1 rounded font-mono font-bold border ${getHeatmapColor(dept.skills.payments)}`}>
                      {dept.skills.payments}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block w-12 py-1 rounded font-mono font-bold border ${getHeatmapColor(dept.skills.social_eng)}`}>
                      {dept.skills.social_eng}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block w-12 py-1 rounded font-mono font-bold border ${getHeatmapColor(dept.skills.data_privacy)}`}>
                      {dept.skills.data_privacy}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`font-mono font-bold text-xs ${dept.overallRisk > 45 ? "text-rose-400" : "text-emerald-400"}`}>
                      {dept.overallRisk}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Trend Chart & Top Missed Red Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div>
              <h3 className="font-bold text-base text-white">6-Month Human Risk Reduction Trend</h3>
              <p className="text-xs text-cyber-muted">Lower score indicates higher workforce resilience</p>
            </div>
            <TrendingDown className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#8899ac" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8899ac" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b111e", borderColor: "#182438", borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgRiskScore"
                  name="Avg Risk Score"
                  stroke="#ff3366"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="complianceRate"
                  name="Completion %"
                  stroke="#00f0ff"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Missed Flags */}
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <div>
              <h3 className="font-bold text-base text-white">Top Missed Red Flags</h3>
              <p className="text-xs text-cyber-muted">Key vulnerability vectors where learners failed simulations</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>

          <div className="space-y-3">
            {TOP_MISSED_FLAGS.map((flag, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-cyber-border bg-[#050811] p-3.5 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-100">{flag.title}</span>
                  <span className="rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold px-2 py-0.5 border border-rose-500/30">
                    {flag.failureRate}
                  </span>
                </div>
                <p className="text-[11px] text-cyber-muted leading-relaxed">{flag.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
