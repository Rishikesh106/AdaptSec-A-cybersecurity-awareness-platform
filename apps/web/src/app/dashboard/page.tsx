"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { ArrowRight, Award } from "lucide-react";

interface UserAnalyticsResponse {
  xp: number;
  streakDays: number;
  humanRiskScore: number;
  badgesCount: number;
  certificatesCount: number;
  recentAccuracy: number;
  skills: Array<{ skillTag: string; score: number }>;
  recentAttempts: Array<{
    id: string;
    title: string;
    channel: string;
    decision: string;
    isCorrect: boolean;
    timeMs: number;
    xpAwarded: number;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", "user"],
    queryFn: () => apiClient.get<UserAnalyticsResponse>("/api/v1/analytics/user"),
  });

  const { data: recData } = useQuery({
    queryKey: ["recommendation-next"],
    queryFn: () =>
      apiClient.get<{
        recommendation: {
          title: string;
          reason: string;
          difficulty: string;
          scenarioSlug?: string;
        };
      }>("/api/v1/recommendations/next"),
  });

  const { data: badgesData } = useQuery({
    queryKey: ["badges"],
    queryFn: () =>
      apiClient.get<{
        items: Array<{
          id: string;
          title: string;
          description: string;
          tier: string;
          earned: boolean;
        }>;
      }>("/api/v1/badges"),
  });

  const radarData =
    analytics?.skills.map((s) => ({
      skill: s.skillTag.replace("_", " "),
      score: s.score,
    })) ?? [];

  return (
    <AppShell breadcrumb="Overview">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">
              Security Awareness Overview
            </h1>
            <p className="text-sm text-ink-secondary">
              Your Human Risk Profile, skill mastery breakdown, and recent simulation telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/baseline"
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-subtle"
            >
              Recalibrate baseline
            </Link>
            <Link
              href="/simulations"
              className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
            >
              Browse simulations
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <div className="text-xs text-ink-muted">Human Risk Score</div>
            <div className="mt-1 text-2xl font-semibold text-ink-primary tabular-nums">
              {isLoading ? "—" : `${analytics?.humanRiskScore ?? 50}/100`}
            </div>
            <div className="text-xs text-ink-secondary mt-0.5">
              Lower score indicates stronger resilience
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <div className="text-xs text-ink-muted">Total Experience</div>
            <div className="mt-1 text-2xl font-semibold text-ink-primary tabular-nums">
              {isLoading ? "—" : `${analytics?.xp ?? 0} XP`}
            </div>
            <div className="text-xs text-ink-secondary mt-0.5 tabular-nums">
              {analytics?.streakDays ?? 0} day active streak
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <div className="text-xs text-ink-muted">Recent Accuracy</div>
            <div className="mt-1 text-2xl font-semibold text-ink-primary tabular-nums">
              {isLoading ? "—" : `${analytics?.recentAccuracy ?? 0}%`}
            </div>
            <div className="text-xs text-ink-secondary mt-0.5">
              Across last 10 evaluations
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <div className="text-xs text-ink-muted">Credentials Earned</div>
            <div className="mt-1 text-2xl font-semibold text-ink-primary tabular-nums">
              {isLoading
                ? "—"
                : `${analytics?.badgesCount ?? 0} Badges · ${
                    analytics?.certificatesCount ?? 0
                  } Certs`}
            </div>
            <div className="text-xs text-ink-secondary mt-0.5">
              <Link href="/certificates" className="text-brand hover:underline">
                View certificates
              </Link>
            </div>
          </div>
        </div>

        {/* Adaptive Recommendation Banner */}
        {recData?.recommendation && (
          <div className="rounded-lg border border-brand-border bg-brand-tint p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand">
                Recommended Next Activity · {recData.recommendation.difficulty}
              </div>
              <div className="text-base font-semibold text-ink-primary mt-0.5">
                {recData.recommendation.title}
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                {recData.recommendation.reason}
              </p>
            </div>
            <Link
              href={
                recData.recommendation.scenarioSlug
                  ? `/simulations/${recData.recommendation.scenarioSlug}`
                  : "/quiz"
              }
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover shrink-0"
            >
              <span>Launch activity</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Skill Radar & Skill Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
            <h2 className="text-sm font-semibold text-ink-primary border-b border-border pb-2.5">
              7-Domain Skill Profile
            </h2>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                  <PolarGrid stroke="#E2E5EA" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: "#475569", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: "#64748B", fontSize: 10 }}
                  />
                  <Radar
                    name="Mastery"
                    dataKey="score"
                    stroke="#1E3A8A"
                    fill="#1E3A8A"
                    fillOpacity={0.18}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-card space-y-3">
            <h2 className="text-sm font-semibold text-ink-primary border-b border-border pb-2.5">
              Mastery by Domain
            </h2>
            <div className="space-y-3">
              {analytics?.skills.map((s) => (
                <div key={s.skillTag} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-ink-primary capitalize">
                      {s.skillTag.replace("_", " ")}
                    </span>
                    <span className="tabular-nums font-medium text-ink-secondary">
                      {s.score}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded bg-subtle overflow-hidden">
                    <div
                      className="h-full bg-brand"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Attempts History */}
        <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border text-sm font-semibold text-ink-primary">
            Recent Activity History
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-canvas text-xs font-medium text-ink-muted">
              <tr>
                <th className="py-2 px-4">Activity</th>
                <th className="py-2 px-4">Channel</th>
                <th className="py-2 px-4">Outcome</th>
                <th className="py-2 px-4 text-right">Decision Time</th>
                <th className="py-2 px-4 text-right">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {analytics?.recentAttempts.map((a) => (
                <tr key={a.id}>
                  <td className="py-2.5 px-4 font-medium text-ink-primary">
                    {a.title}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-ink-secondary">
                    {a.channel}
                  </td>
                  <td className="py-2.5 px-4 text-xs font-medium">
                    <span className={a.isCorrect ? "text-risk-low" : "text-risk-high"}>
                      {a.isCorrect ? "Correct" : "Missed"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-xs text-ink-secondary">
                    {(a.timeMs / 1000).toFixed(1)}s
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-xs font-medium text-brand">
                    +{a.xpAwarded}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Badges */}
        {badgesData && (
          <div className="rounded-lg border border-border bg-surface p-5 shadow-card space-y-3">
            <h2 className="text-sm font-semibold text-ink-primary border-b border-border pb-2.5">
              Achievements & Badges
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {badgesData.items.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-md border p-3 text-xs flex items-start gap-2.5 ${
                    b.earned
                      ? "border-brand-border bg-brand-tint"
                      : "border-border bg-canvas opacity-70"
                  }`}
                >
                  <Award
                    className={`h-4 w-4 shrink-0 mt-0.5 ${
                      b.earned ? "text-brand" : "text-ink-muted"
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-ink-primary">
                      {b.title}{" "}
                      <span className="text-[10px] font-normal text-ink-muted">
                        ({b.earned ? "Earned" : "Locked"})
                      </span>
                    </div>
                    <p className="text-ink-secondary mt-0.5">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
