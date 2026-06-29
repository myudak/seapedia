import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { catalogSorts, type CatalogOptions, type CatalogSort } from "./catalog";
import type { ProductCategory } from "../seed/public-products";

export const productCategories: ProductCategory[] = ["Fashion", "Food", "Home", "Gadget"];

export function parseCategory(value?: string): ProductCategory | undefined {
  return productCategories.find((category) => category === value);
}

export function parseCatalogSort(value?: string): CatalogSort {
  return catalogSorts.find((sort) => sort === value) ?? "popular";
}

export function parseCatalogPage(value?: string): number {
  const page = Number(value);
  return Number.isFinite(page) ? Math.trunc(page) : 1;
}

export async function getCatalogPage(options: CatalogOptions = {}) {
  return await fetchQuery(api.catalog.list, options);
}

export async function getCatalogProduct(publicId: string) {
  return await fetchQuery(api.catalog.getByPublicId, { publicId });
}

export async function getFeaturedProducts(limit = 4) {
  return await fetchQuery(api.catalog.featured, { limit });
}
