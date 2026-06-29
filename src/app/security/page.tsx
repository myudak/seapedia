import Link from "next/link";
import {
  Bug,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Lock,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { XssReviewDemo } from "@/components/security-xss-demo";

export const metadata = {
  title: "Security Checklist",
};

const checklist = [
  {
    icon: Bug,
    title: "Stored XSS is neutralized",
    rule: "User-generated review text is normalized and HTML-escaped before storage; React escapes text nodes on render.",
    proof: "Convex review validation plus React text rendering · use the live probe above",
  },
  {
    icon: UserX,
    title: "Broken object authorization → 403",
    rule: "A buyer cannot read another user's order. Resource lookups verify ownership, not just authentication.",
    proof: "getOrderForParticipant() + requireActiveRole('Buyer')",
  },
  {
    icon: Lock,
    title: "Broken function authorization → 403",
    rule: "A seller cannot edit or delete a product that belongs to a different seller's store.",
    proof: "updateSellerProduct() / deleteSellerProduct() ownership checks",
  },
  {
    icon: Fingerprint,
    title: "Active-role enforcement",
    rule: "Changing the URL alone never grants access. Every private API re-checks the session's active role server-side.",
    proof: "requireActiveRole() on each /api/(buyer|seller|driver|admin)/* route",
  },
  {
    icon: KeyRound,
    title: "Authentication hardening",
    rule: "Passwords are bcrypt-hashed; sessions are httpOnly cookies backed by server-side records with expiry, and logout revokes them.",
    proof: "loginUser() / logoutToken() · SESSION_COOKIE httpOnly cookie",
  },
  {
    icon: ShieldCheck,
    title: "Validated, structured data access",
    rule: "Every route handler validates input with Zod, and data access is structured (no string-built queries) — minimizing injection risk.",
    proof: "zod schemas in route handlers · in-memory/Convex-style access",
  },
];

export default function SecurityPage() {
  return (
    <AppShell>
      <main className="bg-[var(--background)]">
        <section className="border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              <ShieldCheck size={14} className="text-[var(--market)]" />
              Security
            </span>
            <h1 className="mt-4 font-display text-4xl md:text-5xl">
              Security checklist
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
              SEAPEDIA defends the OWASP API risks that matter most for a
              multi-role marketplace: broken object/function authorization,
              broken authentication, and injection. Each control below is
              enforced on the backend — try the live XSS probe to see it.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
          <Card className="h-fit p-6 sm:p-8">
            <h2 className="font-display text-2xl">Live XSS probe</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Submit a script payload through the public review API and watch it
              come back as inert, escaped text.
            </p>
            <div className="mt-6">
              <XssReviewDemo />
            </div>
          </Card>

          <div className="grid gap-4">
            {checklist.map(({ icon: Icon, title, rule, proof }) => (
              <Card key={title} className="flex gap-4 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--soft)] text-[var(--market)]">
                  <Icon size={20} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{title}</h3>
                    <CheckCircle2 size={16} className="text-[var(--market)]" />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {rule}
                  </p>
                  <p className="mt-2 font-mono text-xs text-[var(--ink)]/70">
                    {proof}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-sm text-[var(--muted)]">
              Full endpoint surface and request/response shapes are documented in
              the API reference.
            </p>
            <Link
              href="/docs/api"
              className="inline-flex min-h-11 items-center gap-2 rounded-[0.625rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold transition hover:border-[var(--ink)]"
            >
              View API reference
            </Link>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
