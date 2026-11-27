"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shell/AppShell";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/components/providers/QueryProvider";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  ShieldAlert,
  Users,
  Target,
  CheckCircle2,
} from "lucide-react";

interface OrgAnalyticsResponse {
  overview: {
    totalMembers: number;
    activeLearners: number;
    avgMastery: number;
    avgRiskScore: number;
    totalAttempts: number;
    overallAccuracy: number;
    campaignCompletionRate: number;
  };
  departmentRisk: {
    department: string;
    memberCount: number;
    avgMastery: number;
    riskScore: number;
    attemptsCount: number;
    accuracy: number;
    skills: Record<string, number>;
  }[];
  trends: {
    date: string;
    attempts: number;
    accuracy: number;
    riskScore: number;
  }[];
  topMissedRedFlags: { flag: string; count: number }[];
  memberRiskTable: {
    items: {
      userId: string;
      name: string;
      email: string;
      department: string;
      role: string;
      xp: number;
      avgMastery: number;
      riskScore: number;
      attemptsCount: number;
      accuracy: number;
    }[];
    total: number;
    page: number;
    limit: number;
  };
}

interface ReportExportItem {
  id: string;
  format: "CSV" | "PDF";
  reportType: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  requestedBy: { name: string; email: string };
}

const SKILL_LABELS: { key: string; label: string }[] = [
  { key: "phishing", label: "Phishing" },
  { key: "credentials", label: "Credentials" },
  { key: "payments", label: "Payments" },
  { key: "social_eng", label: "Social Eng" },
  { key: "browsing_wifi", label: "Browsing" },
  { key: "data_privacy", label: "Privacy" },
  { key: "incident_response", label: "IR" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AdminAnalyticsPage() {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [page, setPage] = useState(1);
  const [exportFormat, setExportFormat] = useState<"CSV" | "PDF">("PDF");
  const [reportType, setReportType] = useState<
    "ORG_RISK_SUMMARY" | "CAMPAIGN_COMPLIANCE" | "USER_RISK_MATRIX"
  >("ORG_RISK_SUMMARY");

  const { data, isLoading, error } = useQuery<OrgAnalyticsResponse>({
    queryKey: ["org-analytics", search, department, page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        department,
      });
      if (search.trim()) params.set("search", search.trim());
      return apiClient.get<OrgAnalyticsResponse>(
        `/api/v1/analytics/org?${params.toString()}`
      );
    },
  });

  const { data: exportsData } = useQuery<{ items: ReportExportItem[] }>({
    queryKey: ["report-exports"],
    queryFn: () => apiClient.get("/api/v1/reports/export"),
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      apiClient.post<{ export: ReportExportItem }>("/api/v1/reports/export", {
        format: exportFormat,
        reportType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-exports"] });
      notify("Report export generated and ready for download", "success");
    },
    onError: (err) => {
      notify(
        err instanceof ApiClientError ? err.message : "Failed to generate report",
        "error"
      );
    },
  });

  const handleDownload = async (id: string, format: "CSV" | "PDF") => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/reports/export/${id}/download`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `adaptsec-report-${id}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      notify("Unable to download report file", "error");
    }
  };

  return (
    <AppShell breadcrumb="Admin / Risk Analytics">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">
              Organization Human Risk Analytics
            </h1>
            <p className="text-sm text-ink-secondary">
              Department-level skill posture, simulation accuracy trends, and compliance exports.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={reportType}
              onChange={(e) =>
                setReportType(e.target.value as typeof reportType)
              }
              aria-label="Report Type"
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary"
            >
              <option value="ORG_RISK_SUMMARY">Org Risk Summary</option>
              <option value="CAMPAIGN_COMPLIANCE">Campaign Compliance</option>
              <option value="USER_RISK_MATRIX">User Risk Matrix</option>
            </select>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as "CSV" | "PDF")}
              aria-label="Export Format"
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary"
            >
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
            </select>
            <button
              type="button"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-1.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exportMutation.isPending ? "Generating..." : "Export Report"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Admin access is required to view organization risk analytics.
          </div>
        )}

        {isLoading || !data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-md border border-border bg-surface"
              />
            ))}
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-border bg-surface p-4">
                <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
                  <span>Org Human Risk Score</span>
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-primary">
                  {data.overview.avgRiskScore}/100
                </p>
                <p className="mt-1 text-xs text-ink-secondary">
                  Avg Mastery: {data.overview.avgMastery}%
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface p-4">
                <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
                  <span>Active Learners</span>
                  <Users className="h-4 w-4 text-brand" />
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-primary">
                  {data.overview.activeLearners} / {data.overview.totalMembers}
                </p>
                <p className="mt-1 text-xs text-ink-secondary">
                  Enrolled org members
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface p-4">
                <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
                  <span>Simulation Accuracy</span>
                  <Target className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-primary">
                  {data.overview.overallAccuracy}%
                </p>
                <p className="mt-1 text-xs text-ink-secondary">
                  {data.overview.totalAttempts} total attempts
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface p-4">
                <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
                  <span>Campaign Completion</span>
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-primary">
                  {data.overview.campaignCompletionRate}%
                </p>
                <p className="mt-1 text-xs text-ink-secondary">
                  Across assigned campaigns
                </p>
              </div>
            </div>

            {/* Department Skill Heatmap */}
            <div className="rounded-md border border-border bg-surface">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-ink-primary">
                  Department x Skill Mastery Heatmap
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-canvas text-ink-muted">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Department</th>
                      <th className="px-3 py-2.5 font-medium">Members</th>
                      <th className="px-3 py-2.5 font-medium">Risk</th>
                      {SKILL_LABELS.map((s) => (
                        <th key={s.key} className="px-3 py-2.5 font-medium">
                          {s.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.departmentRisk.map((dept) => (
                      <tr key={dept.department}>
                        <td className="px-4 py-2.5 font-medium text-ink-primary">
                          {dept.department}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums text-ink-secondary">
                          {dept.memberCount}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums font-medium text-ink-primary">
                          {dept.riskScore}
                        </td>
                        {SKILL_LABELS.map((s) => {
                          const val = dept.skills[s.key] ?? 50;
                          const badgeCls =
                            val >= 75
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : val >= 50
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200";
                          return (
                            <td key={s.key} className="px-3 py-2.5">
                              <span
                                className={`inline-block rounded border px-2 py-0.5 tabular-nums font-medium ${badgeCls}`}
                              >
                                {val}%
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trends & Top Missed Red Flags */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-md border border-border bg-surface p-4 lg:col-span-2">
                <h2 className="mb-3 text-sm font-semibold text-ink-primary">
                  30-Day Accuracy & Risk Trend
                </h2>
                {data.trends.length === 0 ? (
                  <p className="py-12 text-center text-sm text-ink-muted">
                    No attempts recorded in the last 30 days.
                  </p>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#64748B" }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 11, fill: "#64748B" }}
                        />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="accuracy"
                          name="Accuracy %"
                          stroke="#1E3A8A"
                          fill="#DBEAFE"
                        />
                        <Area
                          type="monotone"
                          dataKey="riskScore"
                          name="Risk Score"
                          stroke="#D97706"
                          fill="#FEF3C7"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="rounded-md border border-border bg-surface p-4">
                <h2 className="mb-3 text-sm font-semibold text-ink-primary">
                  Top Missed Red Flags
                </h2>
                {data.topMissedRedFlags.length === 0 ? (
                  <p className="text-sm text-ink-muted">
                    No missed red flags recorded yet.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {data.topMissedRedFlags.map((item) => (
                      <li
                        key={item.flag}
                        className="flex items-center justify-between rounded border border-border bg-canvas px-3 py-2 text-xs"
                      >
                        <span className="font-medium text-ink-primary">
                          {item.flag}
                        </span>
                        <span className="tabular-nums text-ink-secondary">
                          {item.count} missed
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Member Risk Table */}
            <div className="rounded-md border border-border bg-surface">
              <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-semibold text-ink-primary">
                  Member Risk Roster
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-ink-muted" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search member..."
                      className="rounded-md border border-border bg-canvas pl-8 pr-3 py-1.5 text-xs text-ink-primary"
                    />
                  </div>
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      setPage(1);
                    }}
                    aria-label="Filter by Department"
                    className="rounded-md border border-border bg-canvas px-2.5 py-1.5 text-xs text-ink-primary"
                  >
                    <option value="ALL">All Departments</option>
                    {data.departmentRisk.map((d) => (
                      <option key={d.department} value={d.department}>
                        {d.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-canvas text-ink-muted">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Member</th>
                      <th className="px-4 py-2.5 font-medium">Department</th>
                      <th className="px-4 py-2.5 font-medium">Risk Score</th>
                      <th className="px-4 py-2.5 font-medium">Mastery</th>
                      <th className="px-4 py-2.5 font-medium">Attempts</th>
                      <th className="px-4 py-2.5 font-medium">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.memberRiskTable.items.map((m) => (
                      <tr key={m.userId}>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-ink-primary">
                            {m.name}
                          </div>
                          <div className="text-ink-muted">{m.email}</div>
                        </td>
                        <td className="px-4 py-2.5 text-ink-secondary">
                          {m.department}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums font-semibold text-ink-primary">
                          {m.riskScore}/100
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-ink-secondary">
                          {m.avgMastery}%
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-ink-secondary">
                          {m.attemptsCount}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-ink-secondary">
                          {m.accuracy}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.memberRiskTable.total > 10 && (
                <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-ink-secondary">
                  <span>
                    Page {page} of {Math.ceil(data.memberRiskTable.total / 10)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded border border-border px-2.5 py-1 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page * 10 >= data.memberRiskTable.total}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded border border-border px-2.5 py-1 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Report Exports History */}
            <div className="rounded-md border border-border bg-surface">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-ink-primary">
                  Generated Compliance Reports
                </h2>
              </div>
              <div className="divide-y divide-border">
                {!exportsData?.items.length ? (
                  <p className="p-4 text-xs text-ink-muted">
                    No reports generated yet. Use Export Report above to generate a CSV or PDF.
                  </p>
                ) : (
                  exportsData.items.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between px-4 py-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {exp.format === "PDF" ? (
                          <FileText className="h-4 w-4 text-brand" />
                        ) : (
                          <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                        )}
                        <div>
                          <div className="font-medium text-ink-primary">
                            {exp.reportType} ({exp.format})
                          </div>
                          <div className="text-ink-muted">
                            Requested by {exp.requestedBy?.name ?? "Admin"} on{" "}
                            {new Date(exp.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded border border-border bg-canvas px-2 py-0.5 font-medium text-ink-secondary">
                          {exp.status}
                        </span>
                        {exp.status === "READY" && (
                          <button
                            type="button"
                            onClick={() => handleDownload(exp.id, exp.format)}
                            className="inline-flex items-center gap-1 rounded border border-border bg-surface px-2.5 py-1 font-medium text-brand hover:bg-canvas"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
