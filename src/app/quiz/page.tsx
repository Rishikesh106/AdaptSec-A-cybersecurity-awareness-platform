"use client";

import React, { useState } from "react";
import { SEED_QUESTIONS } from "@/data/seedQuestions";
import { Question } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { calculateSM2NextReview } from "@/lib/adaptive";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

export default function AdaptiveQuizPage() {
  const { addXp, updateSkillScore, currentUser } = useApp();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [nextReviewDate, setNextReviewDate] = useState<string | null>(null);

  const question: Question = SEED_QUESTIONS[currentIndex] || SEED_QUESTIONS[0];

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;

    const chosen = question.options.find((o) => o.id === selectedOptionId);
    const isCorrect = chosen?.isCorrect ?? false;
    const elapsed = Date.now() - startTime;

    // Quality scale 0 to 5 for SM-2
    let quality = isCorrect ? 4 : 1;
    if (isCorrect && elapsed < 15000) quality = 5;

    const { nextReviewDate: scheduledDate } = calculateSM2NextReview(quality);
    setNextReviewDate(scheduledDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }));

    const currentScore = currentUser.skillsMastery[question.skillTag] || 50;
    const delta = isCorrect ? 4 : -3;
    const newScore = Math.max(0, Math.min(100, currentScore + delta));

    addXp(isCorrect ? 50 : 10);
    updateSkillScore(question.skillTag, newScore);

    setQuizScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < SEED_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setStartTime(Date.now());
      setNextReviewDate(null);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setQuizScore({ correct: 0, total: 0 });
    setIsQuizCompleted(false);
    setStartTime(Date.now());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-cyber-primary uppercase tracking-wider font-mono">
            Adaptive Knowledge Engine • SM-2 Spaced Repetition
          </span>
          <span className="text-xs font-mono text-slate-400">
            Question {currentIndex + 1} of {SEED_QUESTIONS.length}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Cyber Threat Knowledge Quiz</h1>
        <p className="text-xs text-cyber-muted leading-relaxed">
          Questions target your cognitive understanding of social engineering, UPI protocol rules, credential entropy, and incident escalation.
        </p>
      </div>

      {!isQuizCompleted ? (
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Question Tag & Prompt */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-800">
                {question.skillTag.replace("_", " ").toUpperCase()}
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                {question.difficulty}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">
              {question.prompt}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {question.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              let optionStyle = "border-cyber-border bg-[#050811] text-slate-300 hover:border-cyan-500/40";

              if (isSelected) {
                optionStyle = "border-cyan-400 bg-cyan-500/10 text-cyan-200 font-medium";
              }

              if (isAnswerSubmitted) {
                if (opt.isCorrect) {
                  optionStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold";
                } else if (isSelected && !opt.isCorrect) {
                  optionStyle = "border-rose-500 bg-rose-500/20 text-rose-300";
                }
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-xs sm:text-sm cursor-pointer transition ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected ? "border-cyan-400 bg-cyan-500 text-black font-bold" : "border-slate-600"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </div>
                    <span>{opt.text}</span>
                  </div>

                  {isAnswerSubmitted && opt.isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !opt.isCorrect && (
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Banner on Submission */}
          {isAnswerSubmitted && (
            <div className="rounded-2xl border border-cyber-border bg-[#050811] p-5 space-y-2 animate-fadeIn">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Explanation & Analysis
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{question.explanation}</p>
              {nextReviewDate && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-300 font-mono">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span>SM-2 Spaced Repetition Review Scheduled: {nextReviewDate}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-cyber-border">
            <span className="text-xs font-mono text-cyber-muted">
              Current Session: {quizScore.correct}/{quizScore.total} Correct
            </span>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOptionId}
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold px-5 py-2 text-xs shadow-lg shadow-cyan-950/40 transition"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2 text-xs shadow-lg shadow-cyan-950/40 transition"
              >
                <span>{currentIndex + 1 < SEED_QUESTIONS.length ? "Next Question" : "View Final Results"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Complete Screen */
        <div className="rounded-3xl border border-cyber-border bg-cyber-card p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyber-primary border border-cyan-500/40">
            <Sparkles className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Quiz Session Completed!</h2>
            <p className="text-sm text-cyber-muted">
              You scored <span className="font-bold text-cyan-300">{quizScore.correct}</span> out of{" "}
              <span className="font-bold text-white">{quizScore.total}</span> questions.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 text-xs transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Take Another Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
