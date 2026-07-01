import betterAuthTest from "@convex-dev/better-auth/test";
import { convexTest } from "convex-test";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

export function createConvexTest() {
  const testBackend = convexTest({
    schema,
    modules,
    transactionLimits: true,
  });
  betterAuthTest.register(testBackend);
  return testBackend;
}

export function testIdentity(
  subject: string,
  sessionId = `session-${subject}`,
) {
  return {
    subject,
    issuer: "https://seapedia.test",
    tokenIdentifier: `test|${subject}`,
    email: `${subject}@seapedia.test`,
    sessionId,
  };
}

export async function seedMarketplaceFixture(
  backend: ReturnType<typeof createConvexTest>,
) {
  const now = Date.UTC(2026, 0, 15, 8);

  return await backend.run(async (ctx) => {
    const profiles = [
      ["buyer-1", "buyer", "Buyer Test", ["Buyer"]],
      ["seller-1", "seller", "Seller Test", ["Seller"]],
      ["seller-2", "seller-two", "Seller Two", ["Seller"]],
      ["driver-1", "driver", "Driver Test", ["Driver"]],
      ["driver-2", "driver-two", "Driver Two", ["Driver"]],
      ["admin-1", "admin", "Admin Test", ["Admin"]],
      ["maya-1", "maya", "Maya Multirole", ["Buyer", "Seller", "Driver"]],
    ] as const;

    for (const [authUserId, username, displayName, roles] of profiles) {
      await ctx.db.insert("profiles", {
        authUserId,
        username,
        displayName,
        roles: [...roles],
        createdAt: now,
        updatedAt: now,
      });
    }

    const storeOneId = await ctx.db.insert("stores", {
      sellerId: "seller-1",
      name: "Pasar Pagi Studio",
      slug: "pasar-pagi-studio",
      description: "Seller one fixture store.",
      createdAt: now,
      updatedAt: now,
    });
    const storeTwoId = await ctx.db.insert("stores", {
      sellerId: "seller-2",
      name: "Kedai Timur",
      slug: "kedai-timur",
      description: "Seller two fixture store.",
      createdAt: now,
      updatedAt: now,
    });

    const productOneId = await insertProduct(ctx, {
      publicId: "prd-test-tote",
      storeId: storeOneId,
      sellerId: "seller-1",
      name: "Test Market Tote",
      price: 100_000,
      stock: 8,
      category: "Fashion",
      rating: 4.8,
      soldCount: 20,
      featured: true,
      now,
    });
    const productTwoId = await insertProduct(ctx, {
      publicId: "prd-test-shirt",
      storeId: storeOneId,
      sellerId: "seller-1",
      name: "Test Linen Shirt",
      price: 150_000,
      stock: 6,
      category: "Fashion",
      rating: 4.5,
      soldCount: 8,
      featured: false,
      now,
    });
    const otherStoreProductId = await insertProduct(ctx, {
      publicId: "prd-test-coffee",
      storeId: storeTwoId,
      sellerId: "seller-2",
      name: "Test Coffee Set",
      price: 120_000,
      stock: 10,
      category: "Food",
      rating: 4.7,
      soldCount: 12,
      featured: true,
      now,
    });

    const walletId = await ctx.db.insert("wallets", {
      buyerId: "buyer-1",
      balance: 1_000_000,
      updatedAt: now,
    });
    const addressId = await ctx.db.insert("addresses", {
      buyerId: "buyer-1",
      label: "Home",
      recipient: "Buyer Test",
      phone: "081234567890",
      fullAddress: "Jl. Test No. 18, Jakarta",
      isDefault: true,
      createdAt: now,
    });
    const voucherId = await ctx.db.insert("vouchers", {
      code: "TEST10",
      percentOff: 10,
      remainingUsage: 3,
      expiresAt: now + 7 * 86_400_000,
      createdAt: now,
    });
    await ctx.db.insert("promos", {
      code: "LESS8K",
      amountOff: 8_000,
      expiresAt: now + 7 * 86_400_000,
      createdAt: now,
    });
    await ctx.db.insert("systemSettings", {
      key: "systemTime",
      value: String(now),
      updatedAt: now,
    });

    return {
      now,
      storeOneId,
      storeTwoId,
      productOneId,
      productTwoId,
      otherStoreProductId,
      walletId,
      addressId,
      voucherId,
    };
  });
}

type FixtureCtx = Parameters<
  Parameters<ReturnType<typeof createConvexTest>["run"]>[0]
>[0];

async function insertProduct(
  ctx: FixtureCtx,
  input: {
    publicId: string;
    storeId: Id<"stores">;
    sellerId: string;
    name: string;
    price: number;
    stock: number;
    category: "Fashion" | "Food" | "Home" | "Gadget";
    rating: number;
    soldCount: number;
    featured: boolean;
    now: number;
  },
) {
  const imageUrl = "/assets/products/catalog/canvas-commuter-backpack.webp";
  return await ctx.db.insert("products", {
    publicId: input.publicId,
    storeId: input.storeId,
    sellerId: input.sellerId,
    name: input.name,
    description: `${input.name} fixture description.`,
    price: input.price,
    stock: input.stock,
    imageUrl,
    galleryImages: [imageUrl],
    category: input.category,
    rating: input.rating,
    soldCount: input.soldCount,
    featured: input.featured,
    createdAt: input.now,
    updatedAt: input.now,
  });
}
