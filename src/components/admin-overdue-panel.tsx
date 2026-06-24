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
    <Card className="grid gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Overdue handling</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            View orders past their SLA, then auto return/refund to the buyer wallet.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={loadOverdue}>
            View overdue
          </Button>
          <Button type="button" icon={<RotateCcw size={18} />} onClick={runOverdue}>
            Run refund
          </Button>
        </div>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No overdue orders. Use the time machine to advance the clock first.
        </p>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(194,90,60,0.25)] bg-[rgba(194,90,60,0.05)] p-4"
            >
              <div>
                <p className="font-semibold">{order.storeName}</p>
                <p className="text-sm text-[var(--muted)]">{order.status}</p>
              </div>
              <span className="font-semibold">{formatRupiah(order.total)}</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-sm font-semibold text-[var(--market)]">{message}</p>
    </Card>
  );
}
