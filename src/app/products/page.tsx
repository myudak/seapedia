import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Filter,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listCatalogProducts } from "@/lib/domain/state";
import { formatRupiah } from "@/lib/seed/public-products";

export const metadata = {
  title: "Catalog",
};

export default function ProductsPage() {
  const products = listCatalogProducts();
  const categories = Array.from(
    new Set(products.map((product) => product.category ?? "All")),
  );

  return (
    <AppShell>
      <main className="bg-[var(--background)]">
        <section className="border-b border-[var(--line)] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <Badge>Guest access / Bisa dilihat tamu</Badge>
                <h1 className="mt-4 text-4xl font-black md:text-5xl">
                  Public Catalog
                </h1>
                <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
                  Browse seeded marketplace goods before login. Cart and checkout
                  remain buyer-only, but prices, stock, stores, and detail pages
                  are open to guests.
                </p>
              </div>
              <Link
                href="/"
                className="text-sm font-black text-[var(--danger)] underline-offset-4 hover:underline"
              >
                Back to home
              </Link>
            </div>

            <div className="mt-7 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex min-h-12 items-center gap-3 border border-[var(--line)] bg-[var(--soft)] px-4">
                <Search size={18} className="text-[var(--muted)]" />
                <span className="text-sm font-semibold text-[var(--muted)]">
                  Search bags, coffee, lamps, accessories
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button className="inline-flex min-h-12 shrink-0 items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-4 text-sm font-black text-white">
                  <SlidersHorizontal size={16} />
                  Recommended
                  <ChevronDown size={16} />
                </button>
                <button className="inline-flex min-h-12 shrink-0 items-center gap-2 border border-[var(--line)] bg-white px-4 text-sm font-black">
                  <Filter size={16} />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-4">
            <Card className="p-4">
              <h2 className="text-sm font-black uppercase text-[var(--muted)]">
                Categories
              </h2>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/products"
                  className="flex items-center justify-between bg-[var(--danger)] px-3 py-2 text-sm font-black text-white"
                >
                  All products
                  <span>{products.length}</span>
                </Link>
                {categories.map((category) => (
                  <Link
                    href="/products"
                    key={category}
                    className="flex items-center justify-between border border-[var(--line)] px-3 py-2 text-sm font-bold hover:border-[var(--danger)]"
                  >
                    {category}
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-black uppercase text-[var(--muted)]">
                Buyer guarantees
              </h2>
              <div className="mt-4 grid gap-3 text-sm font-bold">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-[var(--market)]" />
                  Active role checkout
                </span>
                <span className="flex items-center gap-2">
                  <Truck size={17} className="text-[var(--market)]" />
                  SLA based delivery
                </span>
                <span className="flex items-center gap-2">
                  <Store size={17} className="text-[var(--market)]" />
                  Single-store cart
                </span>
              </div>
            </Card>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-[var(--muted)]">
                Showing {products.length} curated demo products
              </p>
              <p className="hidden text-sm font-black text-[var(--danger)] sm:block">
                PPN 12% appears in checkout
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:border-[var(--danger)] hover:shadow-[0_22px_70px_rgba(17,24,39,0.12)]">
                    <div className="relative aspect-[4/3] bg-white">
                      {product.discountLabel ? (
                        <span className="absolute left-3 top-3 z-10 bg-[var(--danger)] px-2 py-1 text-xs font-black text-white">
                          {product.discountLabel}
                        </span>
                      ) : null}
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1280px) 28vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
                          {product.category}
                        </p>
                        <span className="flex items-center gap-1 text-xs font-black text-[#b45309]">
                          <Star size={14} fill="currentColor" />
                          {product.rating?.toFixed(1) ?? "New"}
                        </span>
                      </div>
                      <h2 className="mt-2 min-h-12 text-lg font-black leading-6">
                        {product.name}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                        {product.description}
                      </p>
                      <p className="mt-4 text-2xl font-black text-[var(--danger)]">
                        {formatRupiah(product.price)}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3 text-xs font-bold text-[var(--muted)]">
                        <span>{product.storeName}</span>
                        <span>{product.soldCount ?? 0} sold</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
