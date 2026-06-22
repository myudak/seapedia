import { DashboardShell } from "@/components/dashboard-shell";
import { DriverJobPanel } from "@/components/driver-job-panel";

export default function DriverDashboardPage() {
  return (
    <DashboardShell
      role="Driver / Pengirim"
      title="Driver Dashboard"
      subtitle="Available jobs, active delivery, completion actions, and earnings live here."
    >
      <DriverJobPanel />
    </DashboardShell>
  );
}
