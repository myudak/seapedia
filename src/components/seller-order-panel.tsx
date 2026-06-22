"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/seed/public-products";

type SellerOrderRow = {
  id: string;
  status: string;
  total: number;
  items: Array<{ productName: string; quantity: number }>;
};

export function SellerOrderPanel() {
  const [orders, setOrders] = useState<SellerOrderRow[]>([]);
  const [message, setMessage] = useState("Incoming orders appear after checkout.");

  return (
    <section className="mt-8 grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Incoming Orders</h2>
        <Button
          type="button"
          variant="secondary"
          icon={<ClipboardList size={18} />}
          onClick={() => {
            fetch("/api/seller/orders")
              .then((response) => response.json())
              .then((payload) => {
                if (payload.ok) {
                  setOrders(payload.data);
                  setMessage("Seller orders loaded.");
                } else {
                  setMessage(payload.error);
                }
              })
              .catch(() => setMessage("Seller orders require Seller login."));
          }}
        >
          Load orders
        </Button>
      </div>
      <div className="grid gap-3">
        {orders.map((order) => (
          <Card key={order.id} className="p-4">
            <p className="font-black">{order.status}</p>
            <p className="text-sm text-[var(--muted)]">
              {order.items.length} item(s) - {formatRupiah(order.total)}
            </p>
          </Card>
        ))}
      </div>
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </section>
  );
}
