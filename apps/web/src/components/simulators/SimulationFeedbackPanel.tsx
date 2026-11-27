"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";

export interface AttemptFeedbackResponse {
  isCorrect: boolean;
  correctAction: string;
  explanation: string;
  whatToDoInstead: string;
  redFlags: Array<{
    id: string;
    category: string;
    title: string;
    explanation: string;
    severity: string;
  }>;
  flagsFound: string[];
  flagsMissed: string[];
  xpAwarded: number;
  skillMastery: {
    skillTag: string;
    score: number;
    delta: number;
    nextReviewAt: string;
  };
  attempt: {
    timeMs: number;
    decision: string;
  };
}

interface SimulationFeedbackPanelProps {
  feedback: AttemptFeedbackResponse;
  onRetry: () => void;
}

export function SimulationFeedbackPanel({
  feedback,
  onRetry,
}: SimulationFeedbackPanelProps) {
  const sec = (feedback.attempt.timeMs / 1000).toFixed(1);

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-card space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          {feedback.isCorrect ? (
            <CheckCircle2 className="h-6 w-6 text-risk-low shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-6 w-6 text-risk-high shrink-0 mt-0.5" />
          )}
          <div>
            <h2 className="text-base font-semibold text-ink-primary">
              {feedback.isCorrect
                ? "Correct threat assessment"
                : "Missed threat indicator"}
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Your decision: {feedback.attempt.decision} · Expected:{" "}
              {feedback.correctAction}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs tabular-nums">
          <div>
            <span className="text-ink-muted block">Decision Time</span>
            <span className="font-semibold text-ink-primary">{sec}s</span>
          </div>
          <div>
            <span className="text-ink-muted block">XP Awarded</span>
            <span className="font-semibold text-brand">+{feedback.xpAwarded} XP</span>
          </div>
          <div>
            <span className="text-ink-muted block">
              Skill ({feedback.skillMastery.skillTag.replace("_", " ")})
            </span>
            <span className="font-semibold text-ink-primary">
              {feedback.skillMastery.score}/100 (
              {feedback.skillMastery.delta >= 0
                ? `+${feedback.skillMastery.delta}`
                : feedback.skillMastery.delta}
              )
            </span>
          </div>
        </div>
      </div>

      <div
        className={`rounded-md border p-3.5 text-sm ${
          feedback.isCorrect
            ? "border-green-200 bg-green-50 text-risk-low"
            : "border-red-200 bg-red-50 text-risk-high"
        }`}
      >
        {feedback.explanation}
      </div>

      {feedback.redFlags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Red Flags Analysis ({feedback.redFlags.length})
          </h3>
          <div className="space-y-2">
            {feedback.redFlags.map((rf) => {
              const spotted = feedback.flagsFound.includes(rf.id);
              return (
                <div
                  key={rf.id}
                  className="rounded-md border border-border bg-canvas p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-primary">
                      {rf.title}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                        spotted
                          ? "bg-green-50 text-risk-low"
                          : "bg-red-50 text-risk-high"
                      }`}
                    >
                      {spotted ? "Spotted" : "Missed"} · {rf.severity}
                    </span>
                  </div>
                  <p className="text-ink-secondary">{rf.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-md border border-brand-border bg-brand-tint p-3.5 text-xs text-ink-primary">
        <span className="font-semibold text-brand block mb-0.5">
          What to do instead
        </span>
        {feedback.whatToDoInstead}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-subtle"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Retry scenario</span>
        </button>

        <Link
          href="/simulations"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
        >
          <span>Back to simulation catalog</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
