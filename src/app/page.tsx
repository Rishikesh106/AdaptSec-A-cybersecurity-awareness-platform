"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Target,
  Sparkles,
  Zap,
  ArrowRight,
  Brain,
  Lock,
  Mail,
  CreditCard,
  PhoneCall,
  CheckCircle2,
  Users,
  Award,
  Globe,
  Radio,
} from "lucide-react";

export default function LandingPage() {
  const attackChannels = [
    { title: "Email Inbox", desc: "SPF/DKIM spoofing, homograph URLs, weaponized attachments", icon: Mail, color: "text-cyan-400" },
    { title: "SMS & WhatsApp", desc: "Electricity cutoff smishing, wedding APK trojans, job lures", icon: Radio, color: "text-emerald-400" },
    { title: "UPI & Digital Payments", desc: "Reverse payment collect traps, fake QR codes, invoice fraud", icon: CreditCard, color: "text-purple-400" },
    { title: "Voice Call & Vishing", desc: "AI neural voice clones, fake police 'Digital Arrest' extortion", icon: PhoneCall, color: "text-rose-400" },
    { title: "Fake Login Spotter", desc: "Adversary-in-the-Middle proxies, subtle homoglyphs, SSL tricks", icon: Lock, color: "text-amber-400" },
  ];

  const features = [
    {
      title: "Active Behavior Change",
      desc: "Drops users into real dilemmas instead of boring compliance videos. Decisions and hesitation time drive instant feedback.",
      icon: Target,
    },
    {
      title: "Per-Skill Adaptive Engine",
      desc: "Pure TypeScript Elo/IRT engine calibrates 7 core cybersecurity competency domains with SM-2 spaced repetition.",
      icon: Brain,
    },
    {
      title: "Gamified Defense Labs",
      desc: "Play Threat Triage, test client-side password entropy in PassForge Lab, and defend networks in NetShield Tower Defense.",
      icon: Zap,
    },
    {
      title: "Enterprise Risk Intelligence",
      desc: "Org admin risk heatmaps, department compliance trends, automated reminder drives, and verifiable certificates.",
      icon: Users,
    },
  ];

  const faqs = [
    {
      q: "Why is traditional cybersecurity awareness training failing?",
      a: "Traditional annual awareness training is passive, text-heavy, and produces zero behavioral conditioning. AdaptSec drops learners into realistic attack simulations where they must make split-second decisions.",
    },
    {
      q: "Does PassForge Lab send typed passwords to your server?",
      a: "NEVER. PassForge Lab evaluates password entropy and crack times 100% locally on the client using zxcvbn principles. No typed password ever leaves your browser.",
    },
    {
      q: "What makes AdaptSec tailored for SMBs and Indian institutions?",
      a: "AdaptSec features authentic real-world scenarios including UPI QR code reverse traps, electricity bill disconnection SMS APKs, fake TRAI/CBI 'Digital Arrest' calls, and Income Tax refund phishing.",
    },
    {
      q: "Can organizations issue verifiable certificates?",
      a: "Yes. Completing a track generates a cryptographically unique certificate code verifiable via the public /verify portal.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6 sm:pt-12 relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyber-primary shadow-lg shadow-cyan-950/20">
          <Sparkles className="h-4 w-4" />
          <span>Transform Human Vulnerability into Active Cyber Defense</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Don&apos;t just test for compliance. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyber-secondary bg-clip-text text-transparent">
            Condition Real Security Instincts.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-cyber-muted max-w-2xl mx-auto leading-relaxed">
          AI phishing, WhatsApp task scams, UPI payment traps, and voice-clone vishing target humans, not firewalls. AdaptSec drops your team into hyper-realistic attack simulations that measure hesitation, detect missed red flags, and adaptively eliminate blind spots.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/simulations"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold px-6 py-3.5 text-xs sm:text-sm shadow-xl shadow-cyan-950/60 transition hover:scale-105"
          >
            <span>Launch Attack Simulations</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/baseline"
            className="flex items-center gap-2 rounded-2xl border border-cyber-border bg-cyber-card hover:bg-slate-800 text-slate-200 font-bold px-6 py-3.5 text-xs sm:text-sm transition"
          >
            <span>10-Minute Baseline Assessment</span>
          </Link>
        </div>
      </section>

      {/* 5 Attack Channels Strip */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Multi-Channel Attack Arena
          </h2>
          <p className="text-lg font-bold text-white">Realistic attack simulations across 5 vectors</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {attackChannels.map((ch, idx) => {
            const Icon = ch.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-cyber-border bg-cyber-card p-4 space-y-2 hover:border-cyan-500/40 transition group"
              >
                <Icon className={`h-6 w-6 ${ch.color} group-hover:scale-110 transition`} />
                <h3 className="font-bold text-xs text-white">{ch.title}</h3>
                <p className="text-[11px] text-cyber-muted leading-relaxed">{ch.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Architecture Features */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Platform Capabilities
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-white">Engineered for Enterprise & Academic Scale</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-cyber-border bg-cyber-card p-6 space-y-3 hover:border-cyan-500/40 transition shadow-lg group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyber-primary border border-cyan-500/20 group-hover:bg-cyan-500/20 transition">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-cyber-muted leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing / Deployment Placeholder */}
      <section className="rounded-3xl border border-cyber-border bg-cyber-card p-8 sm:p-10 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
            Flexible Deployment Models
          </span>
          <h2 className="text-2xl font-bold text-white">Cloud or Self-Hosted Architecture</h2>
          <p className="text-xs text-cyber-muted max-w-xl mx-auto">
            Ready for instant deployment on Vercel with managed PostgreSQL, or containerized via Docker Compose.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="rounded-2xl border border-cyber-border bg-[#050811] p-6 space-y-3">
            <h3 className="font-bold text-sm text-white">Community & Academic</h3>
            <div className="text-2xl font-black text-cyan-400">Free</div>
            <p className="text-xs text-cyber-muted">Full simulation catalog, 4 mini-games, baseline assessment.</p>
          </div>

          <div className="rounded-2xl border border-cyan-500/50 bg-gradient-to-b from-cyan-950/20 to-[#050811] p-6 space-y-3 shadow-xl relative">
            <span className="absolute -top-2.5 right-4 rounded bg-cyan-500 text-black px-2 py-0.5 text-[9px] font-extrabold uppercase">
              POPULAR
            </span>
            <h3 className="font-bold text-sm text-white">SMB Defense Tier</h3>
            <div className="text-2xl font-black text-white">₹149 <span className="text-xs font-normal text-slate-400">/ user / mo</span></div>
            <p className="text-xs text-cyber-muted">Org risk heatmap, automated campaign scheduler, CSV export.</p>
          </div>

          <div className="rounded-2xl border border-cyber-border bg-[#050811] p-6 space-y-3">
            <h3 className="font-bold text-sm text-white">Enterprise & Government</h3>
            <div className="text-2xl font-black text-purple-400">Custom</div>
            <p className="text-xs text-cyber-muted">Custom scenario authoring studio, dedicated SSO, audit logs.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Frequently Asked Questions
          </h2>
          <p className="text-xl font-bold text-white">Everything You Need to Know</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-cyber-border bg-cyber-card p-5 space-y-2"
            >
              <h3 className="text-xs sm:text-sm font-bold text-white">{faq.q}</h3>
              <p className="text-xs text-cyber-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
