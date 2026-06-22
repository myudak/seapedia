import { DashboardShell } from "@/components/dashboard-shell";
import { BuyerAddressPanel } from "@/components/buyer-address-panel";
import { BuyerCartPanel } from "@/components/buyer-cart-panel";
import { BuyerCheckoutPanel } from "@/components/buyer-checkout-panel";
import { BuyerWalletPanel } from "@/components/buyer-wallet-panel";

export default function BuyerDashboardPage() {
  return (
    <DashboardShell
      role="Buyer / Pembeli"
      title="Buyer Dashboard"
      subtitle="Wallet, delivery address, cart, checkout, and order history live here."
    >
      <BuyerWalletPanel />
      <BuyerAddressPanel />
      <BuyerCartPanel />
      <BuyerCheckoutPanel />
    </DashboardShell>
  );
}
