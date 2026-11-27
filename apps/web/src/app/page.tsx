import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" strokeWidth={1.75} />
            <span className="font-semibold text-[15px] text-ink-primary">
              AdaptSec
            </span>
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 space-y-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Human Risk & Security Awareness Platform
          </p>
          <h1 className="text-3xl font-semibold text-ink-primary tracking-tight leading-tight">
            Measure how your team responds to real phishing, UPI, and social-engineering attacks.
          </h1>
          <p className="text-base text-ink-secondary leading-relaxed">
            AdaptSec replaces passive annual compliance videos with multi-channel attack simulations, server-scored behavioral telemetry, and adaptive skill reinforcement.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
            >
              <span>Sign in to console</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-primary hover:bg-subtle transition-colors"
            >
              Create organization
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
