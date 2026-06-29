import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import { catalogSortValidator, categoryValidator } from "./validators";
import { paginateCatalog } from "../src/lib/catalog/catalog";

const productResult = v.object({
  id: v.string(),
  name: v.string(),
  description: v.string(),
  price: v.number(),
  stock: v.number(),
  storeName: v.string(),
  storeSlug: v.string(),
  imageUrl: v.string(),
  galleryImages: v.array(v.string()),
  category: categoryValidator,
  rating: v.number(),
  soldCount: v.number(),
  discountLabel: v.optional(v.string()),
  featured: v.boolean(),
});

const pageResult = v.object({
  items: v.array(productResult),
  total: v.number(),
  page: v.number(),
  pageSize: v.number(),
  totalPages: v.number(),
});

async function hydrateProducts(ctx: QueryCtx) {
  const products = await ctx.db.query("products").take(200);
  const storeIds = [...new Set(products.map((product) => product.storeId))];
  const stores = await Promise.all(storeIds.map((storeId) => ctx.db.get("stores", storeId)));
  const storeById = new Map(stores.filter(Boolean).map((store) => [store!._id, store!]));

  return products.flatMap((product) => {
    const store = storeById.get(product.storeId);
    if (!store) return [];
    return [{
      id: product.publicId,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      storeName: store.name,
      storeSlug: store.slug,
      imageUrl: product.imageUrl,
      galleryImages: product.galleryImages,
      category: product.category,
      rating: product.rating,
      soldCount: product.soldCount,
      discountLabel: product.discountLabel,
      featured: product.featured,
    }];
  });
}

export const list = query({
  args: {
    q: v.optional(v.string()),
    category: v.optional(categoryValidator),
    page: v.optional(v.number()),
    sort: v.optional(catalogSortValidator),
  },
  returns: pageResult,
  handler: async (ctx, args) => paginateCatalog(await hydrateProducts(ctx), args),
});

export const getByPublicId = query({
  args: { publicId: v.string() },
  returns: v.union(productResult, v.null()),
  handler: async (ctx, { publicId }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_public_id", (q) => q.eq("publicId", publicId))
      .unique();
    if (!product) return null;
    const store = await ctx.db.get("stores", product.storeId);
    if (!store) return null;

    return {
      id: product.publicId,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      storeName: store.name,
      storeSlug: store.slug,
      imageUrl: product.imageUrl,
      galleryImages: product.galleryImages,
      category: product.category,
      rating: product.rating,
      soldCount: product.soldCount,
      discountLabel: product.discountLabel,
      featured: product.featured,
    };
  },
});

export const featured = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(productResult),
  handler: async (ctx, { limit }) => {
    const products = await hydrateProducts(ctx);
    return products
      .filter((product) => product.featured)
      .sort((left, right) => right.soldCount - left.soldCount)
      .slice(0, Math.min(Math.max(Math.trunc(limit ?? 4), 1), 12));
  },
});
