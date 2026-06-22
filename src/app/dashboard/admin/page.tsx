import { DashboardShell } from "@/components/dashboard-shell";
import { AdminMonitoringPanel } from "@/components/admin-monitoring-panel";
import { AdminDiscountPanel } from "@/components/admin-discount-panel";

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      role="Admin"
      title="Admin Dashboard"
      subtitle="Monitoring, discount management, time simulation, and overdue handling live here."
    >
      <AdminMonitoringPanel />
      <AdminDiscountPanel />
    </DashboardShell>
  );
}
