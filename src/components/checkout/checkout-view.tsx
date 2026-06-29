"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  MapPin,
  Plus,
  Tag,
  Truck,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { MapPicker, type AddressValue } from "@/components/location/map-picker";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { formatRupiah } from "@/lib/seed/public-products";

type Summary = {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  ppn: number;
  total: number;
  discountType?: string;
};

type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
};

const DELIVERY_OPTIONS = [
  { method: "Instant", fee: 20000, eta: "Same-day SLA" },
  { method: "Next Day", fee: 12000, eta: "1-day SLA" },
  { method: "Regular", fee: 8000, eta: "3-day SLA" },
] as const;

export function CheckoutView() {
  const cart = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState("Regular");
  const [discountCode, setDiscountCode] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState<{
    label: string;
    recipient: string;
    phone: string;
    address: AddressValue;
  }>({
    label: "Home",
    recipient: "Nadia Buyer",
    phone: "081234567890",
    address: { fullAddress: "Jl. Merdeka No. 18, Jakarta" },
  });

  // Load addresses + wallet once.
  useEffect(() => {
    fetch("/api/buyer/addresses")
      .then((r) => r.json())
      .then((p) => {
        if (p.ok) {
          setAddresses(p.data);
          const def = p.data.find((a: Address) => a.isDefault) ?? p.data[0];
          if (def) setSelectedAddress(def.id);
          setShowAddressForm(p.data.length === 0);
        }
      })
      .catch(() => undefined);
    fetch("/api/buyer/wallet")
      .then((r) => r.json())
      .then((p) => {
        if (p.ok) setBalance(p.data.wallet.balance);
      })
      .catch(() => undefined);
  }, []);

  const postSummary = useCallback(
    async (code: string) => {
      const response = await fetch("/api/buyer/checkout/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          discountCode: code || undefined,
        }),
      });
      return response.json();
    },
    [deliveryMethod],
  );

  // Recompute totals when method/discount/cart change (debounced for typing).
  useEffect(() => {
    if (!cart.ready || !cart.available || cart.items.length === 0) return;
    const handle = setTimeout(async () => {
      const base = await postSummary("");
      if (!base.ok) {
        setError(base.error);
        setSummary(null);
        return;
      }
      setError(null);
      const code = discountCode.trim();
      if (!code) {
        setSummary(base.data.summary);
        setDiscountError(null);
        return;
      }
      const coded = await postSummary(code);
      if (coded.ok) {
        setSummary(coded.data.summary);
        setDiscountError(null);
      } else {
        setSummary(base.data.summary);
        setDiscountError(coded.error ?? "Invalid code.");
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [postSummary, discountCode, cart.ready, cart.available, cart.items]);

  async function addAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/buyer/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newAddr.label,
        recipient: newAddr.recipient,
        phone: newAddr.phone,
        fullAddress: newAddr.address.fullAddress,
        lat: newAddr.address.lat,
        lng: newAddr.address.lng,
        isDefault: addresses.length === 0,
      }),
    });
    const payload = await response.json();
    if (payload.ok) {
      setAddresses((current) => [...current, payload.data]);
      setSelectedAddress(payload.data.id);
      setShowAddressForm(false);
    }
  }

  async function placeOrder() {
    setPlacing(true);
    setError(null);
    try {
      const response = await fetch("/api/buyer/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          discountCode: discountError ? undefined : discountCode || undefined,
          addressId: selectedAddress,
        }),
      });
      const payload = await response.json();
      if (payload.ok) {
        setOrderId(payload.data.id);
        await cart.refresh();
      } else {
        setError(payload.error ?? "Checkout failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  // --- States ---------------------------------------------------------------

  if (orderId) {
    return (
      <Shell>
        <div className="grid place-items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-[rgba(31,111,106,0.12)]">
            <CheckCircle2 size={30} className="text-[var(--market)]" />
          </span>
          <h2 className="font-display text-2xl">Order placed!</h2>
          <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
            Your wallet was debited and the order is now{" "}
            <span className="font-semibold text-[var(--ink)]">
              Sedang Dikemas
            </span>
            . Track its status timeline in your order history.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard/buyer" className="btn-primary">
              View order history
            </Link>
            <Link
              href="/products"
              className="inline-flex min-h-12 items-center justify-center rounded-[0.625rem] border border-[var(--line)] bg-white px-5 text-sm font-semibold transition hover:border-[var(--ink)]"
            >
              Keep shopping
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  if (cart.ready && !cart.available) {
    return (
      <Shell>
        <Notice
          title="Login as a Buyer to check out"
          body="Checkout is tied to your Buyer session."
          cta={{ href: "/login", label: "Login" }}
        />
      </Shell>
    );
  }

  if (cart.ready && cart.available && cart.items.length === 0) {
    return (
      <Shell>
        <Notice
          title="Your cart is empty"
          body="Add items to your cart before checking out."
          cta={{ href: "/products", label: "Browse catalog" }}
        />
      </Shell>
    );
  }

  const insufficient =
    summary !== null && balance !== null && balance < summary.total;

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="grid gap-5">
          {/* Address */}
          <Section icon={<MapPin size={18} />} title="Delivery address">
            {addresses.length > 0 ? (
              <div className="grid gap-2">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                      selectedAddress === address.id
                        ? "border-[var(--danger)] bg-[rgba(194,90,60,0.04)]"
                        : "border-[var(--line)] hover:border-[var(--ink)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === address.id}
                      onChange={() => setSelectedAddress(address.id)}
                      className="mt-1 size-4 accent-[var(--danger)]"
                    />
                    <span className="text-sm">
                      <span className="font-semibold">
                        {address.label} · {address.recipient}
                      </span>
                      <span className="mt-0.5 block text-[var(--muted)]">
                        {address.phone} — {address.fullAddress}
                      </span>
                    </span>
                  </label>
                ))}
                {!showAddressForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--danger)] underline-offset-4 hover:underline"
                  >
                    <Plus size={15} /> Add another address
                  </button>
                ) : null}
              </div>
            ) : null}

            {showAddressForm ? (
              <form
                onSubmit={addAddress}
                className="mt-3 grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--soft)]/40 p-4 sm:grid-cols-2"
              >
                <Field label="Label">
                  <TextInput
                    value={newAddr.label}
                    onChange={(e) =>
                      setNewAddr((c) => ({ ...c, label: e.target.value }))
                    }
                    required
                  />
                </Field>
                <Field label="Recipient">
                  <TextInput
                    value={newAddr.recipient}
                    onChange={(e) =>
                      setNewAddr((c) => ({ ...c, recipient: e.target.value }))
                    }
                    required
                  />
                </Field>
                <Field label="Phone">
                  <TextInput
                    value={newAddr.phone}
                    onChange={(e) =>
                      setNewAddr((c) => ({ ...c, phone: e.target.value }))
                    }
                    required
                  />
                </Field>
                <div className="sm:col-span-2">
                  <MapPicker
                    value={newAddr.address}
                    onChange={(address) =>
                      setNewAddr((c) => ({ ...c, address }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button icon={<MapPin size={16} />}>Save address</Button>
                </div>
              </form>
            ) : null}
          </Section>

          {/* Delivery method */}
          <Section icon={<Truck size={18} />} title="Delivery method">
            <div className="grid gap-2 sm:grid-cols-3">
              {DELIVERY_OPTIONS.map((option) => (
                <label
                  key={option.method}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    deliveryMethod === option.method
                      ? "border-[var(--danger)] bg-[rgba(194,90,60,0.04)]"
                      : "border-[var(--line)] hover:border-[var(--ink)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    className="sr-only"
                    checked={deliveryMethod === option.method}
                    onChange={() => setDeliveryMethod(option.method)}
                  />
                  <span className="block text-sm font-semibold">
                    {option.method}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    {option.eta}
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-[var(--ink)]">
                    {formatRupiah(option.fee)}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          {/* Discount */}
          <Section icon={<Tag size={18} />} title="Voucher / Promo">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-48 flex-1">
                <TextInput
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HEMAT12 or ONGKIR8K"
                  className="w-full uppercase"
                />
              </div>
              {summary && summary.discount > 0 && !discountError ? (
                <span className="rounded-full bg-[rgba(31,111,106,0.12)] px-3 py-1.5 text-xs font-semibold text-[var(--market)]">
                  − {formatRupiah(summary.discount)} applied
                </span>
              ) : null}
            </div>
            {discountError ? (
              <p className="mt-2 text-sm text-[var(--danger)]">{discountError}</p>
            ) : null}
          </Section>
        </div>

        {/* Summary rail */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-xl">Payment summary</h2>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--soft)]/50 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 text-[var(--muted)]">
              <CreditCard size={16} /> Wallet balance
            </span>
            <span className="font-semibold">
              {balance === null ? "—" : formatRupiah(balance)}
            </span>
          </div>

          <dl className="mt-4 grid gap-2 text-sm">
            <SummaryRow label="Subtotal" value={summary?.subtotal} />
            <SummaryRow
              label="Discount"
              value={summary ? -summary.discount : undefined}
              tone="text-[var(--market)]"
            />
            <SummaryRow label="Delivery fee" value={summary?.deliveryFee} />
            <SummaryRow label="PPN 12%" value={summary?.ppn} />
          </dl>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl">
              {summary ? formatRupiah(summary.total) : "—"}
            </span>
          </div>

          {insufficient ? (
            <p className="mt-3 rounded-[0.625rem] bg-[rgba(194,90,60,0.1)] px-3.5 py-2.5 text-sm text-[var(--danger)]">
              Insufficient wallet balance.{" "}
              <Link
                href="/dashboard/buyer"
                className="font-semibold underline underline-offset-2"
              >
                Top up
              </Link>
            </p>
          ) : null}
          {error ? (
            <p className="mt-3 rounded-[0.625rem] bg-[rgba(194,90,60,0.1)] px-3.5 py-2.5 text-sm text-[var(--danger)]">
              {error}
            </p>
          ) : null}

          <Button
            className="mt-5 w-full"
            onClick={placeOrder}
            disabled={placing || !summary || insufficient || !selectedAddress}
          >
            {placing ? "Placing order…" : "Place order"}
          </Button>
          <Link
            href="/cart"
            className="mt-3 block text-center text-sm font-semibold text-[var(--muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
          >
            Back to cart
          </Link>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
      <h1 className="font-display text-3xl md:text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Confirm delivery, apply a code, and pay from your wallet.
      </p>
      <div className="mt-7">{children}</div>
    </main>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-lg">
        <span className="text-[var(--market)]">{icon}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value?: number;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className={`font-medium ${tone ?? ""}`}>
        {value === undefined
          ? "—"
          : value < 0
            ? `− ${formatRupiah(Math.abs(value))}`
            : formatRupiah(value)}
      </dd>
    </div>
  );
}

function Notice({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">{body}</p>
      <Link href={cta.href} className="btn-primary mt-2">
        {cta.label}
      </Link>
    </div>
  );
}
