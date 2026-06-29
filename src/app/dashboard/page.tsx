import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bike,
  Boxes,
  CalendarClock,
  Package,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  Ticket,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AreaLineChart } from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";
import { formatRupiah } from "@/lib/seed/public-products";

export const metadata = {
  title: "Dashboard",
};

type AttentionOrder = {
  id: string;
  storeName: string;
  status: string;
  total: number;
  createdAt: number;
  dueAt: number;
};

const workspaces = [
  {
    role: "Buyer",
    href: "/dashboard/buyer",
    icon: ShoppingBag,
    text: "Wallet top-up, delivery address, cart, checkout, and order history.",
  },
  {
    role: "Seller",
    href: "/dashboard/seller",
    icon: Store,
    text: "Store profile, product management, incoming orders, and income.",
  },
  {
    role: "Driver",
    href: "/dashboard/driver",
    icon: Bike,
    text: "Find available delivery jobs, take jobs, and track earnings.",
  },
  {
    role: "Admin",
    href: "/dashboard/admin",
    icon: ShieldCheck,
    text: "Monitor the marketplace, manage discounts, and simulate overdue.",
  },
];

function percentDelta(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export default async function DashboardIndexPage() {
  if (!(await isAuthenticated())) redirect("/login");
  const { profile, monitoring, overview, lowStock } = await fetchAuthQuery(api.overview.dashboard, {});

  const greetingName =
    profile.displayName || profile.username || "there";
  const activeRole = profile.activeRole;

  const revenueDelta = percentDelta(
    overview.revenueThisPeriod,
    overview.revenuePrevPeriod,
  );

  const metrics = [
    {
      label: "Revenue · last 7 days",
      value: formatRupiah(overview.revenueThisPeriod),
      delta: revenueDelta,
      hint: "vs previous 7 days",
      icon: TrendingUp,
    },
    {
      label: "Live products",
      value: monitoring.products.toLocaleString("id-ID"),
      hint: `${monitoring.stores} active stores`,
      icon: Package,
    },
    {
      label: "Orders",
      value: monitoring.orders.toLocaleString("id-ID"),
      hint: `${monitoring.deliveryJobs} delivery jobs`,
      icon: Boxes,
    },
    {
      label: "Registered users",
      value: monitoring.users.toLocaleString("id-ID"),
      hint: `${monitoring.vouchers + monitoring.promos} active discounts`,
      icon: Users,
    },
  ];

  const attentionTotal =
    overview.attention.awaitingSeller.length +
    overview.attention.awaitingDriver.length +
    overview.attention.overdue.length;

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold">
              <span className="size-2 rounded-full bg-[var(--market)]" />
              <span className="uppercase tracking-[0.12em] text-[var(--muted)]">
                Active role
              </span>
              <span className="text-[var(--ink)]">
                {activeRole ?? "Select after login"}
              </span>
            </span>
            <h1 className="mt-4 font-display text-4xl">Overview</h1>
            <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
              Welcome back, {greetingName}. Here&apos;s what&apos;s happening
              across the SEAPEDIA marketplace today.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-[0.625rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold transition hover:border-[var(--ink)] md:self-auto"
          >
            View catalog
            <ArrowRight size={16} className="text-[var(--muted)]" />
          </Link>
        </div>

        {/* Metric tiles */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, hint, delta, icon: Icon }) => (
            <Card key={label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-medium text-[var(--muted)]">
                  {label}
                </span>
                <span className="grid size-9 place-items-center rounded-full bg-[var(--soft)] text-[var(--ink)]">
                  <Icon size={17} />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl tracking-tight">{value}</p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                {delta !== undefined ? <DeltaBadge value={delta} /> : null}
                <span className="text-[var(--muted)]">{hint}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Chart + needs attention */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">Revenue over time</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Daily order revenue, last 7 days
                  .
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded bg-[var(--danger)]" />
                  This period
                </span>
                <span className="flex items-center gap-1.5 text-[var(--muted)]">
                  <span className="h-0 w-4 border-t-2 border-dashed border-[var(--muted)]" />
                  Previous
                </span>
              </div>
            </div>
            <div className="mt-5">
              <AreaLineChart
                points={overview.series}
                compare={overview.compare}
                formatValue={(value) =>
                  value >= 1_000_000
                    ? `${(value / 1_000_000).toFixed(1)}jt`
                    : `${Math.round(value / 1_000)}rb`
                }
                caption="Daily order revenue over the last 7 days"
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl">Needs attention</h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  attentionTotal > 0
                    ? "bg-[rgba(194,90,60,0.12)] text-[var(--danger)]"
                    : "bg-[var(--soft)] text-[var(--muted)]"
                }`}
              >
                {attentionTotal} open
              </span>
            </div>

            {attentionTotal === 0 ? (
              <div className="mt-5 grid place-items-center gap-2 rounded-xl border border-dashed border-[var(--line)] px-4 py-10 text-center">
                <PackageCheck size={26} className="text-[var(--market)]" />
                <p className="text-sm text-[var(--muted)]">
                  Nothing waiting. The marketplace is all caught up.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                <AttentionBucket
                  icon={PackageCheck}
                  label="Awaiting seller"
                  hint="In Sedang Dikemas"
                  orders={overview.attention.awaitingSeller}
                />
                <AttentionBucket
                  icon={Truck}
                  label="Awaiting driver"
                  hint="In Menunggu Pengirim"
                  orders={overview.attention.awaitingDriver}
                />
                <AttentionBucket
                  icon={AlertTriangle}
                  label="Overdue"
                  hint="Past delivery SLA"
                  orders={overview.attention.overdue}
                  alert
                />
              </div>
            )}

            <Link
              href="/dashboard/admin"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--danger)] underline-offset-4 hover:underline"
            >
              <CalendarClock size={15} />
              Open admin time machine
            </Link>
          </Card>
        </div>

        {/* Workspaces + side panels */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl">Open your workspace</h2>
              <span className="text-xs text-[var(--muted)]">
                Access follows your active role
              </span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {workspaces.map(({ role, href, icon: Icon, text }) => (
                <Link
                  key={role}
                  href={href}
                  className="group flex items-start gap-4 rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--ink)] hover:shadow-[0_14px_40px_rgba(30,27,23,0.08)]"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--soft)] text-[var(--ink)]">
                    <Icon size={22} />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-lg">{role}</span>
                      <ArrowRight
                        size={18}
                        className="text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--danger)]"
                      />
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
                      {text}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="font-display text-xl">Marketplace snapshot</h2>
              <div className="mt-4 divide-y divide-[var(--line)]">
                <SnapshotRow
                  icon={Truck}
                  label="Delivery jobs"
                  value={monitoring.deliveryJobs}
                />
                <SnapshotRow
                  icon={Ticket}
                  label="Active vouchers & promos"
                  value={monitoring.vouchers + monitoring.promos}
                />
                <SnapshotRow
                  icon={AlertTriangle}
                  label="Overdue orders"
                  value={monitoring.overdueOrders}
                  alert={monitoring.overdueOrders > 0}
                />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl">Inventory alerts</h2>
                <span className="rounded-full bg-[var(--soft)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
                  {lowStock.length} low
                </span>
              </div>
              {lowStock.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--muted)]">
                  All products are comfortably stocked.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3">
                  {lowStock.slice(0, 5).map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <Link
                        href={`/products/${product.id}`}
                        className="truncate text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {product.name}
                      </Link>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          product.stock <= 9
                            ? "bg-[rgba(194,90,60,0.12)] text-[var(--danger)]"
                            : "bg-[var(--soft)] text-[var(--muted)]"
                        }`}
                      >
                        {product.stock} left
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

function DeltaBadge({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-semibold ${
        up ? "text-[var(--market)]" : "text-[var(--danger)]"
      }`}
    >
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function AttentionBucket({
  icon: Icon,
  label,
  hint,
  orders,
  alert,
}: {
  icon: typeof Truck;
  label: string;
  hint: string;
  orders: AttentionOrder[];
  alert?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 text-sm font-semibold">
          <span
            className={`grid size-8 place-items-center rounded-lg ${
              alert
                ? "bg-[rgba(194,90,60,0.12)] text-[var(--danger)]"
                : "bg-[var(--soft)] text-[var(--ink)]"
            }`}
          >
            <Icon size={16} />
          </span>
          {label}
        </span>
        <span
          className={`text-sm font-semibold ${alert ? "text-[var(--danger)]" : ""}`}
        >
          {orders.length}
        </span>
      </div>
      {orders.length === 0 ? (
        <p className="mt-1.5 pl-[2.625rem] text-xs text-[var(--muted)]">
          None — {hint.toLowerCase()}.
        </p>
      ) : (
        <ul className="mt-2 grid gap-1.5 pl-[2.625rem]">
          {orders.slice(0, 3).map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="truncate text-[var(--muted)]">
                {order.storeName}
              </span>
              <span className="shrink-0 font-semibold">
                {formatRupiah(order.total)}
              </span>
            </li>
          ))}
          {orders.length > 3 ? (
            <li className="text-xs text-[var(--muted)]">
              +{orders.length - 3} more
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

function SnapshotRow({
  icon: Icon,
  label,
  value,
  alert,
}: {
  icon: typeof Truck;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <span className="flex items-center gap-2.5 text-sm font-medium">
        <span
          className={`grid size-8 place-items-center rounded-lg ${
            alert
              ? "bg-[rgba(194,90,60,0.12)] text-[var(--danger)]"
              : "bg-[var(--soft)] text-[var(--ink)]"
          }`}
        >
          <Icon size={16} />
        </span>
        {label}
      </span>
      <span
        className={`text-lg font-semibold ${alert ? "text-[var(--danger)]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
