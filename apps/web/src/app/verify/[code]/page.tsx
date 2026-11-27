"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

interface VerifyResponse {
  verified: boolean;
  certificate: {
    certificateCode: string;
    recipientName: string;
    organizationName: string;
    trackTitle: string;
    skillTag: string;
    score: number;
    issuedAt: string;
  };
}

export default function PublicVerifyPage() {
  const params = useParams();
  const code = String(params?.code ?? "");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify-cert", code],
    queryFn: () =>
      apiClient.get<VerifyResponse>(`/api/v1/certificates/verify/${code}`),
    enabled: Boolean(code),
  });

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center p-4">
      <div className="max-w-lg w-full rounded-lg border border-border bg-surface p-8 shadow-card space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <ShieldCheck className="h-5 w-5 text-brand" />
          <span className="text-sm font-semibold text-ink-primary">
            AdaptSec Credential Verification
          </span>
        </div>

        {isLoading ? (
          <p className="text-sm text-ink-secondary">Verifying certificate...</p>
        ) : isError || !data?.verified ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-risk-high">
              <XCircle className="h-5 w-5" />
              <span>Certificate not found</span>
            </div>
            <p className="text-xs text-ink-secondary">
              No valid credential matches code <span className="font-mono">{code}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-risk-low">
              <CheckCircle2 className="h-5 w-5" />
              <span>Verified authentic certificate</span>
            </div>

            <div className="rounded-md border border-border bg-canvas p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">Credential Code</span>
                <span className="font-mono font-semibold text-ink-primary">
                  {data.certificate.certificateCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Recipient</span>
                <span className="font-medium text-ink-primary">
                  {data.certificate.recipientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Organization</span>
                <span className="font-medium text-ink-primary">
                  {data.certificate.organizationName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Track</span>
                <span className="font-medium text-ink-primary">
                  {data.certificate.trackTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Verified Score</span>
                <span className="font-semibold text-ink-primary tabular-nums">
                  {data.certificate.score}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Issued On</span>
                <span className="text-ink-secondary">
                  {new Date(data.certificate.issuedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border text-xs">
          <Link href="/" className="text-brand hover:underline">
            Return to AdaptSec
          </Link>
        </div>
      </div>
    </div>
  );
}
