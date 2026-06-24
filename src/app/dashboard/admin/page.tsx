import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { AdminMonitoringPanel } from "@/components/admin-monitoring-panel";
import { AdminDiscountPanel } from "@/components/admin-discount-panel";
import { AdminTimePanel } from "@/components/admin-time-panel";
import { AdminOverduePanel } from "@/components/admin-overdue-panel";
import { Card } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      role="Admin"
      title="Admin Dashboard"
      subtitle="Monitoring, discount management, time simulation, and overdue handling live here."
    >
      <AdminMonitoringPanel />
      <AdminDiscountPanel />
      <AdminTimePanel />
      <AdminOverduePanel />

      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <span className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--soft)] text-[var(--market)]">
            <ShieldCheck size={20} />
          </span>
          <span>
            <span className="block font-semibold">Security checklist</span>
            <span className="block text-sm text-[var(--muted)]">
              Live XSS probe and authorization controls for the demo.
            </span>
          </span>
        </span>
        <Link
          href="/security"
          className="inline-flex min-h-11 items-center gap-2 rounded-[0.625rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold transition hover:border-[var(--ink)]"
        >
          Open checklist
          <ArrowRight size={16} className="text-[var(--muted)]" />
        </Link>
      </Card>
    </DashboardShell>
  );
}
