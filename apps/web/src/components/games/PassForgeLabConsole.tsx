"use client";

import React, { useState, useMemo } from "react";
import zxcvbn from "zxcvbn";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/providers/QueryProvider";
import { CheckCircle2, Lock } from "lucide-react";

export function PassForgeLabConsole() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [password, setPassword] = useState("");
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  // 100% client-side evaluation — typed password never leaves the browser
  const analysis = useMemo(() => (password ? zxcvbn(password) : null), [password]);
  const words = password
    .trim()
    .split(/[\s\-_.]+/)
    .filter((w) => w.length > 2);

  const meetsLength = password.length >= 16;
  const meetsWords = words.length >= 4;
  const meetsStrength = (analysis?.score ?? 0) >= 4;
  const challengePassed = meetsLength && meetsWords && meetsStrength;

  const verifyChallengeMutation = useMutation({
    mutationFn: async () => {
      const start = await apiClient.post<{ sessionId: string }>(
        "/api/v1/games/passforge/start"
      );
      await apiClient.post("/api/v1/games/passforge/event", {
        sessionId: start.sessionId,
        length: password.length,
        wordCount: words.length,
        zxcvbnScore: analysis?.score ?? 0,
      });
      return apiClient.post<{ serverScore: number; xpAwarded: number }>(
        "/api/v1/games/passforge/finish",
        { sessionId: start.sessionId }
      );
    },
    onSuccess: (res) => {
      setSubmittedScore(res.serverScore);
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      notify(`Passphrase verified (+${res.xpAwarded} XP)`, "success");
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-card space-y-5">
      <div className="border-b border-border pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-ink-primary">
            PassForge Lab
          </h2>
          <p className="text-xs text-ink-secondary">
            Evaluate passphrase entropy and GPU crack-time estimates locally in your browser.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-[11px] font-medium text-risk-low">
          <Lock className="h-3 w-3" />
          Client-side only (never transmitted)
        </span>
      </div>

      {/* Challenge Constraints */}
      <div className="rounded-md border border-border bg-canvas p-4 space-y-2.5">
        <div className="text-xs font-semibold text-ink-primary">
          Challenge: Build a memorable 4-word passphrase
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className={meetsLength ? "text-risk-low font-medium" : "text-ink-muted"}>
            {meetsLength ? "✓" : "○"} 16+ characters ({password.length}/16)
          </div>
          <div className={meetsWords ? "text-risk-low font-medium" : "text-ink-muted"}>
            {meetsWords ? "✓" : "○"} 4+ dictionary words ({words.length}/4)
          </div>
          <div className={meetsStrength ? "text-risk-low font-medium" : "text-ink-muted"}>
            {meetsStrength ? "✓" : "○"} zxcvbn Score 4/4
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label
          htmlFor="passforge-input"
          className="block text-xs font-medium text-ink-primary"
        >
          Test password or passphrase
        </label>
        <input
          id="passforge-input"
          type="text"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setSubmittedScore(null);
          }}
          placeholder="e.g. harbor-velvet-quartz-meadow"
          autoComplete="off"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink-primary focus:border-brand focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {["harbor", "velvet", "quartz", "meadow", "falcon", "timber"].map(
            (w) => (
              <button
                key={w}
                type="button"
                onClick={() =>
                  setPassword((prev) => (prev ? `${prev}-${w}` : w))
                }
                className="rounded border border-border bg-canvas px-2 py-0.5 font-mono text-xs text-ink-secondary hover:bg-subtle"
              >
                +{w}
              </button>
            )
          )}
        </div>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-md border border-border bg-canvas p-4 space-y-1">
            <div className="text-xs text-ink-muted">Offline Slow-Hash Crack Time</div>
            <div className="text-base font-semibold text-ink-primary">
              {analysis.crack_times_display.offline_slow_hashing_1e4_per_second}
            </div>
            <div className="text-xs text-ink-secondary">
              Strength: {strengthLabels[analysis.score]} ({analysis.score}/4)
            </div>
          </div>

          <div className="rounded-md border border-border bg-canvas p-4 space-y-1 text-xs">
            <div className="text-ink-muted">Pattern & Breach Warnings</div>
            {analysis.feedback.warning ? (
              <p className="text-risk-high font-medium">
                {analysis.feedback.warning}
              </p>
            ) : (
              <p className="text-risk-low font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                No common dictionary or keyboard-walk patterns detected.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-ink-muted">
          {submittedScore !== null
            ? `Challenge recorded (${submittedScore} pts)`
            : "Only length, word count, and score metadata are sent on completion."}
        </span>
        <button
          type="button"
          disabled={!challengePassed || verifyChallengeMutation.isPending}
          onClick={() => verifyChallengeMutation.mutate()}
          className="rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {verifyChallengeMutation.isPending
            ? "Recording..."
            : "Complete challenge"}
        </button>
      </div>
    </div>
  );
}
