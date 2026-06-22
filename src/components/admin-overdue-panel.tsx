"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/seed/public-products";

type OverdueOrder = {
  id: string;
  storeName: string;
  status: string;
  total: number;
};

export function AdminOverduePanel() {
  const [orders, setOrders] = useState<OverdueOrder[]>([]);
  const [message, setMessage] = useState("Run overdue handling after simulating time.");

  function loadOverdue() {
    fetch("/api/admin/overdue")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setOrders(payload.data);
          setMessage("Overdue orders loaded.");
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Overdue list requires Admin login."));
  }

  function runOverdue() {
    fetch("/api/admin/overdue", { method: "POST" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setOrders(payload.data);
          setMessage("Auto return/refund executed.");
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Overdue handling requires Admin login."));
  }

  return (
    <section className="mt-8 grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Overdue Handling</h2>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={loadOverdue}>
            View overdue
          </Button>
          <Button type="button" icon={<RotateCcw size={18} />} onClick={runOverdue}>
            Run refund
          </Button>
        </div>
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
