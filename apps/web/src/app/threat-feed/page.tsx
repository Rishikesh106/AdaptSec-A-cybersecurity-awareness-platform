"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { AuthUserDTO } from "@adaptsec/shared";
import { AppShell } from "@/components/shell/AppShell";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/components/providers/QueryProvider";
import { AlertTriangle, Plus, Trash2, ArrowRight, ShieldAlert } from "lucide-react";

interface ScamItem {
  id: string;
  title: string;
  category: string;
  channel: string;
  threatLevel: string;
  summary: string;
  realWorldIncident: string;
  indicatorsJson: string[];
  preventiveAdvice: string;
  scenarioId: string | null;
  publishedAt: string;
}

export default function ThreatFeedPage() {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Payment Fraud");
  const [channel, setChannel] = useState("UPI");
  const [threatLevel, setThreatLevel] = useState("HIGH");
  const [summary, setSummary] = useState("");
  const [incident, setIncident] = useState("");
  const [indicatorsText, setIndicatorsText] = useState("");
  const [advice, setAdvice] = useState("");

  const { data: meData } = useQuery<{ user: AuthUserDTO }>({
    queryKey: ["auth-me"],
    queryFn: () => apiClient.get("/api/v1/auth/me"),
  });

  const canCurate =
    meData?.user.activeRole === "ORG_ADMIN" ||
    meData?.user.activeRole === "CONTENT_AUTHOR" ||
    meData?.user.activeRole === "SUPER_ADMIN";

  const { data, isLoading } = useQuery<{ items: ScamItem[] }>({
    queryKey: ["scam-of-the-week", channelFilter],
    queryFn: () =>
      apiClient.get(
        `/api/v1/scam-of-the-week?channel=${encodeURIComponent(channelFilter)}`
      ),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.post("/api/v1/scam-of-the-week", {
        title,
        category,
        channel,
        threatLevel,
        summary,
        realWorldIncident: incident,
        indicators: indicatorsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        preventiveAdvice: advice,
      }),
    onSuccess: () => {
      setShowCreate(false);
      setTitle("");
      setSummary("");
      setIncident("");
      setIndicatorsText("");
      setAdvice("");
      queryClient.invalidateQueries({ queryKey: ["scam-of-the-week"] });
      notify("Threat bulletin published", "success");
    },
    onError: (err) => {
      notify(
        err instanceof ApiClientError ? err.message : "Failed to publish bulletin",
        "error"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/api/v1/scam-of-the-week/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scam-of-the-week"] });
      notify("Threat bulletin removed", "success");
    },
  });

  return (
    <AppShell breadcrumb="Scam of the Week">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">
              Scam of the Week — Threat Intelligence Feed
            </h1>
            <p className="text-sm text-ink-secondary">
              Curated advisories on active phishing, UPI, BEC, and voice-cloning campaigns.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              aria-label="Filter by channel"
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary"
            >
              <option value="ALL">All Channels</option>
              <option value="INBOX">Email / Inbox</option>
              <option value="SMS">SMS</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="UPI">UPI / Payments</option>
              <option value="VOICE_CALL">Voice Call</option>
              <option value="FAKE_LOGIN">Fake Login</option>
            </select>
            {canCurate && (
              <button
                type="button"
                onClick={() => setShowCreate((s) => !s)}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-1.5 text-sm font-medium text-white hover:bg-brand-hover"
              >
                <Plus className="h-4 w-4" />
                {showCreate ? "Close Form" : "Publish Bulletin"}
              </button>
            )}
          </div>
        </div>

        {showCreate && canCurate && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="rounded-md border border-border bg-surface p-5 space-y-4"
          >
            <h2 className="text-sm font-semibold text-ink-primary">
              New Scam of the Week Bulletin
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                required
                minLength={4}
                placeholder="Bulletin Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
              />
              <input
                type="text"
                required
                placeholder="Category (e.g. BEC, UPI Fraud)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
              />
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
              >
                <option value="UPI">UPI</option>
                <option value="INBOX">INBOX</option>
                <option value="SMS">SMS</option>
                <option value="WHATSAPP">WHATSAPP</option>
                <option value="VOICE_CALL">VOICE_CALL</option>
                <option value="FAKE_LOGIN">FAKE_LOGIN</option>
              </select>
              <select
                value={threatLevel}
                onChange={(e) => setThreatLevel(e.target.value)}
                className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
              <textarea
                required
                minLength={10}
                rows={2}
                placeholder="Executive summary of the attack pattern..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="sm:col-span-2 rounded-md border border-border bg-canvas px-3 py-2 text-sm"
              />
              <textarea
                required
                minLength={10}
                rows={2}
                placeholder="Real-world incident context..."
                value={incident}
                onChange={(e) => setIncident(e.target.value)}
                className="sm:col-span-2 rounded-md border border-border bg-canvas px-3 py-2 text-sm"
              />
              <textarea
                required
                rows={3}
                placeholder="Red flag indicators (one per line)"
                value={indicatorsText}
                onChange={(e) => setIndicatorsText(e.target.value)}
                className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
              />
              <textarea
                required
                minLength={10}
                rows={3}
                placeholder="Preventive advice for employees..."
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="rounded-md border border-border bg-canvas px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
              >
                {createMutation.isPending ? "Publishing..." : "Publish Bulletin"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="h-32 animate-pulse rounded-md border border-border bg-surface" />
          ) : !data?.items.length ? (
            <div className="rounded-md border border-border bg-surface p-6 text-center text-sm text-ink-muted">
              No threat advisories found for this channel.
            </div>
          ) : (
            data.items.map((item) => {
              const levelCls =
                item.threatLevel === "CRITICAL"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : item.threatLevel === "HIGH"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-slate-50 text-slate-700 border-slate-200";
              return (
                <article
                  key={item.id}
                  className="rounded-md border border-border bg-surface p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-semibold ${levelCls}`}
                        >
                          <ShieldAlert className="h-3 w-3" />
                          {item.threatLevel}
                        </span>
                        <span className="rounded border border-border bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                          {item.channel}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {item.category} ·{" "}
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-ink-primary">
                        {item.title}
                      </h2>
                    </div>
                    {canCurate && (
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(item.id)}
                        aria-label="Delete bulletin"
                        className="rounded p-1.5 text-ink-muted hover:bg-canvas hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-ink-secondary">{item.summary}</p>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-1">
                    <div className="rounded border border-border bg-canvas p-3">
                      <h3 className="text-xs font-semibold text-ink-primary mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        Key Red-Flag Indicators
                      </h3>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-ink-secondary">
                        {(Array.isArray(item.indicatorsJson)
                          ? item.indicatorsJson
                          : []
                        ).map((ind, idx) => (
                          <li key={idx}>{ind}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded border border-border bg-canvas p-3">
                      <h3 className="text-xs font-semibold text-ink-primary mb-1.5">
                        Preventive Guidance
                      </h3>
                      <p className="text-xs text-ink-secondary leading-relaxed">
                        {item.preventiveAdvice}
                      </p>
                      <p className="mt-2 text-[11px] text-ink-muted">
                        Incident note: {item.realWorldIncident}
                      </p>
                    </div>
                  </div>

                  {item.scenarioId && (
                    <div className="pt-1">
                      <Link
                        href="/simulations"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                      >
                        Practice related simulation
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
