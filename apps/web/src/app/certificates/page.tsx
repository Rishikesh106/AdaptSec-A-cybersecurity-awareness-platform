"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";
import { useToast } from "@/components/providers/QueryProvider";
import { ExternalLink, Printer } from "lucide-react";

interface CertificateItem {
  id: string;
  certificateCode: string;
  score: number;
  issuedAt: string;
  track: { id: string; slug: string; title: string };
  organization: { name: string };
}

export default function CertificatesPage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [selectedTrackId, setSelectedTrackId] = useState("");

  const { data: certsData, isLoading } = useQuery({
    queryKey: ["certificates"],
    queryFn: () =>
      apiClient.get<{ items: CertificateItem[] }>("/api/v1/certificates"),
  });

  const { data: tracksData } = useQuery({
    queryKey: ["tracks"],
    queryFn: () =>
      apiClient.get<{ items: Array<{ id: string; title: string }> }>(
        "/api/v1/tracks"
      ),
  });

  const issueMutation = useMutation({
    mutationFn: (trackId: string) =>
      apiClient.post("/api/v1/certificates/issue", { trackId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["certificates"] });
      notify("Certificate issued", "success");
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  return (
    <AppShell breadcrumb="Certificates">
      <div className="space-y-6 max-w-4xl">
        <div className="border-b border-border pb-4 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">
              Verifiable Certificates
            </h1>
            <p className="text-sm text-ink-secondary">
              Issue credentials for tracks where you hold 60%+ mastery and verify them publicly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-subtle"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>

        {/* Issue Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedTrackId) issueMutation.mutate(selectedTrackId);
          }}
          className="rounded-lg border border-border bg-surface p-4 shadow-card flex flex-wrap items-end gap-3 print:hidden"
        >
          <div className="flex-1 min-w-[240px]">
            <label
              htmlFor="cert-track"
              className="block text-xs font-medium text-ink-primary mb-1"
            >
              Issue certificate for track
            </label>
            <select
              id="cert-track"
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary"
            >
              <option value="">Select learning track...</option>
              {tracksData?.items.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!selectedTrackId || issueMutation.isPending}
            className="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {issueMutation.isPending ? "Issuing..." : "Issue certificate"}
          </button>
        </form>

        {/* Certificates List */}
        {isLoading ? (
          <div className="text-sm text-ink-secondary">Loading certificates...</div>
        ) : (
          <div className="space-y-4">
            {certsData?.items.map((cert) => (
              <div
                key={cert.id}
                className="rounded-lg border border-border bg-surface p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-xs font-mono text-ink-muted">
                    Credential ID: {cert.certificateCode}
                  </div>
                  <h2 className="text-base font-semibold text-ink-primary">
                    {cert.track.title}
                  </h2>
                  <p className="text-xs text-ink-secondary">
                    Issued by {cert.organization.name} · Score:{" "}
                    <span className="font-semibold text-ink-primary tabular-nums">
                      {cert.score}%
                    </span>{" "}
                    · {new Date(cert.issuedAt).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  href={`/verify/${cert.certificateCode}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand-tint print:hidden"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Public verify page</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
