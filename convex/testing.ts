import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { publicProducts } from "../src/lib/seed/public-products";

const applicationTables = [
  "sessionRoles",
  "stores",
  "products",
  "appReviews",
  "wallets",
  "walletTransactions",
  "addresses",
  "cartItems",
  "orders",
  "orderStatusHistory",
  "vouchers",
  "promos",
  "deliveryJobs",
  "systemSettings",
] as const;

export const resetForE2E = mutation({
  args: {},
  returns: v.object({
    deleted: v.number(),
    accounts: v.number(),
    stores: v.number(),
    products: v.number(),
  }),
  handler: async (ctx) => {
    const siteUrl = process.env.SITE_URL ?? "";
    if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(siteUrl)) {
      throw new ConvexError({
        code: "LOCAL_ONLY",
        message: "E2E reset is available only for localhost deployments.",
      });
    }

    let deleted = 0;
    for (const table of applicationTables) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) {
        await ctx.db.delete(table, row._id);
        deleted += 1;
      }
    }
    const profiles = await ctx.db.query("profiles").collect();
    const profileByUsername = new Map(
      profiles.map((profile) => [profile.username, profile.authUserId]),
    );
    const sellerId = profileByUsername.get("seller");
    const mayaId = profileByUsername.get("maya");
    const buyerId = profileByUsername.get("buyer");
    if (!sellerId || !mayaId || !buyerId) {
      throw new ConvexError({
        code: "SEED_REQUIRED",
        message: "Run seed:seed once before the E2E suite.",
      });
    }

    const now = Date.now();
    const stores = [
      {
        sellerId,
        name: "Pasar Pagi Studio",
        slug: "pasar-pagi-studio",
        description: "Curated Indonesian fashion, homeware, and everyday essentials.",
      },
      {
        sellerId: mayaId,
        name: "Kedai Timur",
        slug: "kedai-timur",
        description: "Thoughtful food gifts, desk goods, and practical technology accessories.",
      },
    ] as const;
    const storeIds = new Map<string, Id<"stores">>();
    for (const store of stores) {
      storeIds.set(
        store.slug,
        await ctx.db.insert("stores", {
          ...store,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }

    for (const product of publicProducts) {
      const storeId = storeIds.get(product.storeSlug);
      if (!storeId) continue;
      await ctx.db.insert("products", {
        publicId: product.id,
        storeId,
        sellerId:
          product.storeSlug === "pasar-pagi-studio" ? sellerId : mayaId,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        galleryImages: product.galleryImages,
        category: product.category,
        rating: product.rating,
        soldCount: product.soldCount,
        discountLabel: product.discountLabel,
        featured: Boolean(product.featured),
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.insert("wallets", {
      buyerId,
      balance: 650_000,
      updatedAt: now,
    });
    await ctx.db.insert("wallets", {
      buyerId: mayaId,
      balance: 850_000,
      updatedAt: now,
    });
    await ctx.db.insert("addresses", {
      buyerId,
      label: "Home",
      recipient: "Nadia Buyer",
      phone: "081234567890",
      fullAddress: "Jl. Merdeka No. 18, Jakarta",
      isDefault: true,
      createdAt: now,
    });
    await ctx.db.insert("appReviews", {
      reviewerName: "Dina",
      rating: 5,
      comment: "Role flow is clear, and the marketplace feels ready for launch.",
      createdAt: now - 86_400_000,
    });
    await ctx.db.insert("appReviews", {
      reviewerName: "Raka",
      rating: 4,
      comment: "Catalog is easy to scan even before logging in.",
      createdAt: now - 43_200_000,
    });
    await ctx.db.insert("vouchers", {
      code: "HEMAT12",
      percentOff: 12,
      remainingUsage: 10,
      expiresAt: now + 7 * 86_400_000,
      createdAt: now,
    });
    await ctx.db.insert("promos", {
      code: "ONGKIR8K",
      amountOff: 8_000,
      expiresAt: now + 5 * 86_400_000,
      createdAt: now,
    });
    await ctx.db.insert("systemSettings", {
      key: "systemTime",
      value: String(now),
      updatedAt: now,
    });

    return {
      deleted,
      accounts: profiles.length,
      stores: stores.length,
      products: publicProducts.length,
    };
  },
});
