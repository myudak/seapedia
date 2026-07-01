import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import {
  createConvexTest,
  seedMarketplaceFixture,
  testIdentity,
} from "./test.setup";

const buyerIdentity = testIdentity("buyer-1");
const sellerIdentity = testIdentity("seller-1");
const sellerTwoIdentity = testIdentity("seller-2");
const driverIdentity = testIdentity("driver-1");
const driverTwoIdentity = testIdentity("driver-2");
const adminIdentity = testIdentity("admin-1");

async function placeOrder(
  backend: ReturnType<typeof createConvexTest>,
  addressId: Id<"addresses">,
  deliveryMethod: "Instant" | "Next Day" | "Regular" = "Regular",
  discountCode?: string,
) {
  const buyer = backend.withIdentity(buyerIdentity);
  await buyer.mutation(api.buyer.addCartItem, {
    productId: "prd-test-tote",
    quantity: 2,
  });
  return await buyer.mutation(api.checkout.placeOrder, {
    addressId,
    deliveryMethod,
    discountCode,
  });
}

describe("public Convex catalog and reviews", () => {
  it("paginates, filters, sorts, and resolves stable product ids", async () => {
    const backend = createConvexTest();
    await seedMarketplaceFixture(backend);

    const page = await backend.query(api.catalog.list, {
      category: "Fashion",
      sort: "price-desc",
      page: 1,
    });
    const product = await backend.query(api.catalog.getByPublicId, {
      publicId: "prd-test-tote",
    });
    const hostileSearch = await backend.query(api.catalog.list, {
      q: "' OR 1=1 --",
    });

    expect(page.items.map((item) => item.id)).toEqual([
      "prd-test-shirt",
      "prd-test-tote",
    ]);
    expect(product).toMatchObject({
      id: "prd-test-tote",
      storeName: "Pasar Pagi Studio",
    });
    expect(hostileSearch.total).toBe(0);
  });

  it("validates reviews and relies on React text escaping for XSS safety", async () => {
    const backend = createConvexTest();
    const payload = "<script>globalThis.pwned = true</script>";
    const review = await backend.mutation(api.reviews.create, {
      reviewerName: "Mallory",
      rating: 1,
      comment: payload,
    });
    const markup = renderToStaticMarkup(createElement("p", null, review.comment));

    expect(review.comment).toBe(payload);
    expect(markup).toContain("&lt;script&gt;");
    expect(markup).not.toContain("<script>");
    await expect(
      backend.mutation(api.reviews.create, {
        reviewerName: "M",
        rating: 8,
        comment: "x",
      }),
    ).rejects.toThrow("Invalid review payload");
  });
});

describe("active roles and seller ownership", () => {
  it("requires a session role for a multi-role account", async () => {
    const backend = createConvexTest();
    await seedMarketplaceFixture(backend);
    const identity = testIdentity("maya-1", "maya-session");
    const maya = backend.withIdentity(identity);

    const initialProfile = await maya.query(api.profiles.getProfile, {});
    expect(initialProfile?.activeRole).toBeUndefined();
    expect(initialProfile?.needsRoleSelection).toBe(true);
    const selected = await maya.mutation(api.profiles.setActiveRole, {
      role: "Seller",
    });
    expect(selected.activeRole).toBe("Seller");
    await expect(
      maya.mutation(api.profiles.setActiveRole, { role: "Admin" }),
    ).rejects.toThrow("Role is not owned");
  });

  it("enforces unique stores and product ownership", async () => {
    const backend = createConvexTest();
    await seedMarketplaceFixture(backend);
    const seller = backend.withIdentity(sellerIdentity);
    const otherSeller = backend.withIdentity(sellerTwoIdentity);

    await expect(
      otherSeller.mutation(api.seller.upsertStore, {
        name: "Pasar Pagi Studio",
        description: "Conflicting store name.",
      }),
    ).rejects.toThrow("already in use");
    await expect(
      otherSeller.mutation(api.seller.updateProduct, {
        publicId: "prd-test-tote",
        stock: 99,
      }),
    ).rejects.toThrow("does not belong");

    const created = await seller.mutation(api.seller.createProduct, {
      name: "Seller Test Product",
      description: "A product created through the real seller mutation.",
      price: 75_000,
      stock: 4,
      category: "Home",
    });
    const updated = await seller.mutation(api.seller.updateProduct, {
      publicId: created.id,
      stock: 7,
    });
    expect(updated.stock).toBe(7);
    expect(
      await seller.mutation(api.seller.deleteProduct, {
        publicId: created.id,
      }),
    ).toEqual({ id: created.id, deleted: true });
  });
});

