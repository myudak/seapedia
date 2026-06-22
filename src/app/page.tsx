import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Clock3,
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
import { listCatalogProducts } from "@/lib/domain/state";
import { formatRupiah } from "@/lib/seed/public-products";

const stats = [
  ["12% PPN", "Transparent tax summary"],
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
  { name: "Fashion", icon: ShoppingBag, tone: "bg-red-50 text-[var(--danger)]" },
  { name: "Food", icon: Utensils, tone: "bg-amber-50 text-[#a16207]" },
  { name: "Home", icon: Sofa, tone: "bg-emerald-50 text-[var(--market)]" },
  { name: "Gadget", icon: Smartphone, tone: "bg-sky-50 text-[#0369a1]" },
];

const services = [
  { label: "Instant courier", icon: Truck },
  { label: "Seller verified", icon: PackageCheck },
  { label: "Wallet protected", icon: ShieldCheck },
  { label: "Demo support", icon: Headphones },
];

export default function Home() {
  const products = listCatalogProducts();
  const featuredProducts = products.filter((product) => product.featured);
  const flashProducts = products.slice(0, 4);

  return (
    <AppShell>
      <main className="bg-[var(--background)]">
        <section className="relative overflow-hidden border-b border-[var(--line)] bg-black">
          <Image
            src="/assets/brand/marketplace-hero.png"
            alt="Curated SEAPEDIA marketplace products"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.82)_37%,rgba(0,0,0,0.15)_78%)]" />
          <div className="relative mx-auto min-h-[560px] max-w-7xl px-4 py-12 sm:px-6 lg:flex lg:min-h-[640px] lg:items-center">
            <div className="max-w-2xl text-white">
              <Badge className="border-white/20 bg-white/10 text-white">
                SEA Week Deals / Demo ready
              </Badge>
              <h1 className="mt-6 text-5xl font-black leading-[0.96] md:text-7xl">
                Belanja lokal dengan alur marketplace lengkap.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/78 md:text-lg">
                Browse produk, pakai wallet, cek PPN 12%, pilih pengiriman,
                lalu lanjutkan order sampai seller, driver, dan admin dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="btn-primary" href="/products">
                  Shop catalog
                  <ArrowRight size={18} />
                </Link>
                <Link className="btn-secondary-dark" href="/login">
                  Login demo
                </Link>
              </div>
              <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
                {stats.map(([value, label]) => (
                  <div
                    key={value}
                    className="border border-white/15 bg-white/10 p-4 backdrop-blur"
                  >
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-white/62">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--line)] bg-white">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.label} className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-md bg-[var(--ink)] text-white">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-black">{service.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge>Flash Sale</Badge>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                Deals that look like a real marketplace shelf.
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm font-black text-[var(--danger)]">
              <Clock3 size={18} />
              05 : 23 : 18
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {flashProducts.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <Card className="group h-full overflow-hidden">
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
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-black uppercase text-[var(--muted)]">
                      {product.category}
                    </p>
                    <h3 className="mt-2 min-h-12 text-base font-black leading-6">
                      {product.name}
                    </h3>
                    <p className="mt-3 text-lg font-black text-[var(--danger)]">
                      {formatRupiah(product.price)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                      {product.rating?.toFixed(1)} rating • {product.soldCount} sold
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--line)] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">Browse by category</h2>
              <Link
                href="/products"
                className="text-sm font-black text-[var(--danger)] underline-offset-4 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    href="/products"
                    key={category.name}
                    className="flex items-center justify-between border border-[var(--line)] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[var(--danger)] hover:shadow-[0_14px_40px_rgba(17,24,39,0.08)]"
                  >
                    <span className="flex items-center gap-3 font-black">
                      <span
                        className={`grid size-11 place-items-center rounded-md ${category.tone}`}
                      >
                        <Icon size={20} />
                      </span>
                      {category.name}
                    </span>
                    <ArrowRight size={18} />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge>Multi-role engine</Badge>
            <h2 className="mt-3 text-3xl font-black">
              One storefront, four operational dashboards.
            </h2>
            <p className="mt-3 leading-7 text-[var(--muted)]">
              The public shop is only the front counter. Behind it, every demo
              role has a specific workflow: checkout, fulfillment, delivery,
              monitoring, discounts, and overdue refunds.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-black text-[var(--market)]">
              <Sparkles size={18} />
              Built for Level 7 assignment coverage.
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2" id="roles">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card key={role.title} className="p-5">
                  <div className="flex gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-md bg-[var(--ink)] text-white">
                      <Icon size={22} />
                    </span>
                    <div>
                      <h3 className="text-base font-black">{role.title}</h3>
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

        {featuredProducts.length ? (
          <section className="border-y border-[var(--line)] bg-white">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black">Best selling products</h2>
                <Link className="btn-compact" href="/products">
                  More products
                </Link>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {featuredProducts.map((product) => (
                  <Link
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="grid overflow-hidden border border-[var(--line)] bg-white transition hover:-translate-y-0.5 hover:border-[var(--danger)] hover:shadow-[0_18px_55px_rgba(17,24,39,0.10)] sm:grid-cols-[220px_1fr]"
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
                    <div className="p-5">
                      <p className="text-xs font-black uppercase text-[var(--muted)]">
                        {product.storeName}
                      </p>
                      <h3 className="mt-2 text-xl font-black">{product.name}</h3>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                        {product.description}
                      </p>
                      <p className="mt-4 text-2xl font-black text-[var(--danger)]">
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
