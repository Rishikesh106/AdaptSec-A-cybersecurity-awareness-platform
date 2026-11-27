"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

interface LessonItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
  contentMarkdown: string;
  checkpointsJson: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

interface TrackDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  skillTag: string;
  lessons: LessonItem[];
  scenarios: {
    id: string;
    slug: string;
    title: string;
    channel: string;
    difficulty: string;
  }[];
}

export default function TrackDetailPage() {
  const params = useParams();
  const slug = String(params?.slug ?? "");
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["track", slug],
    queryFn: () =>
      apiClient.get<{ track: TrackDetail }>(`/api/v1/tracks/${slug}`),
    enabled: Boolean(slug),
  });

  const track = data?.track;
  const activeLesson = track?.lessons[selectedLessonIdx];
  const checkpoint = activeLesson?.checkpointsJson?.[0];

  return (
    <AppShell breadcrumb={track?.title ?? "Track"}>
      <div className="space-y-6">
        <Link
          href="/tracks"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All learning paths</span>
        </Link>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-surface p-6 text-sm text-ink-secondary">
            Loading track curriculum...
          </div>
        ) : isError || !track ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-risk-high">
            Learning track not found.
          </div>
        ) : (
          <>
            <div className="border-b border-border pb-4">
              <h1 className="text-xl font-semibold text-ink-primary">
                {track.title}
              </h1>
              <p className="mt-1 text-sm text-ink-secondary">
                {track.description}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lesson Selector */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Lessons ({track.lessons.length})
                </div>
                {track.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      setSelectedLessonIdx(idx);
                      setSelectedOption(null);
                      setChecked(false);
                    }}
                    className={`w-full text-left rounded-md border p-3 text-sm transition-colors ${
                      idx === selectedLessonIdx
                        ? "border-brand bg-brand-tint text-brand font-medium"
                        : "border-border bg-surface text-ink-primary hover:bg-subtle"
                    }`}
                  >
                    <div className="text-xs text-ink-muted tabular-nums">
                      Lesson {idx + 1} · {lesson.durationMinutes} min
                    </div>
                    <div className="mt-0.5">{lesson.title}</div>
                  </button>
                ))}

                <div className="pt-4 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Linked Simulations ({track.scenarios.length})
                  </div>
                  <div className="rounded-lg border border-border bg-surface divide-y divide-border">
                    {track.scenarios.slice(0, 5).map((s) => (
                      <div key={s.id} className="p-2.5 text-xs">
                        <div className="font-medium text-ink-primary">
                          {s.title}
                        </div>
                        <div className="text-ink-muted mt-0.5">
                          {s.channel} · {s.difficulty}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Lesson Reader */}
              <div className="lg:col-span-2 rounded-lg border border-border bg-surface p-6 shadow-card space-y-6">
                {activeLesson && (
                  <>
                    <div className="border-b border-border pb-3">
                      <div className="text-xs text-ink-muted">
                        Lesson {selectedLessonIdx + 1} · {activeLesson.durationMinutes} min read
                      </div>
                      <h2 className="text-lg font-semibold text-ink-primary mt-0.5">
                        {activeLesson.title}
                      </h2>
                    </div>

                    <div className="text-sm text-ink-primary leading-relaxed whitespace-pre-line">
                      {activeLesson.contentMarkdown}
                    </div>

                    {checkpoint && (
                      <div className="rounded-md border border-border bg-canvas p-4 space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                          Comprehension Check
                        </div>
                        <p className="text-sm font-medium text-ink-primary">
                          {checkpoint.question}
                        </p>
                        <div className="space-y-2">
                          {checkpoint.options.map((opt, oIdx) => {
                            const isSelected = selectedOption === oIdx;
                            const isCorrect = oIdx === checkpoint.correctIndex;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={checked}
                                onClick={() => setSelectedOption(oIdx)}
                                className={`w-full text-left rounded-md border px-3 py-2 text-xs flex items-center justify-between ${
                                  checked && isCorrect
                                    ? "border-green-300 bg-green-50 text-risk-low font-medium"
                                    : checked && isSelected && !isCorrect
                                    ? "border-red-300 bg-red-50 text-risk-high"
                                    : isSelected
                                    ? "border-brand bg-brand-tint text-brand font-medium"
                                    : "border-border bg-surface text-ink-primary hover:bg-subtle"
                                }`}
                              >
                                <span>{opt}</span>
                                {checked && isCorrect && (
                                  <CheckCircle2 className="h-4 w-4 text-risk-low shrink-0" />
                                )}
                                {checked && isSelected && !isCorrect && (
                                  <XCircle className="h-4 w-4 text-risk-high shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {!checked ? (
                          <button
                            type="button"
                            disabled={selectedOption === null}
                            onClick={() => setChecked(true)}
                            className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover disabled:opacity-50"
                          >
                            Check answer
                          </button>
                        ) : (
                          <p className="text-xs text-ink-secondary bg-surface border border-border rounded p-2.5">
                            {checkpoint.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