describe("buyer cart, wallet, and atomic checkout", () => {
  it("manages wallet, addresses, cart quantities, and single-store conflicts", async () => {
    const backend = createConvexTest();
    await seedMarketplaceFixture(backend);
    const buyer = backend.withIdentity(buyerIdentity);

    const topUp = await buyer.mutation(api.buyer.topUpWallet, { amount: 50_000 });
    expect(topUp.wallet.balance).toBe(1_050_000);
    const address = await buyer.mutation(api.buyer.createAddress, {
      label: "Office",
      recipient: "Buyer Test",
      phone: "081298765432",
      fullAddress: "Jl. Office No. 2, Jakarta",
      isDefault: true,
    });
    expect(address.isDefault).toBe(true);

    const cart = await buyer.mutation(api.buyer.addCartItem, {
      productId: "prd-test-tote",
      quantity: 1,
    });
    const itemId = cart.items[0].id as Id<"cartItems">;
    expect(
      await buyer.mutation(api.buyer.updateCartItem, {
        cartItemId: itemId,
        quantity: 3,
      }),
    ).toMatchObject({ subtotal: 300_000 });
    await expect(
      buyer.mutation(api.buyer.addCartItem, {
        productId: "prd-test-coffee",
        quantity: 1,
      }),
    ).rejects.toThrow("one store");
    expect(
      await buyer.mutation(api.buyer.removeCartItem, { cartItemId: itemId }),
    ).toMatchObject({ items: [], subtotal: 0 });
  });

  it("atomically debits wallet, decrements stock, consumes voucher, and clears cart", async () => {
    const backend = createConvexTest();
    const fixture = await seedMarketplaceFixture(backend);
    const buyer = backend.withIdentity(buyerIdentity);
    await buyer.mutation(api.buyer.addCartItem, {
      productId: "prd-test-tote",
      quantity: 2,
    });

    const preview = await buyer.query(api.checkout.preview, {
      deliveryMethod: "Regular",
      discountCode: "TEST10",
    });
    expect(preview.summary).toMatchObject({
      subtotal: 200_000,
      discount: 20_000,
      deliveryFee: 8_000,
      ppn: 21_600,
      total: 209_600,
      discountType: "Voucher",
    });

    const order = await buyer.mutation(api.checkout.placeOrder, {
      addressId: fixture.addressId,
      deliveryMethod: "Regular",
      discountCode: "TEST10",
    });
    expect(order.status).toBe("Sedang Dikemas");

    const snapshot = await backend.run(async (ctx) => ({
      wallet: await ctx.db.get("wallets", fixture.walletId),
      product: await ctx.db.get("products", fixture.productOneId),
      voucher: await ctx.db.get("vouchers", fixture.voucherId),
      cart: await ctx.db.query("cartItems").collect(),
      history: await ctx.db.query("orderStatusHistory").collect(),
    }));
    expect(snapshot.wallet?.balance).toBe(790_400);
    expect(snapshot.product?.stock).toBe(6);
    expect(snapshot.voucher?.remainingUsage).toBe(2);
    expect(snapshot.cart).toHaveLength(0);
    expect(snapshot.history).toHaveLength(1);
  });

  it("rolls back every write when checkout balance validation fails", async () => {
    const backend = createConvexTest();
    const fixture = await seedMarketplaceFixture(backend);
    const buyer = backend.withIdentity(buyerIdentity);
    await buyer.mutation(api.buyer.addCartItem, {
      productId: "prd-test-tote",
      quantity: 2,
    });
    await backend.run(async (ctx) => {
      await ctx.db.patch("wallets", fixture.walletId, { balance: 1 });
    });

    await expect(
      buyer.mutation(api.checkout.placeOrder, {
        addressId: fixture.addressId,
        deliveryMethod: "Regular",
      }),
    ).rejects.toThrow("Insufficient wallet balance");
    const snapshot = await backend.run(async (ctx) => ({
      product: await ctx.db.get("products", fixture.productOneId),
      wallet: await ctx.db.get("wallets", fixture.walletId),
      cart: await ctx.db.query("cartItems").collect(),
      orders: await ctx.db.query("orders").collect(),
    }));
    expect(snapshot.product?.stock).toBe(8);
    expect(snapshot.wallet?.balance).toBe(1);
    expect(snapshot.cart).toHaveLength(1);
    expect(snapshot.orders).toHaveLength(0);
  });
});

