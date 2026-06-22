import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  Heart,
  PackageCheck,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCatalogProduct, listCatalogProducts } from "@/lib/domain/state";
import { formatRupiah } from "@/lib/seed/public-products";

type ProductDetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return listCatalogProducts().map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductDetailProps) {
  const { id } = await params;
  const product = getCatalogProduct(id);
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { id } = await params;
  const product = getCatalogProduct(id);

  if (!product) {
    notFound();
  }

  const galleryImages = product.galleryImages?.length
    ? product.galleryImages
    : [product.imageUrl];

  return (
    <AppShell>
      <main className="bg-[var(--background)]">
        <section className="border-b border-[var(--line)] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-black text-[var(--muted)] hover:text-[var(--danger)]"
            >
              <ArrowLeft size={16} />
              Back to catalog
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="relative min-h-[520px] overflow-hidden border border-[var(--line)] bg-white">
              {product.discountLabel ? (
                <span className="absolute left-4 top-4 z-10 bg-[var(--danger)] px-3 py-2 text-xs font-black text-white">
                  {product.discountLabel}
                </span>
              ) : null}
              <Image
                src={galleryImages[0]}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((imageUrl, index) => (
                <div
                  className="relative aspect-square border border-[var(--line)] bg-white"
                  key={`${imageUrl}-${index}`}
                >
                  <Image
                    src={imageUrl}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{product.category ?? "Marketplace"}</Badge>
                <span className="inline-flex items-center gap-1 text-sm font-black text-[#b45309]">
                  <Star size={16} fill="currentColor" />
                  {product.rating?.toFixed(1) ?? "New"} rating
                </span>
                <span className="text-sm font-bold text-[var(--muted)]">
                  {product.soldCount ?? 0} sold
                </span>
              </div>

              <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
                {product.name}
              </h1>
              <p className="mt-4 text-3xl font-black text-[var(--danger)]">
                {formatRupiah(product.price)}
              </p>
              <p className="mt-5 leading-8 text-[var(--muted)]">
                {product.description}
              </p>

              <div className="mt-6 grid gap-3 border-y border-[var(--line)] py-5 text-sm">
                <p className="flex items-center justify-between gap-3">
                  <span className="font-bold text-[var(--muted)]">Store</span>
                  <span className="font-black">{product.storeName}</span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="font-bold text-[var(--muted)]">Stock</span>
                  <span className="font-black">{product.stock} units ready</span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="font-bold text-[var(--muted)]">Checkout</span>
                  <span className="font-black">Buyer role only</span>
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <Link className="btn-primary min-h-12" href="/login">
                  Login to buy
                </Link>
                <button className="inline-flex min-h-12 items-center justify-center gap-2 border border-[var(--line)] bg-white px-4 text-sm font-black hover:border-[var(--danger)]">
                  <Heart size={18} />
                  Wishlist
                </button>
              </div>
              <p className="mt-4 bg-[rgba(8,117,111,0.08)] p-3 text-sm font-semibold leading-6 text-[var(--market)]">
                Guests may inspect this product. Cart and checkout actions are
                intentionally locked until login as Buyer / Pembeli.
              </p>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="p-4">
                <Truck className="text-[var(--market)]" size={22} />
                <h2 className="mt-3 font-black">Delivery SLA</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Instant, Next Day, and Regular options calculate due dates and
                  overdue handling.
                </p>
              </Card>
              <Card className="p-4">
                <CreditCard className="text-[var(--market)]" size={22} />
                <h2 className="mt-3 font-black">Wallet payment</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Checkout debits wallet balance and blocks insufficient funds.
                </p>
              </Card>
              <Card className="p-4">
                <PackageCheck className="text-[var(--market)]" size={22} />
                <h2 className="mt-3 font-black">Seller processing</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Seller moves paid orders into the driver pickup queue.
                </p>
              </Card>
              <Card className="p-4">
                <ShieldCheck className="text-[var(--market)]" size={22} />
                <h2 className="mt-3 font-black">12% PPN visible</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Tax, discount, delivery fee, and total are itemized at checkout.
                </p>
              </Card>
            </div>

            <div className="flex items-center gap-3 border border-[var(--line)] bg-white p-4">
              <BadgeCheck className="text-[var(--market)]" size={22} />
              <p className="text-sm font-bold text-[var(--muted)]">
                SEAPEDIA verifies catalog data before checkout.
              </p>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
