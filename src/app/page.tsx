import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Headphones,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sofa,
  Sparkles,
  Store,
  Truck,
  Utensils,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReviewsSection } from "@/components/reviews-section";
import { getFeaturedProducts } from "@/lib/catalog/server";
import { formatRupiah } from "@/lib/seed/public-products";

const stats = [
  ["12%", "PPN shown at checkout"],
  ["80%", "Driver fee earning"],
  ["1 store", "Single-store checkout"],
];

const roles = [
  {
    title: "Buyer / Pembeli",
    text: "Browse products, manage cart, top up wallet, checkout, and track delivery.",
    icon: ShoppingBag,
  },
  {
    title: "Seller / Penjual",
    text: "Create a store, manage products, process orders, and view income.",
    icon: Store,
  },
  {
    title: "Driver / Pengirim",
    text: "Find ready jobs, take deliveries, complete jobs, and track earnings.",
    icon: Bike,
  },
  {
    title: "Admin",
    text: "Monitor marketplace data, manage discounts, and simulate overdue handling.",
    icon: ShieldCheck,
  },
];

const categories = [
  {
    name: "Fashion",
    icon: ShoppingBag,
    tone: "bg-[rgba(194,90,60,0.1)] text-[var(--danger)]",
  },
  {
    name: "Food",
    icon: Utensils,
    tone: "bg-[rgba(184,134,46,0.14)] text-[#8a6d1f]",
  },
  {
    name: "Home",
    icon: Sofa,
    tone: "bg-[rgba(31,111,106,0.12)] text-[var(--market)]",
  },
  {
    name: "Gadget",
    icon: Smartphone,
    tone: "bg-[var(--soft)] text-[var(--ink)]",
  },
];

const services = [
  { label: "Instant courier", icon: Truck },
  { label: "Seller verified", icon: PackageCheck },
  { label: "Wallet protected", icon: ShieldCheck },
  { label: "Support center", icon: Headphones },
];

export default async function Home() {
  const featuredProducts = await getFeaturedProducts(4);
  const popularProducts = featuredProducts;

  return (
    <AppShell>
      <main className="bg-[var(--background)]">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[var(--line)] bg-[#15110d]">
          <Image
            src="/assets/brand/marketplace-hero.png"
            alt="Curated SEAPEDIA marketplace products"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,17,13,0.94)_0%,rgba(21,17,13,0.78)_42%,rgba(21,17,13,0.1)_82%)]" />
          <div className="relative mx-auto min-h-[540px] max-w-7xl px-4 py-14 sm:px-6 lg:flex lg:min-h-[620px] lg:items-center">
            <div className="max-w-2xl text-white">
              <Badge className="border-white/15 bg-white/10 text-white/85">
                Marketplace, end to end
              </Badge>
              <h1 className="mt-6 font-display text-5xl leading-[1.02] md:text-7xl">
                Belanja lokal dengan alur marketplace lengkap.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/75 md:text-lg">
                Browse produk, pakai wallet, lihat PPN 12%, pilih pengiriman,
                lalu lanjutkan order sampai seller, driver, dan admin dashboard.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link className="btn-primary" href="/products">
                  Shop catalog
                  <ArrowRight size={18} />
                </Link>
                <Link className="btn-secondary-dark" href="/login">
                  Login
                </Link>
              </div>
              <div className="mt-12 grid max-w-xl gap-3 sm:grid-cols-3">
                {stats.map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/12 bg-white/5 p-4 backdrop-blur"
                  >
                    <p className="font-display text-2xl text-white">{value}</p>
                    <p className="mt-1 text-xs font-medium text-white/60">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Service strip */}
        <section className="border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.label} className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-[var(--soft)] text-[var(--market)]">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-medium">{service.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Popular */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge>Popular right now</Badge>
              <h2 className="mt-4 font-display text-3xl md:text-4xl">
                A marketplace shelf, curated by hand.
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--danger)] underline-offset-4 hover:underline"
            >
              View all products
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularProducts.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(30,27,23,0.1)]">
                  <div className="relative aspect-[4/5] bg-white">
                    {product.discountLabel ? (
                      <span className="absolute left-3 top-3 z-10 rounded-full bg-[var(--danger)] px-2.5 py-1 text-xs font-semibold text-white">
                        {product.discountLabel}
                      </span>
                    ) : null}
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                      {product.category}
                    </p>
                    <h3 className="mt-2 font-display text-lg leading-6">
                      {product.name}
                    </h3>
                    <p className="mt-3 text-base font-semibold">
                      {formatRupiah(product.price)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {product.rating?.toFixed(1)} rating · {product.soldCount}{" "}
                      sold
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section
          id="categories"
          className="scroll-mt-28 border-y border-[var(--line)] bg-[var(--surface)]"
        >
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl md:text-3xl">
                Browse by category
              </h2>
              <Link
                href="/products"
                className="text-sm font-semibold text-[var(--danger)] underline-offset-4 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    href={`/products?category=${category.name}`}
                    key={category.name}
                    className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--ink)]"
                  >
                    <span className="flex items-center gap-3 font-medium">
                      <span
                        className={`grid size-11 place-items-center rounded-xl ${category.tone}`}
                      >
                        <Icon size={20} />
                      </span>
                      {category.name}
                    </span>
                    <ArrowRight size={18} className="text-[var(--muted)]" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Multi-role */}
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge>Multi-role engine</Badge>
            <h2 className="mt-4 font-display text-3xl leading-tight md:text-4xl">
              One storefront, four operational dashboards.
            </h2>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              The public shop is only the front counter. Behind it, every role
              has a specific workflow: checkout, fulfillment, delivery,
              monitoring, discounts, and overdue refunds.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[var(--market)]">
              <Sparkles size={18} />
              Fulfillment, delivery, and monitoring in one workflow.
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2" id="roles">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card key={role.title} className="p-5">
                  <div className="flex gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--soft)] text-[var(--ink)]">
                      <Icon size={22} />
                    </span>
                    <div>
                      <h3 className="font-semibold">{role.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        {role.text}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Best selling */}
        {featuredProducts.length ? (
          <section className="border-y border-[var(--line)] bg-[var(--surface)]">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-2xl md:text-3xl">
                  Best selling products
                </h2>
                <Link className="btn-compact" href="/products">
                  More products
                </Link>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {featuredProducts.map((product) => (
                  <Link
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="grid overflow-hidden rounded-2xl border border-[var(--line)] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(30,27,23,0.1)] sm:grid-cols-[220px_1fr]"
                  >
                    <div className="relative min-h-56 bg-[var(--soft)]">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(min-width: 768px) 220px, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                        {product.storeName}
                      </p>
                      <h3 className="mt-2 font-display text-xl">
                        {product.name}
                      </h3>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                        {product.description}
                      </p>
                      <p className="mt-4 text-xl font-semibold">
                        {formatRupiah(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <ReviewsSection />
      </main>
    </AppShell>
  );
}
