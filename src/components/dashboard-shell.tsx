import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";

type DashboardShellProps = {
  title: string;
  subtitle: string;
  role: string;
  children: ReactNode;
};

export function DashboardShell({
  title,
  subtitle,
  role,
  children,
}: DashboardShellProps) {
  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold">
              <span className="size-2 rounded-full bg-[var(--market)]" />
              <span className="uppercase tracking-[0.12em] text-[var(--muted)]">
                Active role
              </span>
              <span className="text-[var(--ink)]">{role}</span>
            </span>
            <h1 className="mt-4 font-display text-4xl">{title}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
              {subtitle}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-[0.625rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold transition hover:border-[var(--ink)] md:self-auto"
          >
            <ArrowLeft size={16} className="text-[var(--muted)]" />
            Overview
          </Link>
        </div>
        <div className="mt-8 grid gap-6">{children}</div>
      </main>
    </AppShell>
  );
}
