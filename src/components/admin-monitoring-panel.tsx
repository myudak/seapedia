"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

type Monitoring = Record<string, number>;

const labels: Record<string, string> = {
  users: "Users",
  stores: "Stores",
  products: "Products",
  orders: "Orders",
  vouchers: "Vouchers",
  promos: "Promos",
  deliveryJobs: "Delivery jobs",
  overdueOrders: "Overdue orders",
};

export function AdminMonitoringPanel() {
  const [monitoring, setMonitoring] = useState<Monitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/monitoring")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) {
          setMonitoring(payload.data);
          setMessage(null);
        } else {
          setMessage(payload.error);
        }
      })
      .catch(() => setMessage("Monitoring requires Admin login."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const entries = monitoring
    ? Object.entries(monitoring).filter(([key]) => key !== "currentTime")
    : [];

  return (
    <Card className="grid gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Marketplace monitoring</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Live counts across the whole platform.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="inline-flex min-h-10 items-center gap-2 rounded-[0.625rem] border border-[var(--line)] bg-white px-3.5 text-sm font-semibold transition hover:border-[var(--ink)]"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {message ? (
        <p className="text-sm font-semibold text-[var(--danger)]">{message}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map(([key, value]) => {
            const isAlert = key === "overdueOrders" && value > 0;
            return (
              <div
                key={key}
                className={`rounded-xl border p-4 ${
                  isAlert
                    ? "border-[rgba(194,90,60,0.3)] bg-[rgba(194,90,60,0.06)]"
                    : "border-[var(--line)] bg-[var(--soft)]/40"
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                  {labels[key] ?? key}
                </p>
                <p
                  className={`mt-2 font-display text-2xl ${
                    isAlert ? "text-[var(--danger)]" : "text-[var(--ink)]"
                  }`}
                >
                  {value}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
