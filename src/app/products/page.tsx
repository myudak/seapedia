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
import {
  getCatalogPage,
  parseCatalogPage,
  parseCatalogSort,
  parseCategory,
  productCategories,
} from "@/lib/catalog/server";
import type { CatalogSort } from "@/lib/catalog/catalog";
import { formatRupiah } from "@/lib/seed/public-products";

export const metadata = {
  title: "Catalog",
};

type ProductsPageProps = {
  searchParams: Promise<{ q?: string; category?: string; page?: string; sort?: string }>;
};

function buildHref(params: { q?: string; category?: string; page?: number; sort?: CatalogSort }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  if (params.sort && params.sort !== "popular") search.set("sort", params.sort);
  const query = search.toString();
  return query ? `/products?${query}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { q = "", category = "", page = "1", sort: sortValue = "popular" } = await searchParams;
  const query = q.trim();
  const activeCategory = parseCategory(category.trim());
  const sort = parseCatalogSort(sortValue);
  const catalog = await getCatalogPage({
    q: query || undefined,
    category: activeCategory,
    page: parseCatalogPage(page),
    sort,
  });
  const products = catalog.items;

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
              <input type="hidden" name="sort" value={sort} />
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
                  href={buildHref({ q: query, sort })}
                  className={`flex items-center justify-between rounded-[0.625rem] px-3.5 py-2.5 text-sm font-semibold transition ${
                    activeCategory
                      ? "border border-[var(--line)] hover:border-[var(--ink)]"
                      : "bg-[var(--danger)] text-white"
                  }`}
                >
                  All products
                  <span>32</span>
                </Link>
                {productCategories.map((cat) => {
                  const isActive = cat === activeCategory;
                  return (
                    <Link
                      href={buildHref({ q: query, category: cat, sort })}
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
                          {isActive ? <ArrowRight size={14} /> : 8}
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
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <p className="text-sm text-[var(--muted)]">
                {hasFilters ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-[var(--ink)]">
                      {catalog.total}
                    </span>{" "}
                    {catalog.total === 1 ? "result" : "results"}
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
                  <>Showing {catalog.total} curated products</>
                )}
              </p>
              <form action="/products" method="get" className="flex items-end gap-2">
                {query ? <input type="hidden" name="q" value={query} /> : null}
                {activeCategory ? <input type="hidden" name="category" value={activeCategory} /> : null}
                <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                  Sort by
                  <select name="sort" defaultValue={sort} className="min-h-10 rounded-[0.5rem] border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]">
                    <option value="popular">Most popular</option>
                    <option value="rating">Top rated</option>
                    <option value="price-asc">Lowest price</option>
                    <option value="price-desc">Highest price</option>
                  </select>
                </label>
                <button className="btn-compact min-h-10" type="submit">Apply</button>
              </form>
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

            {catalog.totalPages > 1 ? (
              <nav aria-label="Catalog pagination" className="mt-8 flex flex-wrap justify-center gap-2">
                {Array.from({ length: catalog.totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={buildHref({ q: query, category: activeCategory, page: pageNumber, sort })}
                    aria-current={pageNumber === catalog.page ? "page" : undefined}
                    className={`grid size-10 place-items-center rounded-[0.5rem] border text-sm font-semibold transition ${pageNumber === catalog.page ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white hover:border-[var(--ink)]"}`}
                  >
                    {pageNumber}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
