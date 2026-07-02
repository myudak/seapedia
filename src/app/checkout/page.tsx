import { AppShell } from "@/components/app-shell";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <AppShell>
      <CheckoutView />
    </AppShell>
  );
}
