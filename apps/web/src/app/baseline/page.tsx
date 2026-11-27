"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";
import { useToast } from "@/components/providers/QueryProvider";
import { ArrowRight } from "lucide-react";

interface MasteryResponse {
  humanRiskScore: number;
  dueReviewsCount: number;
  skills: Array<{
    skillTag: string;
    score: number;
    attemptsCount: number;
    isDue: boolean;
  }>;
}

interface RecommendationResponse {
  recommendation: {
    type: string;
    title: string;
    skillTag: string;
    difficulty: string;
    reason: string;
    scenarioSlug?: string;
  };
}

export default function BaselinePage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [stepIdx, setStepIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const { data: quizData, isLoading } = useQuery({
    queryKey: ["baseline-questions"],
    queryFn: () =>
      apiClient.get<{
        questions: Array<{
          id: string;
          skillTag: string;
          prompt: string;
          options: { id: string; text: string }[];
        }>;
      }>("/api/v1/quiz/session?limit=5&mode=untimed"),
  });

  const { data: masteryData, refetch: refetchMastery } = useQuery({
    queryKey: ["skills-mastery"],
    queryFn: () => apiClient.get<MasteryResponse>("/api/v1/skills/mastery"),
  });

  const { data: recData, refetch: refetchRec } = useQuery({
    queryKey: ["recommendation-next"],
    queryFn: () =>
      apiClient.get<RecommendationResponse>("/api/v1/recommendations/next"),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: {
      questionId: string;
      decision: string;
      selectedOptionIds: string[];
      timeMs: number;
    }) => apiClient.post("/api/v1/attempts", payload),
    onSuccess: async () => {
      setSelectedId(null);
      if (quizData && stepIdx + 1 < quizData.questions.length) {
        setStepIdx((i) => i + 1);
      } else {
        await Promise.all([
          refetchMastery(),
          refetchRec(),
          queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
        ]);
        setCompleted(true);
      }
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  const activeQ = quizData?.questions[stepIdx];

  return (
    <AppShell breadcrumb="Baseline Assessment">
      <div className="space-y-6 max-w-3xl">
        <div className="border-b border-border pb-4">
          <h1 className="text-xl font-semibold text-ink-primary">
            Adaptive Baseline Assessment
          </h1>
          <p className="text-sm text-ink-secondary">
            Calibrate your initial Human Risk Profile across security domains and generate a tailored learning path.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-secondary">
            Preparing baseline calibration...
          </div>
        ) : completed ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-border bg-surface p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-base font-semibold text-ink-primary">
                    Calibrated Human Risk Profile
                  </h2>
                  <p className="text-xs text-ink-secondary">
                    Calculated server-side from your baseline responses.
                  </p>
                </div>
                <div className="text-right tabular-nums">
                  <span className="text-xs text-ink-muted block">Risk Score</span>
                  <span className="text-2xl font-semibold text-ink-primary">
                    {masteryData?.humanRiskScore ?? 50}/100
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {masteryData?.skills.map((s) => (
                  <div key={s.skillTag} className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-ink-primary">
                        {s.skillTag.replace("_", " ")}
                      </span>
                      <span className="tabular-nums text-ink-secondary">
                        {s.score}/100
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded bg-subtle overflow-hidden">
                      <div
                        className="h-full bg-brand"
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {recData?.recommendation && (
              <div className="rounded-lg border border-brand-border bg-brand-tint p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand">
                    Recommended Next Activity
                  </div>
                  <div className="text-sm font-semibold text-ink-primary mt-0.5">
                    {recData.recommendation.title}
                  </div>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    {recData.recommendation.reason}
                  </p>
                </div>
                <Link
                  href={
                    recData.recommendation.scenarioSlug
                      ? `/simulations/${recData.recommendation.scenarioSlug}`
                      : "/simulations"
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover shrink-0"
                >
                  <span>Start recommended</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        ) : activeQ ? (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-card space-y-4">
            <div className="text-xs text-ink-muted tabular-nums">
              Step {stepIdx + 1} of {quizData?.questions.length} ·{" "}
              {activeQ.skillTag.replace("_", " ")}
            </div>
            <h2 className="text-base font-medium text-ink-primary">
              {activeQ.prompt}
            </h2>

            <div className="space-y-2">
              {activeQ.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedId(opt.id)}
                  className={`w-full text-left rounded-md border px-3.5 py-2.5 text-sm ${
                    selectedId === opt.id
                      ? "border-brand bg-brand-tint text-brand font-medium"
                      : "border-border bg-surface text-ink-primary hover:bg-subtle"
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                disabled={!selectedId || submitMutation.isPending}
                onClick={() => {
                  if (!selectedId) return;
                  submitMutation.mutate({
                    questionId: activeQ.id,
                    decision: selectedId,
                    selectedOptionIds: [selectedId],
                    timeMs: 9000,
                  });
                }}
                className="rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover disabled:opacity-50"
              >
                {submitMutation.isPending ? "Saving..." : "Continue"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
