"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";
import { useToast } from "@/components/providers/QueryProvider";
import { InboxSimulator } from "@/components/simulators/InboxSimulator";
import { SmsWhatsappSimulator } from "@/components/simulators/SmsWhatsappSimulator";
import { UpiSimulator } from "@/components/simulators/UpiSimulator";
import { VoiceCallSimulator } from "@/components/simulators/VoiceCallSimulator";
import { FakeLoginSpotter } from "@/components/simulators/FakeLoginSpotter";
import {
  SimulationFeedbackPanel,
  type AttemptFeedbackResponse,
} from "@/components/simulators/SimulationFeedbackPanel";
import { ArrowLeft, Clock } from "lucide-react";

export default function SimulationRunnerPage() {
  const params = useParams();
  const slug = String(params?.slug ?? "");
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);
  const [feedback, setFeedback] = useState<AttemptFeedbackResponse | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["scenario-detail", slug],
    queryFn: () =>
      apiClient.get<{ scenario: any }>(`/api/v1/scenarios/${slug}`),
    enabled: Boolean(slug),
  });

  useEffect(() => {
    setStartedAt(Date.now());
    setElapsedSec(0);
    setFeedback(null);
  }, [slug]);

  useEffect(() => {
    if (feedback) return;
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, feedback]);

  const submitMutation = useMutation({
    mutationFn: (payload: { scenarioId: string; decision: string; timeMs: number }) =>
      apiClient.post<AttemptFeedbackResponse>("/api/v1/attempts", payload),
    onSuccess: (res) => {
      setFeedback(res);
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["attempts"] });
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  const scenario = data?.scenario;

  const handleDecision = (decision: string) => {
    if (!scenario || submitMutation.isPending) return;
    const timeMs = Math.max(500, Date.now() - startedAt);
    submitMutation.mutate({
      scenarioId: scenario.id,
      decision,
      timeMs,
    });
  };

  return (
    <AppShell breadcrumb={scenario?.title ?? "Simulation"}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <Link
            href="/simulations"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to simulations</span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-ink-secondary tabular-nums">
            {scenario && (
              <span>
                {scenario.channel} · {scenario.difficulty} ·{" "}
                {scenario.skillTag.replace("_", " ")}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded border border-border bg-surface px-2 py-0.5 font-mono text-ink-primary">
              <Clock className="h-3.5 w-3.5 text-ink-muted" />
              {elapsedSec}s
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-secondary">
            Loading simulation environment...
          </div>
        ) : isError || !scenario ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-risk-high">
            Simulation scenario could not be loaded.
          </div>
        ) : feedback ? (
          <SimulationFeedbackPanel
            feedback={feedback}
            onRetry={() => {
              setFeedback(null);
              setStartedAt(Date.now());
              setElapsedSec(0);
            }}
          />
        ) : (
          <>
            {scenario.channel === "INBOX" && (
              <InboxSimulator
                scenario={scenario}
                onSubmitDecision={handleDecision}
                isSubmitting={submitMutation.isPending}
              />
            )}
            {(scenario.channel === "SMS" || scenario.channel === "WHATSAPP") && (
              <SmsWhatsappSimulator
                scenario={scenario}
                onSubmitDecision={handleDecision}
                isSubmitting={submitMutation.isPending}
              />
            )}
            {scenario.channel === "UPI" && (
              <UpiSimulator
                scenario={scenario}
                onSubmitDecision={handleDecision}
                isSubmitting={submitMutation.isPending}
              />
            )}
            {scenario.channel === "VOICE_CALL" && (
              <VoiceCallSimulator
                scenario={scenario}
                onSubmitDecision={handleDecision}
                isSubmitting={submitMutation.isPending}
              />
            )}
            {scenario.channel === "FAKE_LOGIN" && (
              <FakeLoginSpotter
                scenario={scenario}
                onSubmitDecision={handleDecision}
                isSubmitting={submitMutation.isPending}
              />
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