describe("seller, driver, and overdue lifecycle", () => {
  it("processes, claims, and completes an order with one active driver", async () => {
    const backend = createConvexTest();
    const fixture = await seedMarketplaceFixture(backend);
    const order = await placeOrder(backend, fixture.addressId);
    const seller = backend.withIdentity(sellerIdentity);

    const processed = await seller.mutation(api.orders.processSellerOrder, {
      orderId: order.id as Id<"orders">,
    });
    expect(processed.status).toBe("Menunggu Pengirim");

    const driver = backend.withIdentity(driverIdentity);
    const jobs = await driver.query(api.orders.listAvailableJobs, {});
    expect(jobs).toHaveLength(1);
    const jobId = jobs[0].id as Id<"deliveryJobs">;
    const claimed = await driver.mutation(api.orders.takeJob, { jobId });
    expect(claimed.order?.status).toBe("Sedang Dikirim");
    await expect(
      backend
        .withIdentity(driverTwoIdentity)
        .mutation(api.orders.takeJob, { jobId }),
    ).rejects.toThrow("already taken");

    const completed = await driver.mutation(api.orders.completeJob, { jobId });
    expect(completed).toMatchObject({
      status: "completed",
      order: { status: "Pesanan Selesai" },
      earning: 6_400,
    });
    expect(await driver.query(api.orders.driverHistory, {})).toMatchObject({
      activeJob: null,
      earnings: 6_400,
    });
  });

  it("refunds and restores an overdue order exactly once", async () => {
    const backend = createConvexTest();
    const fixture = await seedMarketplaceFixture(backend);
    const order = await placeOrder(backend, fixture.addressId, "Instant");
    const admin = backend.withIdentity(adminIdentity);
    await admin.mutation(api.admin.advanceTime, { days: 1 });

    expect(await admin.query(api.admin.listOverdue, {})).toHaveLength(1);
    expect(await admin.mutation(api.admin.handleOverdue, {})).toHaveLength(1);
    expect(await admin.mutation(api.admin.handleOverdue, {})).toHaveLength(0);

    const snapshot = await backend.run(async (ctx) => ({
      order: await ctx.db.get("orders", order.id as Id<"orders">),
      wallet: await ctx.db.get("wallets", fixture.walletId),
      product: await ctx.db.get("products", fixture.productOneId),
      refunds: await ctx.db
        .query("walletTransactions")
        .withIndex("by_buyer", (query) => query.eq("buyerId", "buyer-1"))
        .collect(),
    }));
    expect(snapshot.order?.status).toBe("Dikembalikan");
    expect(snapshot.wallet?.balance).toBe(1_000_000);
    expect(snapshot.product?.stock).toBe(8);
    expect(snapshot.refunds.filter((row) => row.type === "refund")).toHaveLength(1);

    const report = await backend
      .withIdentity(sellerIdentity)
      .query(api.orders.sellerReport, {});
    expect(report.income).toBe(0);
  });

  it("restricts monitoring and discount management to admins", async () => {
    const backend = createConvexTest();
    const fixture = await seedMarketplaceFixture(backend);
    const admin = backend.withIdentity(adminIdentity);

    expect(await admin.query(api.admin.monitoring, {})).toMatchObject({
      users: 7,
      stores: 2,
      products: 3,
      orders: 0,
    });
    const voucher = await admin.mutation(api.admin.createVoucher, {
      code: "launch15",
      percentOff: 15,
      remainingUsage: 5,
      expiresAt: fixture.now + 86_400_000,
    });
    expect(voucher.code).toBe("LAUNCH15");
    await expect(
      backend.withIdentity(buyerIdentity).query(api.admin.monitoring, {}),
    ).rejects.toThrow("Admin active role required");
  });
});
