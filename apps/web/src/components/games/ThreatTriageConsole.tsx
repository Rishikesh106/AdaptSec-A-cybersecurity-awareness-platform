"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/providers/QueryProvider";
import { ShieldAlert, ShieldCheck, Clock, RotateCcw } from "lucide-react";

interface TriageItem {
  id: string;
  sender: string;
  subject: string;
  preview: string;
}

interface TriageReview {
  itemId: string;
  subject: string;
  action: string;
  isCorrect: boolean;
  actualLabel: string;
  explanation: string;
}

export function ThreatTriageConsole({
  mode = "threat-triage",
}: {
  mode?: "threat-triage" | "daily-spot";
}) {
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [items, setItems] = useState<TriageItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [result, setResult] = useState<{
    serverScore: number;
    xpAwarded: number;
    review: TriageReview[];
  } | null>(null);

  const startMutation = useMutation({
    mutationFn: () =>
      apiClient.post<{
        sessionId: string;
        timeLimitSeconds: number;
        items: TriageItem[];
      }>(`/api/v1/games/${mode}/start`),
    onSuccess: (res) => {
      setSessionId(res.sessionId);
      setItems(res.items);
      setIdx(0);
      setTimeLeft(res.timeLimitSeconds);
      setResult(null);
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  const finishMutation = useMutation({
    mutationFn: (sid: string) =>
      apiClient.post<{
        serverScore: number;
        xpAwarded: number;
        review: TriageReview[];
      }>(`/api/v1/games/${mode}/finish`, { sessionId: sid }),
    onSuccess: (res) => {
      setResult(res);
      setSessionId(null);
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  const eventMutation = useMutation({
    mutationFn: (payload: {
      sessionId: string;
      itemId: string;
      action: "REPORT" | "SAFE";
    }) => apiClient.post(`/api/v1/games/${mode}/event`, payload),
    onSuccess: () => {
      if (idx + 1 < items.length) {
        setIdx((i) => i + 1);
      } else if (sessionId) {
        finishMutation.mutate(sessionId);
      }
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  useEffect(() => {
    if (!sessionId || result) return;
    if (timeLeft <= 0) {
      finishMutation.mutate(sessionId);
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [sessionId, result, timeLeft]);

  const current = items[idx];

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-card space-y-5">
      <div className="border-b border-border pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink-primary">
            {mode === "daily-spot"
              ? "Daily 60-Second Spot the Scam"
              : "Threat Triage Console"}
          </h2>
          <p className="text-xs text-ink-secondary">
            Rapidly classify incoming messages as Phish or Safe. Every decision is validated and scored server-side.
          </p>
        </div>
        {sessionId && (
          <span className="inline-flex items-center gap-1 rounded border border-border bg-canvas px-2.5 py-1 text-xs font-mono text-ink-primary tabular-nums">
            <Clock className="h-3.5 w-3.5 text-ink-muted" />
            {timeLeft}s
          </span>
        )}
      </div>

      {!sessionId && !result && (
        <div className="py-6 text-center space-y-4">
          <p className="text-sm text-ink-secondary max-w-md mx-auto">
            False positives and missed phishing messages both reduce your round score. Review all explanations at the end of the round.
          </p>
          <button
            type="button"
            disabled={startMutation.isPending}
            onClick={() => startMutation.mutate()}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {startMutation.isPending ? "Starting session..." : "Start triage round"}
          </button>
        </div>
      )}

      {sessionId && current && (
        <div className="space-y-4">
          <div className="text-xs text-ink-muted tabular-nums">
            Message {idx + 1} of {items.length}
          </div>
          <div className="rounded-md border border-border bg-canvas p-4 space-y-2">
            <div className="text-xs font-mono text-ink-secondary">
              From: {current.sender}
            </div>
            <div className="text-sm font-semibold text-ink-primary">
              {current.subject}
            </div>
            <p className="text-sm text-ink-secondary">{current.preview}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={eventMutation.isPending || finishMutation.isPending}
              onClick={() =>
                eventMutation.mutate({
                  sessionId,
                  itemId: current.id,
                  action: "REPORT",
                })
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-risk-high px-4 py-2.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Report phish</span>
            </button>
            <button
              type="button"
              disabled={eventMutation.isPending || finishMutation.isPending}
              onClick={() =>
                eventMutation.mutate({
                  sessionId,
                  itemId: current.id,
                  action: "SAFE",
                })
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2.5 text-xs font-medium text-ink-primary hover:bg-subtle disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4 text-risk-low" />
              <span>Mark safe</span>
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-border bg-canvas p-4">
            <div>
              <div className="text-xs text-ink-muted">Server-Validated Score</div>
              <div className="text-xl font-semibold text-ink-primary tabular-nums">
                {result.serverScore} pts (+{result.xpAwarded} XP)
              </div>
            </div>
            <button
              type="button"
              onClick={() => startMutation.mutate()}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Play again</span>
            </button>
          </div>

          <div className="space-y-2">
            {result.review.map((r) => (
              <div
                key={r.itemId}
                className="rounded-md border border-border bg-surface p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-medium">
                  <span className="text-ink-primary">{r.subject}</span>
                  <span className={r.isCorrect ? "text-risk-low" : "text-risk-high"}>
                    {r.isCorrect ? "Correct" : "Missed"} (Actual: {r.actualLabel})
                  </span>
                </div>
                <p className="text-ink-secondary">{r.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
