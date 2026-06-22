import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge>Active role / Peran aktif: {role}</Badge>
            <h1 className="mt-4 text-4xl font-black">{title}</h1>
            <p className="mt-3 max-w-2xl text-[var(--muted)]">{subtitle}</p>
          </div>
        </div>
        <Card className="mt-8 p-6">{children}</Card>
      </main>
    </AppShell>
  );
}
