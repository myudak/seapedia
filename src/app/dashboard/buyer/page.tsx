import { DashboardShell } from "@/components/dashboard-shell";

export default function BuyerDashboardPage() {
  return (
    <DashboardShell
      role="Buyer / Pembeli"
      title="Buyer Dashboard"
      subtitle="Wallet, delivery address, cart, checkout, and order history live here."
    >
      <p className="text-[var(--muted)]">
        Buyer features are introduced progressively in Level 3.
      </p>
    </DashboardShell>
  );
}
