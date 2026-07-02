import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getSitemapProducts } from "@/lib/catalog/server";
import { publicProducts } from "@/lib/seed/public-products";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const products = await getSitemapProducts().catch(() =>
    publicProducts.map((product) => ({
      publicId: product.id,
      imageUrl: product.imageUrl,
      updatedAt: Date.UTC(2026, 0, 1),
    })),
  );

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/products"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.publicId}`),
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [absoluteUrl(product.imageUrl)],
    })),
  ];
}
