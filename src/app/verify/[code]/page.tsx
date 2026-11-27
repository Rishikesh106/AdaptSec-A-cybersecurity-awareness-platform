"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Award,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function PublicVerifyCertificatePage() {
  const params = useParams();
  const code = params?.code as string;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-500/40 bg-cyber-card p-8 sm:p-10 space-y-6 shadow-2xl text-center relative overflow-hidden">
        {/* Verification Verified Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xl shadow-emerald-950/40 animate-pulse">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Official Verified Authentic Credential
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Certificate Authenticated
          </h1>
          <p className="text-xs text-cyber-muted font-mono">Code: {code}</p>
        </div>

        {/* Credential Attributes Box */}
        <div className="rounded-2xl border border-cyber-border bg-[#050811] p-5 text-left text-xs space-y-2.5 font-mono">
          <div className="flex justify-between border-b border-cyber-border/60 pb-2">
            <span className="text-cyber-muted">Recipient Name:</span>
            <strong className="text-white">Alex Mercer</strong>
          </div>
          <div className="flex justify-between border-b border-cyber-border/60 pb-2">
            <span className="text-cyber-muted">Organization:</span>
            <span className="text-cyan-300 font-bold">Acme Cyber Defense Corp</span>
          </div>
          <div className="flex justify-between border-b border-cyber-border/60 pb-2">
            <span className="text-cyber-muted">Course Track:</span>
            <span className="text-slate-200">Phishing & Smishing Defense</span>
          </div>
          <div className="flex justify-between border-b border-cyber-border/60 pb-2">
            <span className="text-cyber-muted">Mastery Score:</span>
            <span className="text-emerald-400 font-bold">88.0% Competency Verified</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyber-muted">Date of Issuance:</span>
            <span className="text-slate-300">November 27, 2026</span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-2.5 text-xs shadow-lg shadow-cyan-950/40 transition"
          >
            <span>Learn About AdaptSec Defense</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
