import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Mail,
  Smartphone,
  CreditCard,
  PhoneCall,
  Lock,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const CHANNELS = [
  {
    icon: Mail,
    title: "Email & BEC Phishing",
    desc: "Inspect SPF/DKIM headers, lookalike domains, and fake executive wire requests.",
  },
  {
    icon: Smartphone,
    title: "SMS & WhatsApp Smishing",
    desc: "Detect fake KYC suspension alerts, delivery lures, and WhatsApp impersonation.",
  },
  {
    icon: CreditCard,
    title: "UPI & Payment Scams",
    desc: "Spot malicious collect requests, QR-code refund traps, and invoice tampering.",
  },
  {
    icon: PhoneCall,
    title: "Voice-Clone & Vishing",
    desc: "Analyze urgent IT helpdesk or CFO voice-call transcripts for pretexting cues.",
  },
];

const STANDARDS = [
  {
    code: "ISO/IEC 27001 A.6.3",
    title: "Information Security Awareness & Training",
    desc: "Auditable campaign assignments, completion logs, and downloadable PDF/CSV compliance packs.",
  },
  {
    code: "NIST CSF PR.AT",
    title: "Awareness & Role-Based Training",
    desc: "Seven-domain human risk telemetry across Phishing, Credentials, Payments, Social Engineering, and IR.",
  },
  {
    code: "India DPDP Act 2023",
    title: "Workforce Data & Breach Prevention",
    desc: "Built-in UPI/KYC scam defense, verifiable completion certificates, and user data export/deletion.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col text-ink-primary">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand" strokeWidth={1.75} />
              <span className="font-semibold text-[15px] tracking-tight">
                AdaptSec
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-sm text-ink-secondary">
              <a href="#capabilities" className="hover:text-ink-primary">
                Simulations
              </a>
              <a href="#standards" className="hover:text-ink-primary">
                Compliance
              </a>
              <a href="#pricing" className="hover:text-ink-primary">
                Pricing
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-ink-secondary hover:text-ink-primary"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-brand px-3.5 py-1.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
            >
              Create workspace
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="border-b border-border bg-surface">
          <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Enterprise Human Risk & Security Awareness
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-ink-primary">
                Measure how your workforce responds to real phishing, UPI, and BEC attacks.
              </h1>
              <p className="text-base text-ink-secondary leading-relaxed max-w-2xl">
                AdaptSec replaces passive annual compliance videos with multi-channel attack simulations, server-scored behavioral telemetry, and an adaptive training engine tailored to every employee’s weak spots.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
                >
                  <span>Start organization trial</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink-primary hover:bg-subtle transition-colors"
                >
                  Sign in to console
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-md border border-border bg-canvas p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink-primary">
                  <BarChart3 className="h-4 w-4 text-brand" />
                  <span>Live Organization Risk Snapshot</span>
                </div>
                <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  ISO 27001 Ready
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                {[
                  { dept: "Finance & Accounts", risk: "28 / 100", status: "Low Risk" },
                  { dept: "Engineering", risk: "21 / 100", status: "Low Risk" },
                  { dept: "Campus Admissions", risk: "46 / 100", status: "Moderate" },
                  { dept: "Vendor Operations", risk: "54 / 100", status: "Action Needed" },
                ].map((r) => (
                  <div
                    key={r.dept}
                    className="flex items-center justify-between rounded border border-border bg-surface px-3 py-2"
                  >
                    <span className="font-medium text-ink-primary">{r.dept}</span>
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums text-ink-secondary">{r.risk}</span>
                      <span className="text-[11px] font-medium text-brand">
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Multi-channel Capabilities */}
        <section id="capabilities" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Six realistic attack channels, scored server-side
            </h2>
            <p className="text-sm text-ink-secondary">
              Every decision, inspection time, and missed red flag updates the learner’s Elo/IRT skill profile and SM-2 spaced-repetition schedule.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="rounded-md border border-border bg-surface p-5 space-y-2.5"
                >
                  <Icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
                  <h3 className="text-sm font-semibold text-ink-primary">
                    {c.title}
                  </h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Standards */}
        <section
          id="standards"
          className="border-y border-border bg-surface py-16"
        >
          <div className="max-w-6xl mx-auto px-6 space-y-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Audit-ready governance without a dedicated security team
              </h2>
              <p className="text-sm text-ink-secondary">
                Export signed PDF and CSV reports, track department campaign completion, and issue publicly verifiable certificates.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {STANDARDS.map((s) => (
                <div
                  key={s.code}
                  className="rounded-md border border-border bg-canvas p-5 space-y-2"
                >
                  <span className="inline-block rounded border border-border bg-surface px-2 py-0.5 text-[11px] font-semibold text-brand">
                    {s.code}
                  </span>
                  <h3 className="text-sm font-semibold text-ink-primary">
                    {s.title}
                  </h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-16 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Simple per-seat pricing for SMBs and campuses
            </h2>
            <p className="text-sm text-ink-secondary">
              Start immediately with multi-tenant workspace isolation and full API access.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                name: "Campus & Non-Profit",
                price: "Free – $2 / seat",
                features: [
                  "Up to 250 learners",
                  "All 6 simulation channels",
                  "Verifiable completion certificates",
                ],
              },
              {
                name: "Growth Organization",
                price: "$4 / seat / mo",
                features: [
                  "Unlimited campaigns & reminders",
                  "Department x Skill risk heatmap",
                  "Scheduled PDF & CSV audit exports",
                ],
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: [
                  "Custom scenario authoring studio",
                  "Dedicated S3 storage & audit retention",
                  "Role-based access & API integrations",
                ],
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className="rounded-md border border-border bg-surface p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-ink-primary">
                    {tier.name}
                  </h3>
                  <p className="text-xl font-semibold text-ink-primary">
                    {tier.price}
                  </p>
                  <ul className="space-y-2 text-xs text-ink-secondary">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="inline-flex justify-center rounded-md border border-border bg-canvas px-3 py-2 text-xs font-medium text-ink-primary hover:bg-subtle"
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" />
            <span>AdaptSec Enterprise Security Awareness Platform</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/security" className="hover:text-ink-primary">
              Security
            </Link>
            <Link href="/privacy" className="hover:text-ink-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-ink-primary">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-ink-primary">
              Console Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
