"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";

interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  department: string;
  weeklyXp: number;
  totalXp: number;
  streakDays: number;
  badgesCount: number;
  isCurrentUser: boolean;
}

export default function LeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboards"],
    queryFn: () =>
      apiClient.get<{ items: LeaderboardRow[] }>("/api/v1/leaderboards?limit=50"),
  });

  return (
    <AppShell breadcrumb="Leaderboard">
      <div className="space-y-6 max-w-4xl">
        <div className="border-b border-border pb-4">
          <h1 className="text-xl font-semibold text-ink-primary">
            Organization Weekly Leaderboard
          </h1>
          <p className="text-sm text-ink-secondary">
            Scoped strictly to active members within your current organization.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-sm text-ink-secondary">
              Loading leaderboard...
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-canvas text-xs font-medium text-ink-muted">
                <tr>
                  <th className="py-2.5 px-4">Rank</th>
                  <th className="py-2.5 px-4">Member</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4 text-right">Weekly XP</th>
                  <th className="py-2.5 px-4 text-right">Total XP</th>
                  <th className="py-2.5 px-4 text-right">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.items.map((row) => (
                  <tr
                    key={row.userId}
                    className={row.isCurrentUser ? "bg-brand-tint" : ""}
                  >
                    <td className="py-2.5 px-4 font-semibold tabular-nums text-ink-primary">
                      #{row.rank}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-ink-primary">
                      {row.name}
                      {row.isCurrentUser && (
                        <span className="ml-2 rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-brand border border-brand-border">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-ink-secondary">
                      {row.department}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-medium text-brand">
                      {row.weeklyXp}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-ink-secondary">
                      {row.totalXp}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-xs text-ink-secondary">
                      {row.streakDays}d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
