import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

const apiGroups = [
  ["Auth", "/api/auth/register, /api/auth/login, /api/auth/role, /api/profile"],
  ["Public", "/api/products, /api/products/:id, /api/reviews"],
  ["Seller", "/api/seller/store, /api/seller/products, /api/seller/orders"],
  ["Buyer", "/api/buyer/wallet, /api/buyer/cart, /api/buyer/checkout"],
  ["Driver", "/api/driver/jobs, /api/driver/history"],
  ["Admin", "/api/admin/monitoring, /api/admin/vouchers, /api/admin/overdue"],
];

export const metadata = {
  title: "API Docs",
};

export default function ApiDocsPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl font-black">API Documentation</h1>
        <p className="mt-3 max-w-3xl text-[var(--muted)]">
          SEAPEDIA exposes Next.js Route Handlers under `/api/*`, with Convex as
          the database contract. Download the OpenAPI summary from{" "}
          <a
            className="font-bold text-[var(--market)] underline"
            href="/openapi.json"
          >
            /openapi.json
          </a>
          .
        </p>
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {apiGroups.map(([title, endpoints]) => (
            <Card key={title} className="p-5">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {endpoints}
              </p>
            </Card>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
