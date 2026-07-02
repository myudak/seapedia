import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BadgeCheck,
  ChevronRight,
  CreditCard,
  PackageCheck,
  ShieldCheck,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BuyActions } from "@/components/buy-actions";
import { ProductGallery } from "@/components/product-gallery";
import { JsonLd } from "@/components/json-ld";
import { Card } from "@/components/ui/card";
import { getCatalogProduct } from "@/lib/catalog/server";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";
import { formatRupiah } from "@/lib/seed/public-products";
import { absoluteUrl, siteName } from "@/lib/site";

type ProductDetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getCatalogProduct(id);
  if (!product) {
    return {
      title: "Produk tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const url = `/products/${product.id}`;
  const description = `${product.description} Tersedia dari ${product.storeName} di SEAPEDIA.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url,
      title: `${product.name} | ${siteName}`,
      description,
      images: [{ url: product.imageUrl, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${siteName}`,
      description,
      images: [product.imageUrl],
    },
  };
}

const infoRows = [
  {
    title: "Shipping & delivery",
    body: "Instant, Next Day, and Regular methods each calculate their own delivery fee, due date, and overdue handling at checkout.",
  },
  {
    title: "Returns & refunds",
    body: "Orders that go overdue are auto-returned or refunded based on the delivery method, with the amount returned to your wallet.",
  },
  {
    title: "Single-store checkout",
    body: "One cart holds products from a single store only. Adding an item from another store will ask you to clear the cart first.",
  },
];

const assurances = [
  {
    icon: Truck,
    title: "Delivery SLA",
    body: "Instant, Next Day, and Regular options with due dates and overdue handling.",
  },
  {
    icon: CreditCard,
    title: "Wallet payment",
    body: "Checkout debits wallet balance and blocks insufficient funds.",
  },
  {
    icon: PackageCheck,
    title: "Seller processing",
    body: "Seller moves paid orders into the driver pickup queue.",
  },
  {
    icon: ShieldCheck,
    title: "12% PPN visible",
    body: "Tax, discount, delivery fee, and total are itemized at checkout.",
  },
];

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { id } = await params;
  const product = await getCatalogProduct(id);

  if (!product) {
    notFound();
  }

  const profile = await fetchAuthQuery(api.profiles.getProfile, {});
  const isLoggedIn = Boolean(profile);
  const hasBuyerRole = profile?.user.roles.includes("Buyer") ?? false;
  const canBuy = profile?.activeRole === "Buyer";

  const galleryImages = product.galleryImages?.length
    ? product.galleryImages
    : [product.imageUrl];

  const details = [
    ["Store", product.storeName],
    ["Category", product.category ?? "Marketplace"],
    ["Stock", `${product.stock} units ready`],
    ["Rating", `${product.rating?.toFixed(1) ?? "New"} / 5`],
    ["Sold", `${product.soldCount ?? 0} orders`],
    ["Checkout", "Buyer role only"],
  ];
  const productUrl = absoluteUrl(`/products/${product.id}`);

  return (
    <AppShell>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: galleryImages.map(absoluteUrl),
            category: product.category,
            sku: product.id,
            url: productUrl,
            offers: {
              "@type": "Offer",
              url: productUrl,
              priceCurrency: "IDR",
              price: product.price,
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: {
                "@type": "Organization",
                name: product.storeName,
              },
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Beranda",
                item: absoluteUrl("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Produk",
                item: absoluteUrl("/products"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: product.name,
                item: productUrl,
              },
            ],
          },
        ]}
      />
      <main className="bg-[var(--background)]">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]">
            <Link href="/" className="transition hover:text-[var(--ink)]">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link href="/products" className="transition hover:text-[var(--ink)]">
              {product.category ?? "Catalog"}
            </Link>
            <ChevronRight size={14} />
            <span className="text-[var(--ink)]">{product.name}</span>
          </nav>
        </div>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:py-12">
          {/* Gallery */}
          <ProductGallery
            images={galleryImages}
            name={product.name}
            discountLabel={product.discountLabel}
          />

          {/* Buy rail */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                <Store size={13} />
                {product.storeName}
              </Link>
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--gold)]">
                <Star size={15} fill="currentColor" />
                {product.rating?.toFixed(1) ?? "New"}
              </span>
              <span className="text-[var(--muted)]">
                {product.soldCount ?? 0} sold
              </span>
            </div>

            <h1 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-[var(--muted)]">
              {product.description}
            </p>
            <p className="mt-6 text-3xl font-semibold tracking-tight">
              {formatRupiah(product.price)}
            </p>

            {/* Quantity + actions — auth-aware */}
            <BuyActions
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                category: product.category,
                storeName: product.storeName,
              }}
              canBuy={canBuy}
              isLoggedIn={isLoggedIn}
              hasBuyerRole={hasBuyerRole}
              inStock={product.stock > 0}
            />

            {/* Expandable info — native, no JS */}
            <div className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {infoRows.map((row) => (
                <details key={row.title} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
                    {row.title}
                    <ChevronRight
                      size={16}
                      className="text-[var(--muted)] transition group-open:rotate-90"
                    />
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {row.body}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Product details table */}
        <section className="border-t border-[var(--line)] bg-[var(--surface)]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="font-display text-2xl">Product details</h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--muted)]">
                {product.description}
              </p>
            </div>
            <dl className="overflow-hidden rounded-2xl border border-[var(--line)]">
              {details.map(([label, value], index) => (
                <div
                  key={label}
                  className={`flex items-center justify-between gap-4 px-5 py-3.5 text-sm ${
                    index % 2 === 0 ? "bg-[var(--soft)]/60" : "bg-white"
                  }`}
                >
                  <dt className="text-[var(--muted)]">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Assurances */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {assurances.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="p-5">
                  <Icon className="text-[var(--market)]" size={22} />
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {item.body}
                  </p>
                </Card>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <BadgeCheck className="text-[var(--market)]" size={22} />
            <p className="text-sm text-[var(--muted)]">
              SEAPEDIA verifies catalog data before checkout.
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
