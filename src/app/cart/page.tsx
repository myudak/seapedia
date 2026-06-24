import { AppShell } from "@/components/app-shell";
import { CartView } from "@/components/cart/cart-view";

export const metadata = {
  title: "Shopping Cart",
};

export default function CartPage() {
  return (
    <AppShell>
      <CartView />
    </AppShell>
  );
}
