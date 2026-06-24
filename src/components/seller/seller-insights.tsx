"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Receipt,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { AreaLineChart } from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/seed/public-products";

type Metric = { value: number; delta: number };

type Insights = {
  series: { label: string; value: number }[];
  compare: number[];
  sales: Metric;
  orders: Metric;
  units: Metric;
  avgOrderValue: Metric;
  topProducts: { name: string; revenue: number; units: number }[];
  synthesized: boolean;
};

export function SellerInsights() {
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/seller/insights")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.ok) setData(payload.data);
        else setError(payload.error);
      })
      .catch(() => setError("Insights require Seller login."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card className="grid gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Business insights</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {data?.synthesized
              ? "Sample performance — your real numbers appear as orders come in."
              : "Your store performance over the last 7 days."}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--soft)]/60 px-3 py-1.5 text-xs font-semibold text-[var(--market)]">
          <span className="size-2 animate-pulse rounded-full bg-[var(--market)]" />
          Real-time focus
        </span>
      </div>

      {error ? (
        <p className="text-sm font-semibold text-[var(--danger)]">{error}</p>
      ) : null}

      {/* Metric tiles */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Sales"
          icon={TrendingUp}
          value={data ? formatRupiah(data.sales.value) : "—"}
          delta={data?.sales.delta}
          loading={loading}
        />
        <MetricTile
          label="Orders"
          icon={ShoppingBag}
          value={data ? data.orders.value.toLocaleString("id-ID") : "—"}
          delta={data?.orders.delta}
          loading={loading}
        />
        <MetricTile
          label="Units sold"
          icon={Boxes}
          value={data ? data.units.value.toLocaleString("id-ID") : "—"}
          delta={data?.units.delta}
          loading={loading}
        />
        <MetricTile
          label="Avg order value"
          icon={Receipt}
          value={data ? formatRupiah(data.avgOrderValue.value) : "—"}
          delta={data?.avgOrderValue.delta}
          loading={loading}
        />
      </div>

      {/* Chart + ranking */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-[var(--line)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">Sales over time</h3>
            <span className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-[var(--danger)]" />
                This period
              </span>
              <span className="flex items-center gap-1.5 text-[var(--muted)]">
                <span className="h-0 w-4 border-t-2 border-dashed border-[var(--muted)]" />
                Previous
              </span>
            </span>
          </div>
          <div className="mt-4">
            {data ? (
              <AreaLineChart
                points={data.series}
                compare={data.compare}
                height={240}
                formatValue={(value) =>
                  value >= 1_000_000
                    ? `${(value / 1_000_000).toFixed(1)}jt`
                    : `${Math.round(value / 1_000)}rb`
                }
                caption="Seller sales over the last 7 days"
              />
            ) : (
              <div className="grid h-[240px] place-items-center text-sm text-[var(--muted)]">
                {loading ? "Loading…" : "No data"}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--line)] p-5">
          <h3 className="font-semibold">Top products</h3>
          <ol className="mt-4 grid gap-3">
            {(data?.topProducts ?? []).map((product, index) => (
              <li key={product.name} className="flex items-center gap-3">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-[rgba(194,90,60,0.14)] text-[var(--danger)]"
                      : "bg-[var(--soft)] text-[var(--muted)]"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {product.name}
                  </span>
                  <span className="block text-xs text-[var(--muted)]">
                    {product.units} sold
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-[var(--danger)]">
                  {formatRupiah(product.revenue)}
                </span>
              </li>
            ))}
            {data && data.topProducts.length === 0 ? (
              <li className="text-sm text-[var(--muted)]">No products yet.</li>
            ) : null}
          </ol>
        </div>
      </div>
    </Card>
  );
}

function MetricTile({
  label,
  icon: Icon,
  value,
  delta,
  loading,
}: {
  label: string;
  icon: typeof TrendingUp;
  value: string;
  delta?: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--soft)]/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-[var(--muted)]">{label}</span>
        <span className="grid size-8 place-items-center rounded-full bg-white text-[var(--ink)]">
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl tracking-tight">
        {loading ? "…" : value}
      </p>
      {delta !== undefined && !loading ? (
        <span
          className={`mt-1 inline-flex items-center gap-0.5 text-xs font-semibold ${
            delta >= 0 ? "text-[var(--market)]" : "text-[var(--danger)]"
          }`}
        >
          {delta >= 0 ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}
          {Math.abs(delta).toFixed(1)}% vs prev
        </span>
      ) : null}
    </div>
  );
}
