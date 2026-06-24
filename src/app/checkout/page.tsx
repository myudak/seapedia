import { AppShell } from "@/components/app-shell";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <AppShell>
      <CheckoutView />
    </AppShell>
  );
}
