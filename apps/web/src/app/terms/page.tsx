import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-2xl font-semibold">Terms of Service</h1>
        <p className="text-sm text-ink-secondary leading-relaxed">
          AdaptSec attack simulations are authorized training exercises scoped exclusively to enrolled organization members. Fictional brands and controlled sandbox payloads are used to measure awareness without exposing real credentials.
        </p>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Organization administrators are responsible for ensuring employees and students are enrolled under valid institutional or corporate authorization.
        </p>
      </main>
    </div>
  );
}
