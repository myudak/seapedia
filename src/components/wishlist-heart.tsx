"use client";

import { Heart } from "lucide-react";
import {
  useWishlist,
  type WishlistItem,
} from "@/components/wishlist/wishlist-provider";
import { cn } from "@/lib/cn";

type WishlistHeartProps = {
  item: WishlistItem;
  className?: string;
};

/**
 * Heart toggle for catalog cards. Stops the click from bubbling to the card's
 * surrounding <Link> so saving never navigates.
 */
export function WishlistHeart({ item, className }: WishlistHeartProps) {
  const { has, toggle } = useWishlist();
  const saved = has(item.id);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(item);
      }}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={cn(
        "grid size-9 place-items-center rounded-full border border-[var(--line)] bg-white/90 backdrop-blur transition hover:border-[var(--danger)] hover:bg-white",
        className,
      )}
    >
      <Heart
        size={17}
        fill={saved ? "currentColor" : "none"}
        className={saved ? "text-[var(--danger)]" : "text-[var(--muted)]"}
      />
    </button>
  );
}
