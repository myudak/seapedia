import { DashboardShell } from "@/components/dashboard-shell";

export default function SellerDashboardPage() {
  return (
    <DashboardShell
      role="Seller / Penjual"
      title="Seller Dashboard"
      subtitle="Store profile, product management, incoming orders, and income summaries live here."
    >
      <p className="text-[var(--muted)]">
        Seller features are introduced progressively in Level 2 and Level 4.
      </p>
    </DashboardShell>
  );
}
