"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient, ApiClientError } from "@/lib/api-client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<"verifying" | "verified" | "error">(
    token ? "verifying" : "error"
  );
  const [message, setMessage] = useState(
    token ? "Verifying email token..." : "Verification token is missing."
  );

  useEffect(() => {
    if (!token) return;
    apiClient
      .post("/api/v1/auth/verify-email", { token })
      .then(() => {
        setState("verified");
        setMessage("Your email address has been verified.");
      })
      .catch((err) => {
        setState("error");
        setMessage(
          err instanceof ApiClientError ? err.message : "Verification failed."
        );
      });
  }, [token]);

  return (
    <div className="max-w-md w-full rounded-lg border border-border bg-surface p-8 shadow-card space-y-4">
      <h1 className="text-xl font-semibold text-ink-primary">
        Email verification
      </h1>
      <p
        className={`text-sm ${
          state === "error"
            ? "text-risk-high"
            : state === "verified"
            ? "text-risk-low"
            : "text-ink-secondary"
        }`}
      >
        {message}
      </p>
      <Link
        href="/dashboard"
        className="inline-flex rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
      >
        Continue to workspace
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-sm text-ink-secondary">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
