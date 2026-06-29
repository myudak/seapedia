import type { ProductCategory } from "../seed/public-products";

export const CATALOG_PAGE_SIZE = 12;
export const catalogSorts = ["popular", "rating", "price-asc", "price-desc"] as const;
export type CatalogSort = (typeof catalogSorts)[number];

export type CatalogOptions = {
  q?: string;
  category?: ProductCategory;
  page?: number;
  sort?: CatalogSort;
};

export type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  storeName: string;
  storeSlug: string;
  imageUrl: string;
  galleryImages: string[];
  category: ProductCategory;
  rating: number;
  soldCount: number;
  discountLabel?: string;
  featured: boolean;
};

export type CatalogPage = {
  items: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function paginateCatalog(
  products: readonly CatalogProduct[],
  options: CatalogOptions,
): CatalogPage {
  const needle = options.q?.trim().toLocaleLowerCase("id-ID") ?? "";
  const filtered = products.filter((product) => {
    if (options.category && product.category !== options.category) return false;
    if (!needle) return true;

    return [product.name, product.description, product.category, product.storeName]
      .some((field) => field.toLocaleLowerCase("id-ID").includes(needle));
  });

  const sort = options.sort ?? "popular";
  const sorted = [...filtered].sort((left, right) => {
    if (sort === "rating") return right.rating - left.rating || right.soldCount - left.soldCount;
    if (sort === "price-asc") return left.price - right.price || right.soldCount - left.soldCount;
    if (sort === "price-desc") return right.price - left.price || right.soldCount - left.soldCount;
    return right.soldCount - left.soldCount || right.rating - left.rating;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const requestedPage = Number.isFinite(options.page) ? Math.trunc(options.page ?? 1) : 1;
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const start = (page - 1) * CATALOG_PAGE_SIZE;

  return {
    items: sorted.slice(start, start + CATALOG_PAGE_SIZE),
    total,
    page,
    pageSize: CATALOG_PAGE_SIZE,
    totalPages,
  };
}
