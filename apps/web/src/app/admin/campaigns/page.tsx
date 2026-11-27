"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shell/AppShell";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/components/providers/QueryProvider";
import { Bell, Plus, Megaphone, Calendar } from "lucide-react";

interface CampaignItem {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  createdAt: string;
  stats: {
    totalAssigned: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
}

interface TrackItem {
  id: string;
  title: string;
}

export default function AdminCampaignsPage() {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [trackId, setTrackId] = useState("");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [departments, setDepartments] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: campaignsData, isLoading } = useQuery<{ items: CampaignItem[] }>({
    queryKey: ["admin-campaigns", statusFilter],
    queryFn: () =>
      apiClient.get(`/api/v1/campaigns?status=${encodeURIComponent(statusFilter)}`),
  });

  const { data: tracksData } = useQuery<{ items: TrackItem[] }>({
    queryKey: ["tracks-list"],
    queryFn: () => apiClient.get("/api/v1/tracks?limit=50"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.post("/api/v1/campaigns", {
        title,
        description,
        trackId: trackId || undefined,
        deadline: new Date(`${deadline}T23:59:59Z`).toISOString(),
        targetDepartments: departments
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        launchNow: true,
      }),
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setDepartments("");
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      notify("Campaign launched and members assigned", "success");
    },
    onError: (err) => {
      notify(
        err instanceof ApiClientError ? err.message : "Failed to create campaign",
        "error"
      );
    },
  });

  const remindMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.post<{ remindedCount: number }>(
        `/api/v1/campaigns/${id}/remind`
      ),
    onSuccess: (res) => {
      notify(
        `Sent reminders to ${res.remindedCount} incomplete member(s)`,
        "success"
      );
    },
    onError: (err) => {
      notify(
        err instanceof ApiClientError ? err.message : "Failed to send reminders",
        "error"
      );
    },
  });

  return (
    <AppShell breadcrumb="Admin / Campaigns">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">
              Security Training Campaigns
            </h1>
            <p className="text-sm text-ink-secondary">
              Assign targeted training tracks to departments, track completion, and dispatch reminders.
            </p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter campaigns by status"
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Create Campaign Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="rounded-md border border-border bg-surface p-5 space-y-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-primary">
            <Megaphone className="h-4 w-4 text-brand" />
            <span>Launch New Training Campaign</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Q4 Finance BEC & UPI Readiness"
                className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Target Learning Track (optional)
              </label>
              <select
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-primary"
              >
                <option value="">All / General Assessment</option>
                {tracksData?.items.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Instructions / Description
              </label>
              <textarea
                required
                minLength={5}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Complete all assigned simulations before the deadline."
                className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Target Departments (comma-separated, blank = all)
              </label>
              <input
                type="text"
                value={departments}
                onChange={(e) => setDepartments(e.target.value)}
                placeholder="Finance, Engineering, HR"
                className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Completion Deadline
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-primary"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {createMutation.isPending ? "Launching..." : "Launch Campaign"}
            </button>
          </div>
        </form>

        {/* Campaigns List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="h-28 animate-pulse rounded-md border border-border bg-surface" />
          ) : !campaignsData?.items.length ? (
            <div className="rounded-md border border-border bg-surface p-6 text-center text-sm text-ink-muted">
              No campaigns match the selected filter.
            </div>
          ) : (
            campaignsData.items.map((c) => (
              <div
                key={c.id}
                className="rounded-md border border-border bg-surface p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink-primary">
                      {c.title}
                    </h3>
                    <span className="rounded border border-border bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary">{c.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Deadline: {new Date(c.deadline).toLocaleDateString()}
                    </span>
                    <span className="tabular-nums">
                      {c.stats.completed}/{c.stats.totalAssigned} completed (
                      {c.stats.completionRate}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => remindMutation.mutate(c.id)}
                    disabled={remindMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-canvas disabled:opacity-50"
                  >
                    <Bell className="h-3.5 w-3.5 text-brand" />
                    Send Reminder
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
