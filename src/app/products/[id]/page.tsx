import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatRupiah, publicProducts } from "@/lib/seed/public-products";

type ProductDetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return publicProducts.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: ProductDetailProps) {
  const { id } = await params;
  const product = publicProducts.find((item) => item.id === id);
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const { id } = await params;
  const product = publicProducts.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return (
    <AppShell>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.82fr]">
        <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-[var(--line)] bg-white">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <Card className="p-6">
          <Badge>Read-only detail / Detail publik</Badge>
          <h1 className="mt-4 text-4xl font-black">{product.name}</h1>
          <p className="mt-3 text-lg font-black text-[var(--market)]">
            {formatRupiah(product.price)}
          </p>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            {product.description}
          </p>
          <div className="mt-6 grid gap-3 border-t border-[var(--line)] pt-6 text-sm">
            <p>
              <span className="font-bold">Store:</span> {product.storeName}
            </p>
            <p>
              <span className="font-bold">Stock:</span> {product.stock} units
            </p>
            <p className="rounded-md bg-[rgba(13,107,87,0.08)] p-3 font-semibold text-[var(--market)]">
              Guests may browse this page. Checkout and cart actions are only
              available after login as Buyer / Pembeli.
            </p>
          </div>
          <Link
            href="/products"
            className="mt-6 inline-flex text-sm font-bold text-[var(--market)] underline-offset-4 hover:underline"
          >
            Back to catalog
          </Link>
        </Card>
      </main>
    </AppShell>
  );
}
