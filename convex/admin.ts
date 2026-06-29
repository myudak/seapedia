import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { requireActiveRole } from "./model/auth";
import { mapOrder, orderResult } from "./model/orders";
import { isOrderRefundable } from "../src/lib/domain/convex-invariants";

const voucherResult = v.object({ id: v.string(), code: v.string(), percentOff: v.number(), remainingUsage: v.number(), expiresAt: v.number(), createdAt: v.number() });
const promoResult = v.object({ id: v.string(), code: v.string(), amountOff: v.number(), expiresAt: v.number(), createdAt: v.number() });

async function currentTime(ctx: QueryCtx | MutationCtx) {
  const setting = await ctx.db.query("systemSettings").withIndex("by_key", (q) => q.eq("key", "systemTime")).unique();
  const value = Number(setting?.value);
  return Number.isFinite(value) ? value : Date.now();
}

async function overdue(ctx: QueryCtx | MutationCtx) {
  const now = await currentTime(ctx);
  const orders = await ctx.db.query("orders").collect();
  return orders.filter((order) => isOrderRefundable(order, now));
}

export const monitoring = query({
  args: {},
  returns: v.object({ users: v.number(), stores: v.number(), products: v.number(), orders: v.number(), vouchers: v.number(), promos: v.number(), deliveryJobs: v.number(), overdueOrders: v.number(), currentTime: v.number() }),
  handler: async (ctx) => {
    await requireActiveRole(ctx, "Admin");
    const [users, stores, products, orders, vouchers, promos, jobs, overdueOrders, now] = await Promise.all([
      ctx.db.query("profiles").collect(), ctx.db.query("stores").collect(), ctx.db.query("products").collect(), ctx.db.query("orders").collect(),
      ctx.db.query("vouchers").collect(), ctx.db.query("promos").collect(), ctx.db.query("deliveryJobs").collect(), overdue(ctx), currentTime(ctx),
    ]);
    return { users: users.length, stores: stores.length, products: products.length, orders: orders.length, vouchers: vouchers.length, promos: promos.length, deliveryJobs: jobs.length, overdueOrders: overdueOrders.length, currentTime: now };
  },
});

export const getTime = query({ args: {}, returns: v.object({ currentTime: v.number() }), handler: async (ctx) => { await requireActiveRole(ctx, "Admin"); return { currentTime: await currentTime(ctx) }; } });
export const advanceTime = mutation({
  args: { days: v.number() }, returns: v.object({ currentTime: v.number() }),
  handler: async (ctx, { days }) => {
    await requireActiveRole(ctx, "Admin");
    if (!Number.isSafeInteger(days) || days < 1 || days > 30) throw new ConvexError({ code: "INVALID_DAYS", message: "Days must be between 1 and 30." });
    const now = await currentTime(ctx); const next = now + days * 86_400_000;
    const setting = await ctx.db.query("systemSettings").withIndex("by_key", (q) => q.eq("key", "systemTime")).unique();
    if (setting) await ctx.db.patch("systemSettings", setting._id, { value: String(next), updatedAt: Date.now() });
    else await ctx.db.insert("systemSettings", { key: "systemTime", value: String(next), updatedAt: Date.now() });
    return { currentTime: next };
  },
});

export const listVouchers = query({ args: {}, returns: v.array(voucherResult), handler: async (ctx) => { await requireActiveRole(ctx, "Admin"); return (await ctx.db.query("vouchers").collect()).map((row) => ({ id: row._id, code: row.code, percentOff: row.percentOff, remainingUsage: row.remainingUsage, expiresAt: row.expiresAt, createdAt: row.createdAt })); } });
export const createVoucher = mutation({
  args: { code: v.string(), percentOff: v.number(), remainingUsage: v.number(), expiresAt: v.number() }, returns: voucherResult,
  handler: async (ctx, args) => {
    await requireActiveRole(ctx, "Admin"); const code = args.code.trim().toUpperCase();
    if (await ctx.db.query("vouchers").withIndex("by_code", (q) => q.eq("code", code)).unique()) throw new ConvexError({ code: "CODE_EXISTS", message: "Voucher code already exists." });
    const createdAt = Date.now(); const id = await ctx.db.insert("vouchers", { ...args, code, createdAt }); return { id, ...args, code, createdAt };
  },
});
export const listPromos = query({ args: {}, returns: v.array(promoResult), handler: async (ctx) => { await requireActiveRole(ctx, "Admin"); return (await ctx.db.query("promos").collect()).map((row) => ({ id: row._id, code: row.code, amountOff: row.amountOff, expiresAt: row.expiresAt, createdAt: row.createdAt })); } });
export const createPromo = mutation({
  args: { code: v.string(), amountOff: v.number(), expiresAt: v.number() }, returns: promoResult,
  handler: async (ctx, args) => {
    await requireActiveRole(ctx, "Admin"); const code = args.code.trim().toUpperCase();
    if (await ctx.db.query("promos").withIndex("by_code", (q) => q.eq("code", code)).unique()) throw new ConvexError({ code: "CODE_EXISTS", message: "Promo code already exists." });
    const createdAt = Date.now(); const id = await ctx.db.insert("promos", { ...args, code, createdAt }); return { id, ...args, code, createdAt };
  },
});

export const listOverdue = query({ args: {}, returns: v.array(orderResult), handler: async (ctx) => { await requireActiveRole(ctx, "Admin"); return (await overdue(ctx)).map(mapOrder); } });
export const handleOverdue = mutation({
  args: {}, returns: v.array(orderResult),
  handler: async (ctx) => {
    await requireActiveRole(ctx, "Admin"); const rows = await overdue(ctx); const now = await currentTime(ctx); const processed = [];
    for (const order of rows) {
      if (order.refundedAt || order.status === "Dikembalikan") continue;
      for (const item of order.items) { const product = await ctx.db.get("products", item.productId); if (product) await ctx.db.patch("products", product._id, { stock: product.stock + item.quantity, soldCount: Math.max(0, product.soldCount - item.quantity), updatedAt: now }); }
      const wallet = await ctx.db.query("wallets").withIndex("by_buyer", (q) => q.eq("buyerId", order.buyerId)).unique();
      if (wallet) await ctx.db.patch("wallets", wallet._id, { balance: wallet.balance + order.total, updatedAt: now });
      else await ctx.db.insert("wallets", { buyerId: order.buyerId, balance: order.total, updatedAt: now });
      await ctx.db.insert("walletTransactions", { buyerId: order.buyerId, type: "refund", amount: order.total, note: `Refund for overdue order ${order._id}`, createdAt: now });
      await ctx.db.patch("orders", order._id, { status: "Dikembalikan", refundedAt: now });
      await ctx.db.insert("orderStatusHistory", { orderId: order._id, status: "Dikembalikan", note: "Auto return/refund for overdue order.", createdAt: now });
      const job = await ctx.db.query("deliveryJobs").withIndex("by_order", (q) => q.eq("orderId", order._id)).unique(); if (job) await ctx.db.delete("deliveryJobs", job._id);
      processed.push(mapOrder({ ...order, status: "Dikembalikan", refundedAt: now }));
    }
    return processed;
  },
});
