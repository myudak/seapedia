"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ClipboardList, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { OrderTimeline, type TimelineEntry } from "@/components/order-timeline";
import { formatRupiah } from "@/lib/seed/public-products";

type OrderRow = {
  id: string;
  storeName: string;
  status: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  ppn: number;
  total: number;
  deliveryMethod: string;
  createdAt: number;
  items: Array<{ productName: string; quantity: number; lineTotal: number }>;
};

export function BuyerOrderPanel() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [timelines, setTimelines] = useState<Record<string, TimelineEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    fetch("/api/buyer/orders")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setOrders(payload.data);
          setMessage(
            payload.data.length === 0
              ? "No orders yet. Checkout from the cart to create one."
              : null,
          );
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Order history requires Buyer login."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function toggle(orderId: string) {
    const next = expanded === orderId ? null : orderId;
    setExpanded(next);
    if (next && !timelines[orderId]) {
      fetch(`/api/buyer/orders/${orderId}`)
        .then((response) => response.json())
        .then((payload) => {
          if (payload.ok) {
            setTimelines((current) => ({
              ...current,
              [orderId]: payload.data.history ?? [],
            }));
          }
        })
        .catch(() => undefined);
    }
  }

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Order history</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Track each order from packing to delivery, with itemized totals.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadOrders();
          }}
          className="inline-flex min-h-10 items-center gap-2 rounded-[0.625rem] border border-[var(--line)] bg-white px-3.5 text-sm font-semibold transition hover:border-[var(--ink)]"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <Card className="grid place-items-center gap-2 px-6 py-10 text-center">
          <ClipboardList size={24} className="text-[var(--muted)]" />
          <p className="text-sm text-[var(--muted)]">
            {message ?? "Order history appears after checkout."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => {
            const isOpen = expanded === order.id;
            return (
              <Card key={order.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(order.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-[var(--soft)]/50"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{order.storeName}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {order.items.length} item
                      {order.items.length === 1 ? "" : "s"} ·{" "}
                      {order.deliveryMethod} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-semibold">
                      {formatRupiah(order.total)}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-[var(--muted)] transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isOpen ? (
                  <div className="grid gap-5 border-t border-[var(--line)] p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                        Items
                      </p>
                      <ul className="mt-3 grid gap-2 text-sm">
                        {order.items.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="truncate text-[var(--muted)]">
                              {item.productName} × {item.quantity}
                            </span>
                            <span className="shrink-0 font-medium">
                              {formatRupiah(item.lineTotal)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <dl className="mt-4 grid gap-1.5 border-t border-[var(--line)] pt-3 text-sm">
                        <Row label="Subtotal" value={order.subtotal} />
                        {order.discount > 0 ? (
                          <Row
                            label="Discount"
                            value={-order.discount}
                            tone="text-[var(--market)]"
                          />
                        ) : null}
                        <Row label="Delivery fee" value={order.deliveryFee} />
                        <Row label="PPN 12%" value={order.ppn} />
                        <div className="mt-1 flex items-center justify-between border-t border-[var(--line)] pt-2 text-base font-semibold">
                          <span>Total</span>
                          <span>{formatRupiah(order.total)}</span>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                        Status timeline
                      </p>
                      <div className="mt-3">
                        <OrderTimeline
                          status={order.status}
                          history={timelines[order.id]}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className={`font-medium ${tone ?? ""}`}>
        {value < 0 ? `− ${formatRupiah(Math.abs(value))}` : formatRupiah(value)}
      </dd>
    </div>
  );
}
