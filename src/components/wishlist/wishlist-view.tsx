"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { formatRupiah } from "@/lib/seed/public-products";

export function WishlistView() {
  const { items, hydrated, remove } = useWishlist();
  const cart = useCart();
  const [status, setStatus] = useState<Record<string, string>>({});

  async function addToCart(id: string) {
    const result = await cart.addItem(id, 1);
    setStatus((current) => ({
      ...current,
      [id]: result.ok ? "added" : result.error ?? "Login as a Buyer to add",
    }));
  }

  if (!hydrated) {
    return (
      <Shell>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
          Loading your wishlist…
        </div>
      </Shell>
    );
  }

  if (items.length === 0) {
    return (
      <Shell>
        <div className="grid place-items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-[var(--soft)]">
            <Heart size={26} className="text-[var(--muted)]" />
          </span>
          <h2 className="font-display text-2xl">Your wishlist is empty</h2>
          <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
            Tap the heart on any product to save it here — it stays on this
            device, no login required.
          </p>
          <Link href="/products" className="btn-primary mt-2">
            Browse catalog
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const itemStatus = status[item.id];
          return (
            <div
              key={item.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
            >
              <Link
                href={`/products/${item.id}`}
                className="relative aspect-[4/5] bg-white"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1280px) 28vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                {item.category ? (
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                    {item.category}
                  </p>
                ) : null}
                <Link
                  href={`/products/${item.id}`}
                  className="mt-1 font-display text-lg leading-6 hover:text-[var(--danger)]"
                >
                  {item.name}
                </Link>
                {item.storeName ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {item.storeName}
                  </p>
                ) : null}
                <p className="mt-3 text-xl font-semibold">
                  {formatRupiah(item.price)}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addToCart(item.id)}
                    className="btn-primary flex-1"
                  >
                    {itemStatus === "added" ? (
                      <Check size={17} />
                    ) : (
                      <ShoppingBag size={17} />
                    )}
                    {itemStatus === "added" ? "Added" : "Add to cart"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="grid size-11 shrink-0 place-items-center rounded-[0.625rem] border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--danger)] hover:text-[var(--danger)]"
                    aria-label={`Remove ${item.name} from wishlist`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                {itemStatus && itemStatus !== "added" ? (
                  <p className="mt-2 text-xs text-[var(--danger)]">
                    {itemStatus}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
      <h1 className="font-display text-3xl md:text-4xl">Wishlist</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Saved products, kept on this device.
      </p>
      <div className="mt-7">{children}</div>
    </main>
  );
}
