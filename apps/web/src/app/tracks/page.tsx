"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";
import { ArrowRight } from "lucide-react";

interface TrackItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  skillTag: string;
  estimatedMinutes: number;
  lessonsCount: number;
  scenariosCount: number;
}

export default function TracksPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tracks", search],
    queryFn: () =>
      apiClient.get<{ items: TrackItem[] }>(
        `/api/v1/tracks?search=${encodeURIComponent(search)}`
      ),
  });

  return (
    <AppShell breadcrumb="Learning Paths">
      <div className="space-y-6">
        <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">
              Security Awareness Learning Paths
            </h1>
            <p className="text-sm text-ink-secondary">
              Structured tracks combining short interactive lessons and real attack simulations.
            </p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracks..."
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary focus:border-brand focus:outline-none w-64"
          />
        </div>

        <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-sm text-ink-secondary">
              Loading learning tracks...
            </div>
          ) : isError ? (
            <div className="p-6 text-sm text-risk-high">
              Unable to load learning tracks from API.
            </div>
          ) : data?.items.length === 0 ? (
            <div className="p-6 text-sm text-ink-secondary">
              No tracks match your filter.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-canvas text-xs font-medium text-ink-muted">
                <tr>
                  <th className="py-2.5 px-4">Track</th>
                  <th className="py-2.5 px-4">Skill Domain</th>
                  <th className="py-2.5 px-4 text-right">Lessons</th>
                  <th className="py-2.5 px-4 text-right">Scenarios</th>
                  <th className="py-2.5 px-4 text-right">Est. Time</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.items.map((track) => (
                  <tr key={track.id} className="hover:bg-canvas/60">
                    <td className="py-3 px-4">
                      <div className="font-medium text-ink-primary">
                        {track.title}
                      </div>
                      <div className="text-xs text-ink-secondary line-clamp-1">
                        {track.description}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-subtle px-2 py-0.5 text-xs font-medium text-ink-secondary">
                        {track.skillTag.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-ink-secondary">
                      {track.lessonsCount}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-ink-secondary">
                      {track.scenariosCount}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-ink-secondary">
                      {track.estimatedMinutes} min
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/tracks/${track.slug}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand-tint"
                      >
                        <span>Open</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
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
