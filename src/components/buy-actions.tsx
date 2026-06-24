"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Heart,
  LogIn,
  Minus,
  Plus,
  ShoppingBag,
  UserCog,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";

type ProductSummary = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  storeName?: string;
};

type BuyActionsProps = {
  product: ProductSummary;
  /** Logged in with an active Buyer role — can actually add to cart. */
  canBuy: boolean;
  /** Logged in at all (any role). */
  isLoggedIn: boolean;
  /** Owns the Buyer role but it is not the active session role. */
  hasBuyerRole: boolean;
  inStock: boolean;
};

export function BuyActions({
  product,
  canBuy,
  isLoggedIn,
  hasBuyerRole,
  inStock,
}: BuyActionsProps) {
  const router = useRouter();
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guest — must log in first.
  if (!isLoggedIn) {
    return (
      <div className="mt-7">
        <QuantityRow value={1} disabled />
        <Link className="btn-primary mt-3 w-full" href="/login">
          <LogIn size={18} />
          Login to buy
        </Link>
        <WishlistToggle product={product} />
        <p className="mt-4 rounded-[0.625rem] bg-[rgba(31,111,106,0.08)] px-4 py-3 text-sm leading-6 text-[var(--market)]">
          Guests may inspect this product and save it to a wishlist. Cart and
          checkout are unlocked once you login as a Buyer / Pembeli.
        </p>
      </div>
    );
  }

  // Logged in, but the active session role is not Buyer.
  if (!canBuy) {
    return (
      <div className="mt-7">
        <QuantityRow value={1} disabled />
        <Link
          className="btn-primary mt-3 w-full"
          href={hasBuyerRole ? "/login" : "/dashboard"}
        >
          <UserCog size={18} />
          {hasBuyerRole
            ? "Switch to Buyer role to buy"
            : "Buyer role required to buy"}
        </Link>
        <WishlistToggle product={product} />
        <p className="mt-4 rounded-[0.625rem] bg-[rgba(194,90,60,0.08)] px-4 py-3 text-sm leading-6 text-[var(--danger)]">
          {hasBuyerRole
            ? "Your active session role can't check out. Re-select the Buyer role to add items to the cart."
            : "This account doesn't hold the Buyer role. Checkout is limited to Buyer / Pembeli accounts."}
        </p>
      </div>
    );
  }

  async function addToCart() {
    setPending(true);
    setError(null);
    const result = await cart.addItem(product.id, quantity);
    if (result.ok) {
      setAdded(true);
    } else {
      setError(result.error ?? "Could not add to cart.");
    }
    setPending(false);
  }

  return (
    <div className="mt-7">
      <QuantityRow
        value={quantity}
        onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
        onIncrement={() => setQuantity((q) => q + 1)}
        disabled={!inStock || pending}
      />
      <button
        type="button"
        onClick={addToCart}
        disabled={!inStock || pending}
        className="btn-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {added ? <Check size={18} /> : <ShoppingBag size={18} />}
        {!inStock
          ? "Out of stock"
          : pending
            ? "Adding…"
            : added
              ? "Added — add more?"
              : "Add to cart"}
      </button>

      {added ? (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[0.625rem] bg-[var(--ink)] px-4 text-sm font-semibold text-white transition hover:bg-black"
        >
          <ShoppingBag size={18} />
          View cart ({cart.count})
        </button>
      ) : (
        <WishlistToggle product={product} />
      )}

      {error ? (
        <p className="mt-3 rounded-[0.625rem] bg-[rgba(194,90,60,0.1)] px-3.5 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <p className="mt-4 rounded-[0.625rem] bg-[rgba(31,111,106,0.08)] px-4 py-3 text-sm leading-6 text-[var(--market)]">
        Single-store cart: one cart holds items from a single store. Checkout
        debits your wallet with PPN 12% itemized.
      </p>
    </div>
  );
}

function QuantityRow({
  value,
  onIncrement,
  onDecrement,
  disabled,
}: {
  value: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center justify-between gap-3 rounded-[0.625rem] border border-[var(--line)] bg-white px-2 py-1">
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled || !onDecrement}
        className="grid size-8 place-items-center rounded-md text-[var(--muted)] transition hover:bg-[var(--soft)] disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold">{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled || !onIncrement}
        className="grid size-8 place-items-center rounded-md text-[var(--muted)] transition hover:bg-[var(--soft)] disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function WishlistToggle({ product }: { product: ProductSummary }) {
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  return (
    <button
      type="button"
      onClick={() => toggle(product)}
      aria-pressed={saved}
      className={`mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[0.625rem] border px-4 text-sm font-semibold transition ${
        saved
          ? "border-[var(--danger)] bg-[rgba(194,90,60,0.06)] text-[var(--danger)]"
          : "border-[var(--line)] bg-white hover:border-[var(--ink)]"
      }`}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
      {saved ? "Saved to wishlist" : "Save to wishlist"}
    </button>
  );
}
