import { AppShell } from "@/components/app-shell";
import { CartView } from "@/components/cart/cart-view";

export const metadata = {
  title: "Shopping Cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <AppShell>
      <CartView />
    </AppShell>
  );
}
