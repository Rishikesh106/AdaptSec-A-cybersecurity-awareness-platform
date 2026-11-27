"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient, ApiClientError } from "@/lib/api-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/reset-password", { token, password });
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full rounded-lg border border-border bg-surface p-8 shadow-card space-y-4">
      <h1 className="text-xl font-semibold text-ink-primary">
        Choose a new password
      </h1>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-risk-high">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-ink-primary mb-1"
          >
            New password (min 10 characters)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
      <div className="text-center text-xs">
        <Link href="/login" className="text-brand hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-sm text-ink-secondary">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
