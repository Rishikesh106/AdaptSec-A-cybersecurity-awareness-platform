"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SEED_TRACKS, SEED_LESSONS } from "@/data/seedTracks";
import { useApp } from "@/context/AppContext";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Award,
} from "lucide-react";

export default function TrackDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addXp, updateSkillScore } = useApp();

  const track = SEED_TRACKS.find((t) => t.slug === slug) || SEED_TRACKS[0];
  const lessons = SEED_LESSONS.filter((l) => l.trackId === track.id);

  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  const [selectedCheckpointOption, setSelectedCheckpointOption] = useState<number | null>(null);
  const [checkpointSubmitted, setCheckpointSubmitted] = useState<boolean>(false);

  const currentLesson = lessons[activeLessonIdx] || lessons[0];

  const handleCheckpointSubmit = () => {
    if (selectedCheckpointOption === null || checkpointSubmitted) return;
    const checkpoint = currentLesson?.checkpoints?.[0];
    const isCorrect = selectedCheckpointOption === checkpoint?.correctIndex;

    addXp(isCorrect ? 100 : 25);
    if (isCorrect) {
      updateSkillScore(track.skillTag, 85);
    }
    setCheckpointSubmitted(true);
  };

  const handleNextLesson = () => {
    if (activeLessonIdx + 1 < lessons.length) {
      setActiveLessonIdx((prev) => prev + 1);
      setSelectedCheckpointOption(null);
      setCheckpointSubmitted(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/tracks"
        className="inline-flex items-center gap-1.5 text-xs text-cyber-muted hover:text-white transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to All Learning Paths</span>
      </Link>

      {/* Header */}
      <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 space-y-2">
        <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
          Learning Track • {track.skillTag.replace("_", " ")}
        </span>
        <h1 className="text-2xl font-bold text-white">{track.title}</h1>
        <p className="text-xs text-cyber-muted">{track.description}</p>
      </div>

      {/* Lesson Reader & Checkpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lesson Selector */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-muted font-mono px-1">
            Curriculum Modules
          </h3>
          <div className="space-y-1.5">
            {lessons.map((lesson, idx) => {
              const isActive = idx === activeLessonIdx;
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setActiveLessonIdx(idx);
                    setSelectedCheckpointOption(null);
                    setCheckpointSubmitted(false);
                  }}
                  className={`w-full text-left rounded-xl p-3 text-xs transition border flex items-center justify-between ${
                    isActive
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200 font-semibold"
                      : "border-cyber-border bg-cyber-card text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <span className="text-[10px] text-cyber-muted font-mono block">Lesson 0{idx + 1}</span>
                    <span className="line-clamp-1">{lesson.title}</span>
                  </div>
                  <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Lesson Content */}
        <div className="lg:col-span-2 rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-cyber-border pb-4 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              Lesson 0{activeLessonIdx + 1} of {lessons.length} • {currentLesson?.durationMinutes} mins
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">{currentLesson?.title}</h2>
          </div>

          {/* Lesson Body Content */}
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-3 whitespace-pre-line text-xs sm:text-sm">
            {currentLesson?.contentMarkdown}
          </div>

          {/* Interactive Checkpoint */}
          {currentLesson?.checkpoints && currentLesson.checkpoints.length > 0 && (
            <div className="rounded-2xl border border-cyber-border bg-[#050811] p-5 space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                Comprehension Checkpoint
              </span>
              <p className="text-xs font-semibold text-slate-200">
                {currentLesson.checkpoints[0].question}
              </p>

              <div className="space-y-2">
                {currentLesson.checkpoints[0].options.map((opt, optIdx) => {
                  const isSelected = selectedCheckpointOption === optIdx;
                  let optClass = "border-cyber-border bg-slate-900/60 text-slate-300";
                  if (isSelected) optClass = "border-cyan-400 bg-cyan-500/10 text-cyan-200";
                  if (checkpointSubmitted) {
                    if (optIdx === currentLesson.checkpoints[0].correctIndex) {
                      optClass = "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold";
                    } else if (isSelected) {
                      optClass = "border-rose-500 bg-rose-500/20 text-rose-300";
                    }
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => !checkpointSubmitted && setSelectedCheckpointOption(optIdx)}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs cursor-pointer transition ${optClass}`}
                    >
                      <div className="h-4 w-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">
                        {isSelected ? "✓" : ""}
                      </div>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {!checkpointSubmitted ? (
                <button
                  onClick={handleCheckpointSubmit}
                  disabled={selectedCheckpointOption === null}
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold px-4 py-2 text-xs transition"
                >
                  Verify Checkpoint
                </button>
              ) : (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-cyber-border">
                    {currentLesson.checkpoints[0].explanation}
                  </p>
                  {activeLessonIdx + 1 < lessons.length && (
                    <button
                      onClick={handleNextLesson}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-4 py-2 text-xs transition"
                    >
                      <span>Proceed to Next Lesson</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
