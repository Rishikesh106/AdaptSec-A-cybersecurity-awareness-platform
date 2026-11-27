import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function SecurityPage() {
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
        <h1 className="text-2xl font-semibold">Security & Trust Architecture</h1>
        <ul className="list-disc pl-5 space-y-2 text-sm text-ink-secondary">
          <li>Argon2id password hashing with 5-attempt exponential lockout protection.</li>
          <li>HttpOnly SameSite=Lax JWT access cookies paired with rotating database-backed refresh tokens.</li>
          <li>CSRF Origin validation, Helmet security headers, and strict Zod schema validation on every endpoint.</li>
          <li>Server-authoritative scoring for all simulations, adaptive quizzes, and training labs.</li>
          <li>Full multi-tenant query scoping by organizationId with automated cross-tenant isolation tests.</li>
        </ul>
      </main>
    </div>
  );
}
