"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/seed/public-products";

type OrderRow = {
  id: string;
  storeName: string;
  status: string;
  total: number;
};

export function BuyerOrderPanel() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [message, setMessage] = useState("Order history appears after checkout.");

  return (
    <section className="mt-8 grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Order History</h2>
        <Button
          type="button"
          variant="secondary"
          icon={<ClipboardList size={18} />}
          onClick={() => {
            fetch("/api/buyer/orders")
              .then((response) => response.json())
              .then((payload) => {
                if (payload.ok) {
                  setOrders(payload.data);
                  setMessage("Orders loaded.");
                } else {
                  setMessage(payload.error);
                }
              })
              .catch(() => setMessage("Order history requires Buyer login."));
          }}
        >
          Load orders
        </Button>
      </div>
      <div className="grid gap-3">
        {orders.map((order) => (
          <Card key={order.id} className="p-4">
            <p className="font-black">{order.storeName}</p>
            <p className="text-sm text-[var(--muted)]">
              {order.status} - {formatRupiah(order.total)}
            </p>
          </Card>
        ))}
      </div>
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </section>
  );
}
