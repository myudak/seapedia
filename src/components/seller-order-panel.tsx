"use client";

import { useCallback, useEffect, useState } from "react";
import { PackageCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { OrderTimeline } from "@/components/order-timeline";
import { formatRupiah } from "@/lib/seed/public-products";

type SellerOrderRow = {
  id: string;
  status: string;
  total: number;
  items: Array<{ productName: string; quantity: number }>;
};

export function SellerOrderPanel() {
  const [orders, setOrders] = useState<SellerOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    fetch("/api/seller/orders")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setOrders(payload.data);
          setMessage(
            payload.data.length === 0
              ? "Incoming orders appear here after a buyer checks out."
              : null,
          );
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Seller orders require Seller login."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function processOrder(order: SellerOrderRow) {
    fetch(`/api/seller/orders/${order.id}/process`, { method: "POST" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setOrders((current) =>
            current.map((item) => (item.id === order.id ? payload.data : item)),
          );
          setMessage("Order moved to Menunggu Pengirim — now in the driver queue.");
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Processing requires Seller login."));
  }

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Incoming orders</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Process paid orders to release them into the driver pickup queue.
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
          <PackageCheck size={24} className="text-[var(--muted)]" />
          <p className="text-sm text-[var(--muted)]">
            {message ?? "No incoming orders yet."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <OrderStatusBadge status={order.status} />
                <span className="font-semibold">{formatRupiah(order.total)}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {order.items
                  .map((item) => `${item.productName} × ${item.quantity}`)
                  .join(", ")}
              </p>
              <div className="mt-4 grid gap-4 border-t border-[var(--line)] pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <OrderTimeline status={order.status} />
                {order.status === "Sedang Dikemas" ? (
                  <Button
                    type="button"
                    icon={<PackageCheck size={17} />}
                    onClick={() => processOrder(order)}
                  >
                    Process order
                  </Button>
                ) : (
                  <span className="text-sm font-medium text-[var(--muted)]">
                    Already processed
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {message && orders.length > 0 ? (
        <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
      ) : null}
    </section>
  );
}
