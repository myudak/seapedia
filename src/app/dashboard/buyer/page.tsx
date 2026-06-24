import Link from "next/link";
import { ArrowRight, CreditCard, ShoppingBag } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { BuyerAddressPanel } from "@/components/buyer-address-panel";
import { BuyerOrderPanel } from "@/components/buyer-order-panel";
import { BuyerWalletPanel } from "@/components/buyer-wallet-panel";
import { Card } from "@/components/ui/card";

export default function BuyerDashboardPage() {
  return (
    <DashboardShell
      role="Buyer / Pembeli"
      title="Buyer Dashboard"
      subtitle="Wallet, delivery address, and order history live here. Shopping happens in the storefront cart and checkout."
    >
      <BuyerWalletPanel />

      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[var(--soft)] text-[var(--ink)]">
            <ShoppingBag size={20} />
          </span>
          <div>
            <p className="font-semibold">Cart &amp; checkout</p>
            <p className="text-sm text-[var(--muted)]">
              Manage your cart and complete checkout in the full storefront flow.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/cart"
            className="inline-flex min-h-11 items-center gap-2 rounded-[0.625rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold transition hover:border-[var(--ink)]"
          >
            <ShoppingBag size={16} className="text-[var(--muted)]" />
            Open cart
          </Link>
          <Link
            href="/checkout"
            className="inline-flex min-h-11 items-center gap-2 rounded-[0.625rem] bg-[var(--danger)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--danger-strong)]"
          >
            <CreditCard size={16} />
            Checkout
            <ArrowRight size={15} />
          </Link>
        </div>
      </Card>

      <BuyerAddressPanel />
      <BuyerOrderPanel />
    </DashboardShell>
  );
}
