import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Star,
  Store,
  Truck,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { WishlistHeart } from "@/components/wishlist-heart";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listCatalogProducts } from "@/lib/domain/state";
import { formatRupiah } from "@/lib/seed/public-products";

export const metadata = {
  title: "Catalog",
};

type ProductsPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

function buildHref(params: { q?: string; category?: string }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  const query = search.toString();
  return query ? `/products?${query}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { q = "", category = "" } = await searchParams;
  const query = q.trim();
  const activeCategory = category.trim();

  const allProducts = listCatalogProducts();
  const categories = Array.from(
    new Set(allProducts.map((product) => product.category ?? "All")),
  );

  const needle = query.toLowerCase();
  const products = allProducts.filter((product) => {
    const matchesCategory =
      !activeCategory || product.category === activeCategory;
    const matchesQuery =
      !needle ||
      [
        product.name,
        product.description,
        product.category,
        product.storeName,
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(needle));
    return matchesCategory && matchesQuery;
  });

  const hasFilters = Boolean(query || activeCategory);

  return (
    <AppShell>
      <main className="bg-[var(--background)]">
        <section className="border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <Badge>Guest access · Bisa dilihat tamu</Badge>
                <h1 className="mt-4 font-display text-4xl md:text-5xl">
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
                className="text-sm font-semibold text-[var(--danger)] underline-offset-4 hover:underline"
              >
                Back to home
              </Link>
            </div>

            {/* Working search — server-side GET form */}
            <form
              action="/products"
              method="get"
              className="mt-7 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center"
            >
              {activeCategory ? (
                <input type="hidden" name="category" value={activeCategory} />
              ) : null}
              <div className="flex min-h-12 items-center gap-3 rounded-[0.625rem] border border-[var(--line)] bg-white px-4 transition focus-within:border-[var(--danger)] focus-within:ring-4 focus-within:ring-[rgba(194,90,60,0.14)]">
                <Search size={18} className="text-[var(--muted)]" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search bags, coffee, lamps, accessories"
                  className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
                  aria-label="Search products"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-[0.625rem] bg-[var(--ink)] px-5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  <Search size={16} />
                  Search
                </button>
                {hasFilters ? (
                  <Link
                    href="/products"
                    className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-[0.625rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold transition hover:border-[var(--ink)]"
                  >
                    <X size={16} />
                    Clear
                  </Link>
                ) : null}
              </div>
            </form>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[250px_1fr]">
          <aside className="space-y-4">
            <Card className="p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Categories
              </h2>
              <div className="mt-4 grid gap-2">
                <Link
                  href={buildHref({ q: query })}
                  className={`flex items-center justify-between rounded-[0.625rem] px-3.5 py-2.5 text-sm font-semibold transition ${
                    activeCategory
                      ? "border border-[var(--line)] hover:border-[var(--ink)]"
                      : "bg-[var(--danger)] text-white"
                  }`}
                >
                  All products
                  <span>{allProducts.length}</span>
                </Link>
                {categories.map((cat) => {
                  const count = allProducts.filter(
                    (product) => product.category === cat,
                  ).length;
                  const isActive = cat === activeCategory;
                  return (
                    <Link
                      href={buildHref({ q: query, category: cat })}
                      key={cat}
                      className={`flex items-center justify-between rounded-[0.625rem] px-3.5 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-[var(--danger)] text-white"
                          : "border border-[var(--line)] hover:border-[var(--ink)]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {cat}
                      </span>
                      <span
                        className={
                          isActive
                            ? "text-white/90"
                            : "text-[var(--muted)]"
                        }
                      >
                        {isActive ? <ArrowRight size={14} /> : count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                Buyer guarantees
              </h2>
              <div className="mt-4 grid gap-3 text-sm font-medium">
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
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--muted)]">
                {hasFilters ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-[var(--ink)]">
                      {products.length}
                    </span>{" "}
                    {products.length === 1 ? "result" : "results"}
                    {query ? (
                      <>
                        {" "}
                        for{" "}
                        <span className="font-semibold text-[var(--ink)]">
                          “{query}”
                        </span>
                      </>
                    ) : null}
                    {activeCategory ? (
                      <>
                        {" "}
                        in{" "}
                        <span className="font-semibold text-[var(--ink)]">
                          {activeCategory}
                        </span>
                      </>
                    ) : null}
                  </>
                ) : (
                  <>Showing {products.length} curated products</>
                )}
              </p>
              <p className="hidden text-sm font-semibold text-[var(--market)] sm:block">
                PPN 12% appears in checkout
              </p>
            </div>

            {products.length === 0 ? (
              <Card className="grid place-items-center gap-3 px-6 py-16 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-[var(--soft)] text-[var(--muted)]">
                  <Search size={22} />
                </span>
                <h3 className="font-display text-xl">No products found</h3>
                <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
                  Nothing matched your search. Try a different keyword or clear
                  the filters to see the full catalog.
                </p>
                <Link
                  href="/products"
                  className="btn-primary mt-1"
                >
                  Clear filters
                </Link>
              </Card>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <Link href={`/products/${product.id}`} key={product.id}>
                    <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(30,27,23,0.12)]">
                      <div className="relative aspect-[4/5] bg-white">
                        {product.discountLabel ? (
                          <span className="absolute left-3 top-3 z-10 rounded-full bg-[var(--danger)] px-2.5 py-1 text-xs font-semibold text-white">
                            {product.discountLabel}
                          </span>
                        ) : null}
                        <WishlistHeart
                          item={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            category: product.category,
                            storeName: product.storeName,
                          }}
                          className="absolute right-3 top-3 z-10"
                        />
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1280px) 28vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                            {product.category}
                          </p>
                          <span className="flex items-center gap-1 text-xs font-semibold text-[var(--gold)]">
                            <Star size={14} fill="currentColor" />
                            {product.rating?.toFixed(1) ?? "New"}
                          </span>
                        </div>
                        <h2 className="mt-2 font-display text-lg leading-6">
                          {product.name}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                          {product.description}
                        </p>
                        <p className="mt-4 text-xl font-semibold">
                          {formatRupiah(product.price)}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3 text-xs text-[var(--muted)]">
                          <span>{product.storeName}</span>
                          <span>{product.soldCount ?? 0} sold</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
