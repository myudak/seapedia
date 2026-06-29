import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { requireActiveRole } from "./model/auth";
import { deliveryMethodValidator, orderStatusValidator } from "./validators";
import { calculateCheckoutSummary } from "../src/lib/domain/commerce";

const DAY = 86_400_000;
const cartItemResult = v.object({ id: v.string(), productId: v.string(), storeId: v.string(), productName: v.string(), price: v.number(), quantity: v.number(), lineTotal: v.number() });
const cartResult = v.object({ storeId: v.optional(v.string()), storeName: v.optional(v.string()), items: v.array(cartItemResult), subtotal: v.number() });
const summaryResult = v.object({
  subtotal: v.number(), discount: v.number(), deliveryFee: v.number(), ppn: v.number(), total: v.number(),
  deliveryMethod: deliveryMethodValidator, discountCode: v.optional(v.string()), discountType: v.optional(v.union(v.literal("Voucher"), v.literal("Promo"))),
});
const orderResult = v.object({
  id: v.string(), buyerId: v.string(), sellerId: v.string(), storeId: v.string(), storeName: v.string(),
  addressId: v.string(), items: v.array(v.object({ productId: v.string(), productName: v.string(), price: v.number(), quantity: v.number(), lineTotal: v.number() })),
  deliveryMethod: deliveryMethodValidator, status: orderStatusValidator,
  subtotal: v.number(), discount: v.number(), deliveryFee: v.number(), ppn: v.number(), total: v.number(),
  discountCode: v.optional(v.string()), discountType: v.optional(v.union(v.literal("Voucher"), v.literal("Promo"))),
  dueAt: v.number(), createdAt: v.number(),
});

async function systemNow(ctx: QueryCtx | MutationCtx) {
  const setting = await ctx.db.query("systemSettings").withIndex("by_key", (q) => q.eq("key", "systemTime")).unique();
  const value = Number(setting?.value);
  return Number.isFinite(value) ? value : Date.now();
}

async function loadCart(ctx: QueryCtx | MutationCtx, buyerId: string) {
  const rows = await ctx.db.query("cartItems").withIndex("by_buyer", (q) => q.eq("buyerId", buyerId)).collect();
  if (rows.length === 0) throw new ConvexError({ code: "EMPTY_CART", message: "Cart is empty." });
  const products = await Promise.all(rows.map((row) => ctx.db.get("products", row.productId)));
  if (products.some((product) => product === null)) throw new ConvexError({ code: "PRODUCT_UNAVAILABLE", message: "Cart product is no longer available." });
  if (rows.some((row) => row.storeId !== rows[0].storeId)) throw new ConvexError({ code: "CROSS_STORE_CART", message: "Cart can only contain products from one store." });
  const store = await ctx.db.get("stores", rows[0].storeId);
  if (!store) throw new ConvexError({ code: "STORE_UNAVAILABLE", message: "Cart store is no longer available." });
  const items = rows.map((row, index) => ({ row, product: products[index]! }));
  return { rows, items, store, subtotal: items.reduce((sum, item) => sum + item.product.price * item.row.quantity, 0) };
}

async function resolveDiscount(ctx: QueryCtx | MutationCtx, codeValue: string | undefined, subtotal: number) {
  if (!codeValue?.trim()) return { amount: 0 };
  const code = codeValue.trim().toUpperCase();
  const now = await systemNow(ctx);
  const voucher = await ctx.db.query("vouchers").withIndex("by_code", (q) => q.eq("code", code)).unique();
  if (voucher) {
    if (voucher.expiresAt <= now) throw new ConvexError({ code: "EXPIRED_VOUCHER", message: "Voucher is expired." });
    if (voucher.remainingUsage <= 0) throw new ConvexError({ code: "DEPLETED_VOUCHER", message: "Voucher has no remaining usage." });
    return { amount: Math.round(subtotal * (voucher.percentOff / 100)), code, type: "Voucher" as const, voucher };
  }
  const promo = await ctx.db.query("promos").withIndex("by_code", (q) => q.eq("code", code)).unique();
  if (promo) {
    if (promo.expiresAt <= now) throw new ConvexError({ code: "EXPIRED_PROMO", message: "Promo is expired." });
    return { amount: Math.min(promo.amountOff, subtotal), code, type: "Promo" as const };
  }
  throw new ConvexError({ code: "DISCOUNT_NOT_FOUND", message: "Discount code not found." });
}

