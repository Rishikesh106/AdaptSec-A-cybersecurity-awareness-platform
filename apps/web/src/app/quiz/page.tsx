"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";
import { useToast } from "@/components/providers/QueryProvider";
import { CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react";

interface QuizQuestion {
  id: string;
  type: "MCQ" | "MULTI_SELECT" | "SCENARIO_BASED" | "DRAG_MATCH" | "SPOT_FLAG";
  skillTag: string;
  difficulty: string;
  prompt: string;
  matchPairsJson?: { left: string; right: string }[] | null;
  options: { id: string; text: string }[];
  isSpacedReview: boolean;
}

interface QuizSessionResponse {
  mode: "untimed" | "timed";
  timeLimitSeconds: number | null;
  questions: QuizQuestion[];
}

interface QuestionAttemptResult {
  isCorrect: boolean;
  correctOptionIds: string[];
  explanation: string;
  xpAwarded: number;
  skillMastery: {
    skillTag: string;
    score: number;
    delta: number;
    nextReviewAt: string;
  };
}

export default function QuizPage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const [mode, setMode] = useState<"untimed" | "timed">("untimed");
  const [skillFilter, setSkillFilter] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [questionStart, setQuestionStart] = useState<number>(Date.now());
  const [timeLeftSec, setTimeLeftSec] = useState<number | null>(null);
  const [currentResult, setCurrentResult] = useState<QuestionAttemptResult | null>(null);
  const [reviewLog, setReviewLog] = useState<
    Array<{ prompt: string; isCorrect: boolean; explanation: string }>
  >([]);
  const [finished, setFinished] = useState(false);

  const queryParams = new URLSearchParams({
    mode,
    limit: "8",
    ...(skillFilter ? { skillTag: skillFilter } : {}),
  }).toString();

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["quiz-session", mode, skillFilter],
    queryFn: () =>
      apiClient.get<QuizSessionResponse>(`/api/v1/quiz/session?${queryParams}`),
    enabled: false,
  });

  useEffect(() => {
    if (!sessionActive || finished || timeLeftSec === null) return;
    if (timeLeftSec <= 0) {
      setFinished(true);
      return;
    }
    const t = setInterval(() => setTimeLeftSec((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearInterval(t);
  }, [sessionActive, finished, timeLeftSec]);

  const submitMutation = useMutation({
    mutationFn: (payload: {
      questionId: string;
      decision: string;
      selectedOptionIds: string[];
      timeMs: number;
    }) => apiClient.post<QuestionAttemptResult>("/api/v1/attempts", payload),
    onSuccess: (res, vars) => {
      setCurrentResult(res);
      const q = data?.questions[currentIdx];
      if (q) {
        setReviewLog((prev) => [
          ...prev,
          { prompt: q.prompt, isCorrect: res.isCorrect, explanation: res.explanation },
        ]);
      }
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["skills-mastery"] });
      void vars;
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  const handleStart = async () => {
    const res = await refetch();
    if (res.data) {
      setSessionActive(true);
      setFinished(false);
      setCurrentIdx(0);
      setSelectedIds([]);
      setCurrentResult(null);
      setReviewLog([]);
      setQuestionStart(Date.now());
      setTimeLeftSec(res.data.timeLimitSeconds);
    }
  };

  const currentQuestion = data?.questions[currentIdx];

  const toggleOption = (id: string) => {
    if (currentResult || !currentQuestion) return;
    if (currentQuestion.type === "MULTI_SELECT") {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || selectedIds.length === 0) return;
    submitMutation.mutate({
      questionId: currentQuestion.id,
      decision: selectedIds[0],
      selectedOptionIds: selectedIds,
      timeMs: Math.max(500, Date.now() - questionStart),
    });
  };

  const handleNext = () => {
    if (!data) return;
    if (currentIdx + 1 < data.questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedIds([]);
      setCurrentResult(null);
      setQuestionStart(Date.now());
    } else {
      setFinished(true);
    }
  };

  return (
    <AppShell breadcrumb="Adaptive Quiz">
      <div className="space-y-6 max-w-3xl">
        <div className="border-b border-border pb-4">
          <h1 className="text-xl font-semibold text-ink-primary">
            Adaptive Knowledge Quiz
          </h1>
          <p className="text-sm text-ink-secondary">
            Non-repeating questions prioritized by SM-2 spaced repetition and your lowest skill domains.
          </p>
        </div>

        {!sessionActive ? (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-card space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="quiz-mode"
                  className="block text-xs font-medium text-ink-primary mb-1"
                >
                  Session Mode
                </label>
                <select
                  id="quiz-mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as "untimed" | "timed")}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-primary"
                >
                  <option value="untimed">Untimed Practice</option>
                  <option value="timed">Timed Assessment (45s / question)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="quiz-skill"
                  className="block text-xs font-medium text-ink-primary mb-1"
                >
                  Skill Domain Filter
                </label>
                <select
                  id="quiz-skill"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-primary"
                >
                  <option value="">Adaptive Mix (All Skills)</option>
                  <option value="phishing">Phishing & Smishing</option>
                  <option value="credentials">Passwords & MFA</option>
                  <option value="payments">Payment & UPI Fraud</option>
                  <option value="social_eng">Social Engineering</option>
                  <option value="browsing_wifi">Safe Browsing & Wi-Fi</option>
                  <option value="data_privacy">Data Privacy</option>
                  <option value="incident_response">Incident Reporting</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              disabled={isFetching}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
            >
              {isFetching ? "Preparing quiz..." : "Start quiz session"}
            </button>
          </div>
        ) : finished ? (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-base font-semibold text-ink-primary">
                  Session Review
                </h2>
                <p className="text-xs text-ink-secondary tabular-nums">
                  Answered {reviewLog.filter((r) => r.isCorrect).length} of{" "}
                  {reviewLog.length} correctly
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>New session</span>
              </button>
            </div>

            <div className="space-y-3">
              {reviewLog.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-border bg-canvas p-3.5 text-xs space-y-1"
                >
                  <div className="flex items-start justify-between gap-2 font-medium text-ink-primary">
                    <span>
                      {idx + 1}. {item.prompt}
                    </span>
                    <span
                      className={
                        item.isCorrect ? "text-risk-low shrink-0" : "text-risk-high shrink-0"
                      }
                    >
                      {item.isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <p className="text-ink-secondary">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between text-xs text-ink-muted border-b border-border pb-3 tabular-nums">
              <span>
                Question {currentIdx + 1} of {data?.questions.length} ·{" "}
                {currentQuestion.type} · {currentQuestion.skillTag.replace("_", " ")}
                {currentQuestion.isSpacedReview ? " · Spaced Review" : ""}
              </span>
              {timeLeftSec !== null && (
                <span className="inline-flex items-center gap-1 font-mono text-ink-primary">
                  <Clock className="h-3.5 w-3.5" />
                  {timeLeftSec}s
                </span>
              )}
            </div>

            <h2 className="text-base font-medium text-ink-primary leading-snug">
              {currentQuestion.prompt}
            </h2>

            {currentQuestion.type === "MULTI_SELECT" && (
              <p className="text-xs text-ink-muted">Select all options that apply.</p>
            )}

            <div className="space-y-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                const isCorrectOpt = currentResult?.correctOptionIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={Boolean(currentResult)}
                    onClick={() => toggleOption(opt.id)}
                    className={`w-full text-left rounded-md border px-3.5 py-2.5 text-sm flex items-center justify-between ${
                      currentResult && isCorrectOpt
                        ? "border-green-300 bg-green-50 text-risk-low font-medium"
                        : currentResult && isSelected && !isCorrectOpt
                        ? "border-red-300 bg-red-50 text-risk-high"
                        : isSelected
                        ? "border-brand bg-brand-tint text-brand font-medium"
                        : "border-border bg-surface text-ink-primary hover:bg-subtle"
                    }`}
                  >
                    <span>{opt.text}</span>
                    {currentResult && isCorrectOpt && (
                      <CheckCircle2 className="h-4 w-4 text-risk-low shrink-0" />
                    )}
                    {currentResult && isSelected && !isCorrectOpt && (
                      <XCircle className="h-4 w-4 text-risk-high shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {currentResult && (
              <div className="rounded-md border border-border bg-canvas p-3.5 text-xs space-y-1">
                <div className="font-semibold text-ink-primary">
                  {currentResult.isCorrect ? "Correct" : "Incorrect"} (+
                  {currentResult.xpAwarded} XP · Skill score{" "}
                  {currentResult.skillMastery.score}/100)
                </div>
                <p className="text-ink-secondary">{currentResult.explanation}</p>
                <p className="text-ink-muted">
                  Next SM-2 review:{" "}
                  {new Date(currentResult.skillMastery.nextReviewAt).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border">
              {!currentResult ? (
                <button
                  type="button"
                  disabled={selectedIds.length === 0 || submitMutation.isPending}
                  onClick={handleSubmitAnswer}
                  className="rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover disabled:opacity-50"
                >
                  {submitMutation.isPending ? "Scoring..." : "Submit answer"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-md bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-brand-hover"
                >
                  {currentIdx + 1 < (data?.questions.length ?? 0)
                    ? "Next question"
                    : "View summary"}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
