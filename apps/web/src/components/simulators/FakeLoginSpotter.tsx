"use client";

import React, { useState } from "react";
import type { SimulatorProps } from "./InboxSimulator";
import { Lock, Unlock, ShieldAlert, ShieldCheck } from "lucide-react";

export function FakeLoginSpotter({
  scenario,
  onSubmitDecision,
  isSubmitting,
}: SimulatorProps) {
  const [showCert, setShowCert] = useState(false);
  const [username, setUsername] = useState("aarav.sharma@meridian.in");
  const [password, setPassword] = useState("");
  const c = scenario.contentJson || {};
  const url = String(c.fakeLoginPageUrl || "https://sso.example.com/login");
  const isHttps = url.startsWith("https://");

  return (
    <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden relative">
      {/* Browser Bar */}
      <div className="border-b border-border bg-canvas px-4 py-2.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-secondary">
            Browser Window · {c.fakeLoginBrandedCompany || "Sign-In"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmitDecision("REPORT_PHISH")}
              className="inline-flex items-center gap-1.5 rounded-md bg-risk-high px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Report phishing site</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmitDecision("ENTER_CREDENTIALS")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-primary hover:bg-subtle"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-risk-low" />
              <span>Legitimate site</span>
            </button>
          </div>
        </div>

        {/* Address Bar */}
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => setShowCert((v) => !v)}
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ${
              isHttps
                ? "bg-green-50 text-risk-low"
                : "bg-red-50 text-risk-high"
            }`}
          >
            {isHttps ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            <span>{isHttps ? "HTTPS" : "Not Secure"}</span>
          </button>
          <span className="text-ink-primary select-all break-all">{url}</span>
        </div>

        {showCert && (
          <div className="rounded-md border border-border bg-surface p-3 text-xs text-ink-secondary space-y-1">
            <div>
              <span className="font-semibold text-ink-primary">Host:</span>{" "}
              <span className="font-mono">{url.split("/")[2]}</span>
            </div>
            <div>
              HTTPS encrypts transit traffic, but attackers can also obtain valid TLS certificates for lookalike domains.
            </div>
          </div>
        )}
      </div>

      {/* Rendered Login Form */}
      <div className="p-8 bg-canvas flex justify-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitDecision("ENTER_CREDENTIALS");
          }}
          className="max-w-sm w-full rounded-lg border border-border bg-surface p-6 shadow-card space-y-4"
        >
          <div>
            <h3 className="text-base font-semibold text-ink-primary">
              {c.fakeLoginBrandedCompany || "Corporate SSO"}
            </h3>
            <p className="text-xs text-ink-secondary mt-0.5 whitespace-pre-line">
              {c.body}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-primary mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Simulated password field"
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
