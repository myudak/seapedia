import { DashboardShell } from "@/components/dashboard-shell";
import { SellerOrderPanel } from "@/components/seller-order-panel";
import { SellerProductPanel } from "@/components/seller-product-panel";
import { SellerStorePanel } from "@/components/seller-store-panel";

export default function SellerDashboardPage() {
  return (
    <DashboardShell
      role="Seller / Penjual"
      title="Seller Dashboard"
      subtitle="Store profile, product management, incoming orders, and income summaries live here."
    >
      <SellerStorePanel />
      <SellerProductPanel />
      <SellerOrderPanel />
    </DashboardShell>
  );
}
