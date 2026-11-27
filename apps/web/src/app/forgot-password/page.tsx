"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiClient, ApiClientError } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post<{ message: string }>(
        "/api/v1/auth/forgot-password",
        { email }
      );
      setStatusMessage(res.message);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-lg border border-border bg-surface p-8 shadow-card space-y-4">
        <h1 className="text-xl font-semibold text-ink-primary">
          Reset your password
        </h1>
        <p className="text-sm text-ink-secondary">
          Enter your work email and we will send password reset instructions.
        </p>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-risk-high">
            {error}
          </div>
        )}
        {statusMessage && (
          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-risk-low">
            {statusMessage}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-ink-primary mb-1"
            >
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="text-center text-xs">
          <Link href="/login" className="text-brand hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
