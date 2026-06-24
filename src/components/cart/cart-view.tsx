"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LogIn,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatRupiah } from "@/lib/seed/public-products";

const FALLBACK_IMAGE = "/assets/brand/marketplace-hero.png";

export function CartView() {
  const cart = useCart();
  const [images, setImages] = useState<Record<string, string>>({});
  // Track explicitly *de*selected ids so new items default to selected without
  // a syncing effect.
  const [deselected, setDeselected] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  // Resolve product thumbnails from the public catalog (cart API omits images).
  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          const map: Record<string, string> = {};
          for (const product of payload.data) {
            map[product.id] = product.imageUrl;
          }
          setImages(map);
        }
      })
      .catch(() => undefined);
  }, []);

  const isSelected = (id: string) => !deselected.has(id);
  const allSelected =
    cart.items.length > 0 && cart.items.every((item) => isSelected(item.id));

  const selectedSubtotal = useMemo(
    () =>
      cart.items
        .filter((item) => !deselected.has(item.id))
        .reduce((sum, item) => sum + item.lineTotal, 0),
    [cart.items, deselected],
  );
  const selectedCount = cart.items
    .filter((item) => !deselected.has(item.id))
    .reduce((sum, item) => sum + item.quantity, 0);

  function toggleSelect(id: string) {
    setDeselected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setDeselected(
      allSelected ? new Set(cart.items.map((item) => item.id)) : new Set(),
    );
  }

  async function changeQty(id: string, quantity: number) {
    if (quantity < 1) return;
    setBusyId(id);
    await cart.updateItem(id, quantity);
    setBusyId(null);
  }

  async function remove(id: string) {
    setBusyId(id);
    await cart.removeItem(id);
    setBusyId(null);
  }

  if (!cart.ready) {
    return (
      <Shell>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
          Loading your cart…
        </div>
      </Shell>
    );
  }

  if (!cart.available) {
    return (
      <Shell>
        <EmptyCard
          icon={<LogIn size={26} className="text-[var(--market)]" />}
          title="Login as a Buyer to use your cart"
          body="The cart and checkout are tied to your Buyer session. Pick the Buyer role after login."
          cta={{ href: "/login", label: "Login" }}
        />
      </Shell>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Shell>
        <EmptyCard
          icon={<ShoppingBag size={26} className="text-[var(--muted)]" />}
          title="Your cart is empty"
          body="Browse the catalog and add items — one cart holds products from a single store."
          cta={{ href: "/products", label: "Start shopping" }}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="grid gap-4">
          {/* Column header */}
          <div className="hidden items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)] sm:flex">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="size-4 accent-[var(--danger)]"
              />
              Product
            </label>
            <span className="ml-auto w-28 text-right">Unit price</span>
            <span className="w-28 text-center">Quantity</span>
            <span className="w-28 text-right">Total</span>
            <span className="w-10" />
          </div>

          {/* Store group */}
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-5 py-3 text-sm font-semibold">
              <Store size={16} className="text-[var(--market)]" />
              {cart.storeName ?? "Store"}
            </div>
            <ul className="divide-y divide-[var(--line)]">
              {cart.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-4 sm:flex-nowrap"
                >
                  <input
                    type="checkbox"
                    checked={isSelected(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="size-4 shrink-0 accent-[var(--danger)]"
                    aria-label={`Select ${item.productName}`}
                  />
                  <Link
                    href={`/products/${item.productId}`}
                    className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-white"
                  >
                    <Image
                      src={images[item.productId] ?? FALLBACK_IMAGE}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </Link>
                  <Link
                    href={`/products/${item.productId}`}
                    className="min-w-0 flex-1 text-sm font-medium hover:text-[var(--danger)]"
                  >
                    <span className="line-clamp-2">{item.productName}</span>
                  </Link>
                  <span className="w-28 text-right text-sm text-[var(--muted)]">
                    {formatRupiah(item.price)}
                  </span>
                  <div className="flex w-28 items-center justify-center">
                    <div className="inline-flex items-center rounded-lg border border-[var(--line)]">
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, item.quantity - 1)}
                        disabled={busyId === item.id || item.quantity <= 1}
                        className="grid size-8 place-items-center text-[var(--muted)] transition hover:bg-[var(--soft)] disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, item.quantity + 1)}
                        disabled={busyId === item.id}
                        className="grid size-8 place-items-center text-[var(--muted)] transition hover:bg-[var(--soft)] disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <span className="w-28 text-right text-sm font-semibold text-[var(--danger)]">
                    {formatRupiah(item.lineTotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    disabled={busyId === item.id}
                    className="grid size-9 w-10 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[rgba(194,90,60,0.1)] hover:text-[var(--danger)] disabled:opacity-40"
                    aria-label={`Remove ${item.productName}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/products"
            className="text-sm font-semibold text-[var(--danger)] underline-offset-4 hover:underline"
          >
            ← Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-xl">Order summary</h2>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[var(--muted)]">
                Items ({selectedCount})
              </dt>
              <dd className="font-medium">{formatRupiah(selectedSubtotal)}</dd>
            </div>
            <div className="flex items-center justify-between text-[var(--muted)]">
              <dt>Delivery &amp; PPN</dt>
              <dd>Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
            <span className="text-sm text-[var(--muted)]">Subtotal</span>
            <span className="font-display text-2xl">
              {formatRupiah(selectedSubtotal)}
            </span>
          </div>
          <Link
            href="/checkout"
            aria-disabled={selectedCount === 0}
            className={`btn-primary mt-5 w-full ${
              selectedCount === 0 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Checkout ({selectedCount})
          </Link>
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            PPN 12%, delivery, and discounts are itemized on the next step.
          </p>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
      <h1 className="font-display text-3xl md:text-4xl">Shopping cart</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Review your items before checkout.
      </p>
      <div className="mt-7">{children}</div>
    </main>
  );
}

function EmptyCard({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-[var(--soft)]">
        {icon}
      </span>
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">{body}</p>
      <Link href={cta.href} className="btn-primary mt-2">
        {cta.label}
      </Link>
    </div>
  );
}
