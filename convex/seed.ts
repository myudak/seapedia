import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { authComponent, createAuth } from "./auth";
import { publicProducts } from "../src/lib/seed/public-products";
import type { Role } from "./validators";

const DAY = 86_400_000;

const accounts: Array<{
  username: string;
  displayName: string;
  email: string;
  roles: Role[];
}> = [
  { username: "admin", displayName: "Admin Raya", email: "admin@seapedia.test", roles: ["Admin"] },
  { username: "maya", displayName: "Maya Multirole", email: "maya@seapedia.test", roles: ["Buyer", "Seller", "Driver"] },
  { username: "seller", displayName: "Bima Seller", email: "seller@seapedia.test", roles: ["Seller"] },
  { username: "buyer", displayName: "Nadia Buyer", email: "buyer@seapedia.test", roles: ["Buyer"] },
  { username: "driver", displayName: "Rafi Driver", email: "driver@seapedia.test", roles: ["Driver"] },
];

export const seed = internalMutation({
  args: {},
  returns: v.object({
    accounts: v.number(),
    stores: v.number(),
    products: v.number(),
  }),
  handler: async (ctx) => {
    const password = process.env.SEED_ACCOUNT_PASSWORD;
    if (!password || password.length < 8) {
      throw new Error("SEED_ACCOUNT_PASSWORD must contain at least 8 characters.");
    }

    const now = Date.now();
    const { auth } = await authComponent.getAuth(createAuth, ctx);
    const profileIds = new Map<string, string>();

    for (const account of accounts) {
      let profile = await ctx.db
        .query("profiles")
        .withIndex("by_username", (q) => q.eq("username", account.username))
        .unique();

      if (!profile) {
        const result = await auth.api.signUpEmail({
          body: {
            email: account.email,
            name: account.displayName,
            password,
            username: account.username,
            displayUsername: account.username,
          },
        });
        const authUserId = result.user.id;
        const profileId = await ctx.db.insert("profiles", {
          authUserId,
          username: account.username,
          displayName: account.displayName,
          roles: account.roles,
          createdAt: now,
          updatedAt: now,
        });
        profile = await ctx.db.get("profiles", profileId);
      } else {
        await ctx.db.patch("profiles", profile._id, {
          displayName: account.displayName,
          roles: account.roles,
          updatedAt: now,
        });
      }

      if (!profile) throw new Error(`Could not seed ${account.username}.`);
      profileIds.set(account.username, profile.authUserId);
    }

    const storeSeeds = [
      {
        owner: "seller",
        name: "Pasar Pagi Studio",
        slug: "pasar-pagi-studio",
        description: "Curated Indonesian fashion, homeware, and everyday essentials.",
      },
      {
        owner: "maya",
        name: "Kedai Timur",
        slug: "kedai-timur",
        description: "Thoughtful food gifts, desk goods, and practical technology accessories.",
      },
    ];
    const storeIds = new Map<string, Id<"stores">>();

    for (const storeSeed of storeSeeds) {
      const sellerId = profileIds.get(storeSeed.owner);
      if (!sellerId) throw new Error(`Missing seller ${storeSeed.owner}.`);
      const existing = await ctx.db
        .query("stores")
        .withIndex("by_slug", (q) => q.eq("slug", storeSeed.slug))
        .unique();
      if (existing) {
        await ctx.db.patch("stores", existing._id, {
          sellerId,
          name: storeSeed.name,
          description: storeSeed.description,
          updatedAt: now,
        });
        storeIds.set(storeSeed.slug, existing._id);
      } else {
        storeIds.set(
          storeSeed.slug,
          await ctx.db.insert("stores", {
            sellerId,
            name: storeSeed.name,
            slug: storeSeed.slug,
            description: storeSeed.description,
            createdAt: now,
            updatedAt: now,
          }),
        );
      }
    }

    for (const [index, product] of publicProducts.entries()) {
      const storeSlug = index % 2 === 0 ? "pasar-pagi-studio" : "kedai-timur";
      const storeId = storeIds.get(storeSlug);
      const sellerId = profileIds.get(index % 2 === 0 ? "seller" : "maya");
      if (!storeId || !sellerId) throw new Error(`Missing ownership for ${product.id}.`);
      const values = {
        storeId,
        sellerId,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        galleryImages: product.galleryImages,
        category: product.category as "Fashion" | "Food" | "Home" | "Gadget",
        rating: product.rating,
        soldCount: product.soldCount,
        discountLabel: product.discountLabel,
        featured: Boolean(product.featured),
        updatedAt: now,
      };
      const existing = await ctx.db
        .query("products")
        .withIndex("by_public_id", (q) => q.eq("publicId", product.id))
        .unique();
      if (existing) {
        await ctx.db.patch("products", existing._id, values);
      } else {
        await ctx.db.insert("products", { publicId: product.id, ...values, createdAt: now });
      }
    }

    for (const [username, balance] of [["buyer", 650_000], ["maya", 850_000]] as const) {
      const buyerId = profileIds.get(username);
      if (!buyerId) continue;
      const wallet = await ctx.db
        .query("wallets")
        .withIndex("by_buyer", (q) => q.eq("buyerId", buyerId))
        .unique();
      if (wallet) await ctx.db.patch("wallets", wallet._id, { balance, updatedAt: now });
      else await ctx.db.insert("wallets", { buyerId, balance, updatedAt: now });
    }

    const buyerId = profileIds.get("buyer");
    if (buyerId) {
      const address = await ctx.db
        .query("addresses")
        .withIndex("by_buyer", (q) => q.eq("buyerId", buyerId))
        .first();
      if (!address) {
        await ctx.db.insert("addresses", {
          buyerId,
          label: "Home",
          recipient: "Nadia Buyer",
          phone: "081234567890",
          fullAddress: "Jl. Merdeka No. 18, Jakarta",
          isDefault: true,
          createdAt: now,
        });
      }
    }

    if ((await ctx.db.query("appReviews").take(1)).length === 0) {
      await ctx.db.insert("appReviews", { reviewerName: "Dina", rating: 5, comment: "Role flow is clear, and the marketplace feels ready for launch.", createdAt: now - DAY });
      await ctx.db.insert("appReviews", { reviewerName: "Raka", rating: 4, comment: "Catalog is easy to scan even before logging in.", createdAt: now - DAY / 2 });
    }

    const voucher = await ctx.db.query("vouchers").withIndex("by_code", (q) => q.eq("code", "HEMAT12")).unique();
    if (!voucher) await ctx.db.insert("vouchers", { code: "HEMAT12", percentOff: 12, remainingUsage: 10, expiresAt: now + 7 * DAY, createdAt: now });
    const promo = await ctx.db.query("promos").withIndex("by_code", (q) => q.eq("code", "ONGKIR8K")).unique();
    if (!promo) await ctx.db.insert("promos", { code: "ONGKIR8K", amountOff: 8000, expiresAt: now + 5 * DAY, createdAt: now });
    const setting = await ctx.db.query("systemSettings").withIndex("by_key", (q) => q.eq("key", "systemTime")).unique();
    if (!setting) await ctx.db.insert("systemSettings", { key: "systemTime", value: String(now), updatedAt: now });

    return { accounts: accounts.length, stores: storeSeeds.length, products: publicProducts.length };
  },
});
