"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function HeaderActions() {
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  return (
    <>
      <Link
        href="/wishlist"
        className="relative grid size-10 place-items-center rounded-full text-[var(--ink)] transition hover:bg-[var(--soft)]"
        aria-label={`Wishlist${wishlistCount ? ` (${wishlistCount})` : ""}`}
      >
        <Heart size={19} />
        <CountBadge count={wishlistCount} />
      </Link>
      <Link
        href="/cart"
        className="relative grid size-10 place-items-center rounded-full text-[var(--ink)] transition hover:bg-[var(--soft)]"
        aria-label={`Cart${cartCount ? ` (${cartCount})` : ""}`}
      >
        <ShoppingBag size={19} />
        <CountBadge count={cartCount} />
      </Link>
    </>
  );
}
