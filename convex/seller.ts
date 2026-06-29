import { nanoid } from "nanoid";
import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { requireActiveRole } from "./model/auth";
import { categoryValidator } from "./validators";

const storeResult = v.object({
  id: v.string(),
  name: v.string(),
  slug: v.string(),
  description: v.string(),
});

const productResult = v.object({
  id: v.string(),
  name: v.string(),
  description: v.string(),
  price: v.number(),
  stock: v.number(),
  imageUrl: v.string(),
  category: categoryValidator,
  storeName: v.string(),
});

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

async function sellerStore(ctx: QueryCtx | MutationCtx, sellerId: string) {
  return await ctx.db
    .query("stores")
    .withIndex("by_seller", (q) => q.eq("sellerId", sellerId))
    .unique();
}

export const getStore = query({
  args: {},
  returns: v.union(storeResult, v.null()),
  handler: async (ctx) => {
    const { profile } = await requireActiveRole(ctx, "Seller");
    const store = await sellerStore(ctx, profile.authUserId);
    return store
      ? { id: store._id, name: store.name, slug: store.slug, description: store.description }
      : null;
  },
});

export const upsertStore = mutation({
  args: { name: v.string(), description: v.string() },
  returns: storeResult,
  handler: async (ctx, args) => {
    const { profile } = await requireActiveRole(ctx, "Seller");
    const name = args.name.trim();
    const description = args.description.trim();
    const slug = slugify(name);
    if (!slug) throw new ConvexError({ code: "INVALID_STORE", message: "Store name is invalid." });

    const conflict = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    const current = await sellerStore(ctx, profile.authUserId);
    if (conflict && conflict._id !== current?._id) {
      throw new ConvexError({ code: "STORE_EXISTS", message: "Store name is already in use." });
    }

    const now = Date.now();
    if (current) {
      await ctx.db.patch("stores", current._id, { name, slug, description, updatedAt: now });
      return { id: current._id, name, slug, description };
    }

    const id = await ctx.db.insert("stores", {
      sellerId: profile.authUserId,
      name,
      slug,
      description,
      createdAt: now,
      updatedAt: now,
    });
    return { id, name, slug, description };
  },
});

export const listProducts = query({
  args: {},
  returns: v.array(productResult),
  handler: async (ctx) => {
    const { profile } = await requireActiveRole(ctx, "Seller");
    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", profile.authUserId))
      .collect();
    const store = await sellerStore(ctx, profile.authUserId);
    return products.map((product) => ({
      id: product.publicId,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      category: product.category,
      storeName: store?.name ?? "Seller store",
    }));
  },
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(),
    imageUrl: v.optional(v.string()),
    category: v.optional(categoryValidator),
  },
  returns: productResult,
  handler: async (ctx, args) => {
    const { profile } = await requireActiveRole(ctx, "Seller");
    const store = await sellerStore(ctx, profile.authUserId);
    if (!store) throw new ConvexError({ code: "STORE_REQUIRED", message: "Create a store before adding products." });

    const publicId = `prd-${nanoid(12)}`;
    const imageUrl = args.imageUrl?.trim() || "/assets/products/catalog/canvas-commuter-backpack.webp";
    const category = args.category ?? "Home";
    const now = Date.now();
    await ctx.db.insert("products", {
      publicId,
      storeId: store._id,
      sellerId: profile.authUserId,
      name: args.name.trim(),
      description: args.description.trim(),
      price: args.price,
      stock: args.stock,
      imageUrl,
      galleryImages: [imageUrl],
      category,
      rating: 0,
      soldCount: 0,
      featured: false,
      createdAt: now,
      updatedAt: now,
    });
    return { id: publicId, name: args.name.trim(), description: args.description.trim(), price: args.price, stock: args.stock, imageUrl, category, storeName: store.name };
  },
});

export const updateProduct = mutation({
  args: {
    publicId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    stock: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    category: v.optional(categoryValidator),
  },
  returns: productResult,
  handler: async (ctx, args) => {
    const { profile } = await requireActiveRole(ctx, "Seller");
    const product = await ctx.db.query("products").withIndex("by_public_id", (q) => q.eq("publicId", args.publicId)).unique();
    if (!product || product.sellerId !== profile.authUserId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Product does not belong to the active seller." });
    }
    const { publicId: _publicId, ...changes } = args;
    const clean = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
    await ctx.db.patch("products", product._id, { ...clean, updatedAt: Date.now() });
    const updated = await ctx.db.get("products", product._id);
    const store = await ctx.db.get("stores", product.storeId);
    if (!updated || !store) throw new ConvexError({ code: "NOT_FOUND", message: "Product could not be loaded." });
    return { id: updated.publicId, name: updated.name, description: updated.description, price: updated.price, stock: updated.stock, imageUrl: updated.imageUrl, category: updated.category, storeName: store.name };
  },
});

export const deleteProduct = mutation({
  args: { publicId: v.string() },
  returns: v.object({ id: v.string(), deleted: v.boolean() }),
  handler: async (ctx, { publicId }) => {
    const { profile } = await requireActiveRole(ctx, "Seller");
    const product = await ctx.db.query("products").withIndex("by_public_id", (q) => q.eq("publicId", publicId)).unique();
    if (!product || product.sellerId !== profile.authUserId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Product does not belong to the active seller." });
    }
    const cartItems = await ctx.db.query("cartItems").withIndex("by_product", (q) => q.eq("productId", product._id)).collect();
    await Promise.all(cartItems.map((item) => ctx.db.delete("cartItems", item._id)));
    await ctx.db.delete("products", product._id);
    return { id: publicId, deleted: true };
  },
});
