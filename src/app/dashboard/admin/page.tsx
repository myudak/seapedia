import { DashboardShell } from "@/components/dashboard-shell";

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      role="Admin"
      title="Admin Dashboard"
      subtitle="Monitoring, discount management, time simulation, and overdue handling live here."
    >
      <p className="text-[var(--muted)]">
        Admin features are introduced progressively in Level 6 and Level 7.
      </p>
    </DashboardShell>
  );
}
