import Image from "next/image";
import Link from "next/link";
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

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge>Guest access / Bisa dilihat tamu</Badge>
            <h1 className="mt-4 text-4xl font-black">Public Catalog</h1>
            <p className="mt-3 max-w-2xl text-[var(--muted)]">
              Products are shown as marketplace items from multiple stores.
              Guests can browse details, but checkout stays hidden until buyer
              login and active role selection.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-bold text-[var(--market)] underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </div>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(23,33,27,0.12)]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {product.storeName}
                  </p>
                  <h2 className="mt-2 text-lg font-black">{product.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {product.description}
                  </p>
                  <p className="mt-4 text-xl font-black text-[var(--market)]">
                    {formatRupiah(product.price)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