function publicCart(cart: Awaited<ReturnType<typeof loadCart>>) {
  const items = cart.items.map(({ row, product }) => ({ id: row._id, productId: product.publicId, storeId: row.storeId, productName: product.name, price: product.price, quantity: row.quantity, lineTotal: product.price * row.quantity }));
  return { storeId: cart.store._id, storeName: cart.store.name, items, subtotal: cart.subtotal };
}

export const preview = query({
  args: { deliveryMethod: deliveryMethodValidator, discountCode: v.optional(v.string()) },
  returns: v.object({ cart: cartResult, summary: summaryResult }),
  handler: async (ctx, args) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    const cart = await loadCart(ctx, profile.authUserId);
    const discount = await resolveDiscount(ctx, args.discountCode, cart.subtotal);
    const summary = calculateCheckoutSummary({ subtotal: cart.subtotal, deliveryMethod: args.deliveryMethod, discount: discount.amount, discountCode: discount.code, discountType: discount.type });
    return { cart: publicCart(cart), summary };
  },
});

export const placeOrder = mutation({
  args: { deliveryMethod: deliveryMethodValidator, discountCode: v.optional(v.string()), addressId: v.id("addresses") },
  returns: orderResult,
  handler: async (ctx, args) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    const [cart, address, wallet] = await Promise.all([
      loadCart(ctx, profile.authUserId),
      ctx.db.get("addresses", args.addressId),
      ctx.db.query("wallets").withIndex("by_buyer", (q) => q.eq("buyerId", profile.authUserId)).unique(),
    ]);
    if (!address || address.buyerId !== profile.authUserId) throw new ConvexError({ code: "ADDRESS_REQUIRED", message: "Select a valid delivery address." });
    const discount = await resolveDiscount(ctx, args.discountCode, cart.subtotal);
    const summary = calculateCheckoutSummary({ subtotal: cart.subtotal, deliveryMethod: args.deliveryMethod, discount: discount.amount, discountCode: discount.code, discountType: discount.type });
    const unavailable = cart.items.find(({ row, product }) => row.quantity > product.stock);
    if (unavailable) throw new ConvexError({ code: "OUT_OF_STOCK", message: `Insufficient stock for ${unavailable.product.name}.` });
    if (!wallet || wallet.balance < summary.total) throw new ConvexError({ code: "INSUFFICIENT_BALANCE", message: "Insufficient wallet balance." });

    const now = await systemNow(ctx);
    const dueAt = now + (args.deliveryMethod === "Instant" ? 6 * 60 * 60 * 1000 : args.deliveryMethod === "Next Day" ? DAY : 3 * DAY);
    await Promise.all(cart.items.map(({ row, product }) => ctx.db.patch("products", product._id, { stock: product.stock - row.quantity, soldCount: product.soldCount + row.quantity, updatedAt: now })));
    await ctx.db.patch("wallets", wallet._id, { balance: wallet.balance - summary.total, updatedAt: now });
    await ctx.db.insert("walletTransactions", { buyerId: profile.authUserId, type: "checkout", amount: -summary.total, note: "Checkout payment", createdAt: now });
    if (discount.type === "Voucher" && discount.voucher) await ctx.db.patch("vouchers", discount.voucher._id, { remainingUsage: discount.voucher.remainingUsage - 1 });

    const orderItems = cart.items.map(({ row, product }) => ({ productId: product._id, publicId: product.publicId, productName: product.name, price: product.price, quantity: row.quantity, lineTotal: product.price * row.quantity }));
    const orderId = await ctx.db.insert("orders", { buyerId: profile.authUserId, sellerId: cart.store.sellerId, storeId: cart.store._id, storeName: cart.store.name, addressId: address._id, items: orderItems, status: "Sedang Dikemas", ...summary, dueAt, createdAt: now });
    await ctx.db.insert("orderStatusHistory", { orderId, status: "Sedang Dikemas", note: "Order created after buyer checkout.", createdAt: now });
    await Promise.all(cart.rows.map((row) => ctx.db.delete("cartItems", row._id)));
    return { id: orderId, buyerId: profile.authUserId, sellerId: cart.store.sellerId, storeId: cart.store._id, storeName: cart.store.name, addressId: address._id, items: orderItems.map((item) => ({ productId: item.publicId, productName: item.productName, price: item.price, quantity: item.quantity, lineTotal: item.lineTotal })), status: "Sedang Dikemas" as const, ...summary, dueAt, createdAt: now };
  },
});
