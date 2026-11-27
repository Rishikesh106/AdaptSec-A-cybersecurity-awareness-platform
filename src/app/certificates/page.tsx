"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Printer,
  Shield,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function CertificatesPage() {
  const { currentUser } = useApp();
  const [selectedCertCode, setSelectedCertCode] = useState<string>("ADAPTSEC-CERT-2026-88192");

  const certificates = [
    {
      code: "ADAPTSEC-CERT-2026-88192",
      title: "Phishing, Smishing & Social Communication Defense",
      issuedAt: "November 27, 2026",
      score: 88,
      riskReduction: 42,
    },
    {
      code: "ADAPTSEC-CERT-2026-99341",
      title: "UPI & Digital Payment Fraud Defense",
      issuedAt: "November 20, 2026",
      score: 92,
      riskReduction: 55,
    },
  ];

  const activeCert = certificates.find((c) => c.code === selectedCertCode) || certificates[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-[#0b1329] to-[#0d1838] p-6 sm:p-8 space-y-2 shadow-2xl print:hidden">
        <span className="text-xs font-bold text-cyber-primary uppercase tracking-wider font-mono">
          Verifiable Competency Credentials
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Your Cyber Defense Certificates
        </h1>
        <p className="text-xs text-cyber-muted leading-relaxed">
          Each certificate possesses a cryptographically unique verification code that can be authenticated publicly by employers, colleges, or auditors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate List Column */}
        <div className="space-y-3 print:hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-muted font-mono px-1">
            Issued Credentials
          </h3>
          <div className="space-y-2">
            {certificates.map((cert) => (
              <div
                key={cert.code}
                onClick={() => setSelectedCertCode(cert.code)}
                className={`rounded-2xl border p-4 space-y-2 cursor-pointer transition ${
                  selectedCertCode === cert.code
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-200 shadow-lg shadow-cyan-950/20"
                    : "border-cyber-border bg-cyber-card text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyber-muted">{cert.code}</span>
                  <span className="text-emerald-400 font-bold">{cert.score}% Score</span>
                </div>
                <h4 className="font-bold text-xs leading-snug text-white">{cert.title}</h4>
                <p className="text-[10px] text-cyber-muted flex items-center gap-1 font-mono">
                  <Calendar className="h-3 w-3" /> {cert.issuedAt}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Printable Render Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-end gap-2 print:hidden">
            <Link
              href={`/verify/${activeCert.code}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-cyber-border bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs font-semibold transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Public Verify Page</span>
            </Link>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 text-xs font-bold transition shadow-lg shadow-cyan-950/40"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Download PDF</span>
            </button>
          </div>

          {/* Certificate Frame */}
          <div className="rounded-3xl border-4 border-cyan-500/40 bg-[#070b14] p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden text-white">
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <Shield className="h-96 w-96 text-cyan-400" />
            </div>

            <div className="space-y-1 relative z-10">
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-cyan-400" />
                <span className="text-sm font-bold tracking-widest text-cyan-400 uppercase font-mono">
                  AdaptSec Enterprise Verification
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-2">
                Certificate of Cyber Resilience
              </h2>
              <p className="text-xs text-cyber-muted">This credential certifies that</p>
            </div>

            <div className="space-y-1 relative z-10 border-y border-cyber-border py-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-sans">
                {currentUser.name}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {currentUser.organizationName || "Acme Cyber Defense Corp"} • {currentUser.department}
              </p>
            </div>

            <div className="space-y-2 relative z-10 max-w-lg mx-auto">
              <p className="text-xs text-slate-300 leading-relaxed">
                has successfully satisfied all practical behavioral simulations and cognitive defense checkpoints for
              </p>
              <h3 className="text-base font-bold text-white tracking-tight">{activeCert.title}</h3>
              <p className="text-xs text-emerald-400 font-mono font-bold">
                Verified Mastery Score: {activeCert.score}% • Risk Reduced by {activeCert.riskReduction}%
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-cyber-border/70 relative z-10 text-xs font-mono text-cyber-muted">
              <div className="text-left">
                <span className="text-[10px] block">ISSUED BY</span>
                <span className="text-slate-200 font-bold">AdaptSec Threat Intelligence</span>
              </div>

              <div className="text-center">
                <span className="text-[10px] block">CREDENTIAL ID</span>
                <span className="text-cyan-400 font-bold">{activeCert.code}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] block">VERIFICATION PORTAL</span>
                <span className="text-slate-200">adaptsec.io/verify</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
