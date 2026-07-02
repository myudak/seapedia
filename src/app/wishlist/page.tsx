import { AppShell } from "@/components/app-shell";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <AppShell>
      <WishlistView />
    </AppShell>
  );
}
