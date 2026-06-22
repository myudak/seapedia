import { DashboardShell } from "@/components/dashboard-shell";
import { SellerStorePanel } from "@/components/seller-store-panel";

export default function SellerDashboardPage() {
  return (
    <DashboardShell
      role="Seller / Penjual"
      title="Seller Dashboard"
      subtitle="Store profile, product management, incoming orders, and income summaries live here."
    >
      <SellerStorePanel />
    </DashboardShell>
  );
}
