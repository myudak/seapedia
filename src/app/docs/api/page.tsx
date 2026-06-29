import { FileJson } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

type Endpoint = { method: string; path: string };
type Group = { title: string; blurb: string; endpoints: Endpoint[] };

const apiGroups: Group[] = [
  {
    title: "Auth",
    blurb: "Registration, login, active-role selection, and session profile.",
    endpoints: [
      { method: "POST", path: "/api/auth/sign-up/email" },
      { method: "POST", path: "/api/auth/sign-in/username" },
      { method: "POST", path: "/api/auth/sign-out" },
      { method: "POST", path: "/api/auth/role" },
      { method: "GET", path: "/api/profile" },
    ],
  },
  {
    title: "Public",
    blurb: "Guest-accessible catalog and application reviews.",
    endpoints: [
      { method: "GET", path: "/api/products?q=&category=&page=&sort=" },
      { method: "GET", path: "/api/products/:id" },
      { method: "GET", path: "/api/reviews" },
      { method: "POST", path: "/api/reviews" },
    ],
  },
  {
    title: "Seller",
    blurb: "Store profile, product CRUD, and order processing.",
    endpoints: [
      { method: "POST", path: "/api/seller/store" },
      { method: "GET", path: "/api/seller/products" },
      { method: "POST", path: "/api/seller/products" },
      { method: "PATCH", path: "/api/seller/products/:id" },
      { method: "POST", path: "/api/seller/orders/:id/process" },
    ],
  },
  {
    title: "Buyer",
    blurb: "Wallet ledger, cart, single-store checkout, and order timeline.",
    endpoints: [
      { method: "GET", path: "/api/buyer/wallet" },
      { method: "POST", path: "/api/buyer/wallet/topup" },
      { method: "POST", path: "/api/buyer/cart/items" },
      { method: "POST", path: "/api/buyer/checkout" },
      { method: "GET", path: "/api/buyer/orders/:id" },
    ],
  },
  {
    title: "Driver",
    blurb: "Delivery job discovery, take, and completion.",
    endpoints: [
      { method: "GET", path: "/api/driver/jobs" },
      { method: "POST", path: "/api/driver/jobs/:id/take" },
      { method: "POST", path: "/api/driver/jobs/:id/complete" },
      { method: "GET", path: "/api/driver/history" },
    ],
  },
  {
    title: "Admin",
    blurb: "Monitoring, discount management, time machine, and overdue refund.",
    endpoints: [
      { method: "GET", path: "/api/admin/monitoring" },
      { method: "POST", path: "/api/admin/vouchers" },
      { method: "POST", path: "/api/admin/time" },
      { method: "POST", path: "/api/admin/overdue" },
    ],
  },
];

const methodTone: Record<string, string> = {
  GET: "bg-[rgba(31,111,106,0.12)] text-[var(--market)]",
  POST: "bg-[rgba(194,90,60,0.12)] text-[var(--danger)]",
  PATCH: "bg-[rgba(184,134,46,0.16)] text-[#8a6d1f]",
};

export const metadata = {
  title: "API Reference",
};

export default function ApiDocsPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            REST · JSON
          </span>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">
            API Reference
          </h1>
          <p className="mt-4 leading-7 text-[var(--muted)]">
            SEAPEDIA exposes Next.js Route Handlers under{" "}
            <code className="rounded bg-[var(--soft)] px-1.5 py-0.5 font-mono text-sm text-[var(--ink)]">
              /api/*
            </code>
            . All requests and responses are JSON, and private endpoints are
            authorized by the session&rsquo;s active role.
          </p>
          <a
            href="/openapi.json"
            className="mt-6 inline-flex items-center gap-2 rounded-[0.625rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--ink)]"
          >
            <FileJson size={17} className="text-[var(--market)]" />
            Download OpenAPI summary
          </a>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {apiGroups.map((group) => (
            <Card key={group.title} className="p-6">
              <h2 className="font-display text-xl">{group.title}</h2>
              <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                {group.blurb}
              </p>
              <ul className="mt-4 grid gap-2">
                {group.endpoints.map((endpoint) => (
                  <li
                    key={`${endpoint.method} ${endpoint.path}`}
                    className="flex items-center gap-3 rounded-[0.625rem] border border-[var(--line)] bg-[var(--soft)]/50 px-3 py-2"
                  >
                    <span
                      className={`inline-flex w-14 shrink-0 justify-center rounded-md px-2 py-1 text-[11px] font-bold ${
                        methodTone[endpoint.method] ?? "bg-[var(--soft)]"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="truncate font-mono text-sm text-[var(--ink)]">
                      {endpoint.path}
                    </code>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
