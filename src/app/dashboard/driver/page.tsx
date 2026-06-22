import { DashboardShell } from "@/components/dashboard-shell";

export default function DriverDashboardPage() {
  return (
    <DashboardShell
      role="Driver / Pengirim"
      title="Driver Dashboard"
      subtitle="Available jobs, active delivery, completion actions, and earnings live here."
    >
      <p className="text-[var(--muted)]">
        Driver features are introduced progressively in Level 5.
      </p>
    </DashboardShell>
  );
}
