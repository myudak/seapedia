import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { publicProducts } from "@/lib/seed/public-products";
import { paginateCatalog } from "./catalog";

describe("catalog manifest", () => {
  it("contains eight products in each category", () => {
    expect(publicProducts).toHaveLength(32);

    for (const category of ["Fashion", "Food", "Home", "Gadget"] as const) {
      expect(publicProducts.filter((product) => product.category === category)).toHaveLength(8);
    }
  });

  it("uses unique local images for every catalog product", () => {
    const imageUrls = publicProducts.map((product) => product.imageUrl);

    expect(new Set(imageUrls)).toHaveLength(publicProducts.length);
    for (const imageUrl of imageUrls) {
      expect(imageUrl.startsWith("/assets/products/")).toBe(true);
      expect(existsSync(join(process.cwd(), "public", imageUrl))).toBe(true);
    }
  });
});

describe("catalog pagination", () => {
  it("returns twelve products per page and clamps invalid pages", () => {
    const first = paginateCatalog(publicProducts, { page: 1 });
    const last = paginateCatalog(publicProducts, { page: 99 });

    expect(first.items).toHaveLength(12);
    expect(first).toMatchObject({ page: 1, pageSize: 12, total: 32, totalPages: 3 });
    expect(last.page).toBe(3);
    expect(last.items).toHaveLength(8);
  });

  it("filters search and category before paginating", () => {
    const result = paginateCatalog(publicProducts, {
      q: "charger",
      category: "Gadget",
      page: 3,
    });

    expect(result.page).toBe(1);
    expect(result.items.map((product) => product.id)).toEqual(["prd-gan-charger"]);
  });

  it("supports every catalog sort order", () => {
    expect(paginateCatalog(publicProducts, { sort: "popular" }).items[0]?.id).toBe("prd-gan-charger");
    expect(paginateCatalog(publicProducts, { sort: "rating" }).items[0]?.rating).toBe(4.9);
    expect(paginateCatalog(publicProducts, { sort: "price-asc" }).items[0]?.price).toBe(64000);
    expect(paginateCatalog(publicProducts, { sort: "price-desc" }).items[0]?.price).toBe(649000);
  });
});
