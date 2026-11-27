"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";
import { X } from "lucide-react";

interface ScenarioRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  channel: string;
  difficulty: string;
  skillTag: string;
  redFlagsCount: number;
}

interface ScenariosResponse {
  items: ScenarioRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function SimulationsPage() {
  const [page, setPage] = useState(1);
  const [channel, setChannel] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const queryStr = new URLSearchParams({
    page: String(page),
    limit: "15",
    ...(channel ? { channel } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(search ? { search } : {}),
  }).toString();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["scenarios", page, channel, difficulty, search],
    queryFn: () =>
      apiClient.get<ScenariosResponse>(`/api/v1/scenarios?${queryStr}`),
  });

  const { data: detailData } = useQuery({
    queryKey: ["scenario-detail", selectedSlug],
    queryFn: () =>
      apiClient.get<{ scenario: any }>(`/api/v1/scenarios/${selectedSlug}`),
    enabled: Boolean(selectedSlug),
  });

  return (
    <AppShell breadcrumb="Simulations">
      <div className="space-y-6">
        <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">
              Attack Simulation Catalog
            </h1>
            <p className="text-sm text-ink-secondary">
              {data?.pagination.total ?? 0} multi-channel scenarios across email, SMS, WhatsApp, UPI, voice, and login spotters.
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search scenarios..."
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary focus:border-brand focus:outline-none w-64"
          />

          <select
            aria-label="Filter by channel"
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary focus:border-brand focus:outline-none"
          >
            <option value="">All channels</option>
            <option value="INBOX">Email Inbox</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="UPI">UPI Payment</option>
            <option value="VOICE_CALL">Voice Call</option>
            <option value="FAKE_LOGIN">Fake Login</option>
          </select>

          <select
            aria-label="Filter by difficulty"
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary focus:border-brand focus:outline-none"
          >
            <option value="">All difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-sm text-ink-secondary">
              Loading scenarios...
            </div>
          ) : isError ? (
            <div className="p-6 text-sm text-risk-high">
              Failed to load scenarios.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-canvas text-xs font-medium text-ink-muted">
                <tr>
                  <th className="py-2.5 px-4">Scenario</th>
                  <th className="py-2.5 px-4">Channel</th>
                  <th className="py-2.5 px-4">Difficulty</th>
                  <th className="py-2.5 px-4">Skill</th>
                  <th className="py-2.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.items.map((row) => (
                  <tr key={row.id} className="hover:bg-canvas/60">
                    <td className="py-2.5 px-4">
                      <div className="font-medium text-ink-primary">
                        {row.title}
                      </div>
                      <div className="text-xs text-ink-secondary line-clamp-1">
                        {row.description}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-xs font-medium text-ink-secondary">
                      {row.channel}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-ink-secondary">
                      {row.difficulty}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-ink-secondary">
                      {row.skillTag.replace("_", " ")}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSlug(row.slug)}
                        className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand-tint"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="border-t border-border px-4 py-3 flex items-center justify-between text-xs text-ink-secondary">
              <span className="tabular-nums">
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border border-border bg-surface px-2.5 py-1 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border border-border bg-surface px-2.5 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Drawer */}
        {selectedSlug && detailData?.scenario && (
          <div
            role="dialog"
            aria-label="Scenario brief"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-surface p-6 shadow-popover overflow-y-auto space-y-4"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <div>
                <span className="text-xs font-medium text-ink-muted">
                  {detailData.scenario.channel} · {detailData.scenario.difficulty}
                </span>
                <h2 className="text-base font-semibold text-ink-primary mt-0.5">
                  {detailData.scenario.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlug(null)}
                aria-label="Close drawer"
                className="text-ink-muted hover:text-ink-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-ink-secondary">
              {detailData.scenario.description}
            </p>
            <div className="rounded-md border border-border bg-canvas p-3 text-xs text-ink-primary whitespace-pre-line">
              {detailData.scenario.contentJson?.body}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
