"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";
import { useToast } from "@/components/providers/QueryProvider";

interface SessionItem {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: () =>
      apiClient.get<{ sessions: SessionItem[] }>("/api/v1/auth/sessions"),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/v1/auth/sessions/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
      notify("Session revoked", "success");
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  return (
    <AppShell breadcrumb="Active Sessions">
      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-xl font-semibold text-ink-primary">
            Active Sessions
          </h1>
          <p className="text-sm text-ink-secondary">
            Review devices signed in to your AdaptSec account and revoke access if needed.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-sm text-ink-secondary">
              Loading sessions...
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-canvas text-xs font-medium text-ink-muted">
                <tr>
                  <th className="py-2.5 px-4">Device / User Agent</th>
                  <th className="py-2.5 px-4">IP Address</th>
                  <th className="py-2.5 px-4">Signed In</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="py-3 px-4 text-ink-primary">
                      <div className="font-medium truncate max-w-md">
                        {session.userAgent || "API / Browser Client"}
                      </div>
                      {session.isCurrent && (
                        <span className="inline-block mt-0.5 rounded bg-brand-tint px-1.5 py-0.5 text-[11px] font-medium text-brand">
                          Current session
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-ink-secondary tabular-nums">
                      {session.ipAddress || "—"}
                    </td>
                    <td className="py-3 px-4 text-ink-secondary tabular-nums">
                      {new Date(session.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!session.isCurrent && (
                        <button
                          type="button"
                          onClick={() => revokeMutation.mutate(session.id)}
                          disabled={revokeMutation.isPending}
                          className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-risk-high hover:bg-red-50"
                        >
                          Revoke
                        </button>
                      )}
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
