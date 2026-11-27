"use client";

import React from "react";
import Link from "next/link";
import { SEED_TRACKS } from "@/data/seedTracks";
import {
  GraduationCap,
  Clock,
  BookOpen,
  ArrowRight,
  Shield,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function TracksListPage() {
  const { currentUser } = useApp();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-[#0b1329] to-[#0d1838] p-6 sm:p-8 space-y-2 shadow-2xl">
        <span className="text-xs font-bold text-cyber-primary uppercase tracking-wider font-mono">
          Structured Cyber Defense Curriculum
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Learning Paths & Tracks
        </h1>
        <p className="text-xs sm:text-sm text-cyber-muted leading-relaxed max-w-2xl">
          Progress from fundamentals to advanced defense in bite-sized 3-5 minute interactive lessons, simulation checkpoints, and verifiable competency certificates.
        </p>
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SEED_TRACKS.map((track, idx) => {
          const userMastery = currentUser.skillsMastery[track.skillTag] || 50;

          return (
            <div
              key={track.id}
              className="flex flex-col justify-between rounded-2xl border border-cyber-border bg-cyber-card hover:border-cyan-500/40 p-6 space-y-4 transition shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-300 font-mono border border-cyan-800">
                    Track 0{idx + 1}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    Mastery: {userMastery}%
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                    {track.title}
                  </h3>
                  <p className="mt-1 text-xs text-cyber-muted leading-relaxed">
                    {track.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyber-secondary transition-all"
                    style={{ width: `${userMastery}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-cyber-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-cyber-muted font-mono text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {track.estimatedMinutes} mins
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {track.lessonsCount} Lessons
                  </span>
                </div>

                <Link
                  href={`/tracks/${track.slug}`}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 font-semibold transition"
                >
                  <span>Start Track</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
