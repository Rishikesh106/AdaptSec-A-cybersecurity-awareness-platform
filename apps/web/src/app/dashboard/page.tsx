"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { AuthUserDTO } from "@adaptsec/shared";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiClient.get<{ user: AuthUserDTO }>("/api/v1/auth/me"),
  });

  const user = data?.user;

  return (
    <AppShell breadcrumb="Overview">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">
              Workspace Overview
            </h1>
            <p className="text-sm text-ink-secondary">
              Signed in as {user?.name} ({user?.activeRole}) in{" "}
              {user?.activeOrganizationName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/sessions"
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-subtle"
            >
              Manage sessions
            </Link>
            {(user?.activeRole === "ORG_ADMIN" ||
              user?.activeRole === "SUPER_ADMIN") && (
              <Link
                href="/team"
                className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
              >
                Manage team
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
            <div className="text-xs font-medium text-ink-muted">
              Active Organization
            </div>
            <div className="mt-1 text-base font-semibold text-ink-primary">
              {user?.activeOrganizationName}
            </div>
            <div className="mt-1 text-xs text-ink-secondary">
              Department: {user?.department}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
            <div className="text-xs font-medium text-ink-muted">
              Email Verification
            </div>
            <div className="mt-1 text-base font-semibold text-ink-primary">
              {user?.emailVerified ? "Verified" : "Pending verification"}
            </div>
            <div className="mt-1 text-xs text-ink-secondary">{user?.email}</div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
            <div className="text-xs font-medium text-ink-muted">
              Training Progress
            </div>
            <div className="mt-1 text-base font-semibold text-ink-primary tabular-nums">
              {user?.xp ?? 0} XP
            </div>
            <div className="mt-1 text-xs text-ink-secondary tabular-nums">
              {user?.streakDays ?? 0} day active streak
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
