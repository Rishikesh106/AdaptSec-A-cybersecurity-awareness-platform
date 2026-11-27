import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink-primary">
      <header className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
            <ShieldCheck className="h-4 w-4 text-brand" />
            <span>AdaptSec</span>
          </Link>
          <Link href="/login" className="text-xs font-medium text-brand hover:underline">
            Sign in
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-5">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="text-sm text-ink-secondary leading-relaxed">
          AdaptSec processes learner simulation telemetry, quiz responses, and campaign completion records solely on behalf of the subscribing organization (Data Fiduciary / Controller).
        </p>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Every organization workspace is strictly tenant-isolated. Users can export their complete personal telemetry archive or permanently delete their account at any time from Workspace Settings.
        </p>
      </main>
    </div>
  );
}
