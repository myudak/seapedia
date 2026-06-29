import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireActiveRole } from "./model/auth";
import { historyResult, mapHistory, mapOrder, orderResult } from "./model/orders";

const jobResult = v.object({
  id: v.string(), orderId: v.string(), driverId: v.optional(v.string()),
  status: v.union(v.literal("available"), v.literal("taken"), v.literal("completed")),
  earning: v.number(), createdAt: v.number(), updatedAt: v.number(), order: v.optional(orderResult),
});
const reportResult = v.object({ orderCount: v.number(), subtotal: v.number(), discount: v.number(), deliveryFee: v.number(), ppn: v.number(), total: v.optional(v.number()), income: v.optional(v.number()) });
const metricResult = v.object({ value: v.number(), delta: v.number() });

function mapJob(job: Doc<"deliveryJobs">, order?: Doc<"orders"> | null) {
  return { id: job._id, orderId: job.orderId, driverId: job.driverId, status: job.status, earning: job.earning, createdAt: job.createdAt, updatedAt: job.updatedAt, order: order ? mapOrder(order) : undefined };
}

async function history(ctx: QueryCtx | MutationCtx, orderId: Doc<"orders">["_id"]) {
  return await ctx.db.query("orderStatusHistory").withIndex("by_order", (q) => q.eq("orderId", orderId)).collect();
}

function summarize(orders: Doc<"orders">[]) {
  return {
    orderCount: orders.length,
    subtotal: orders.reduce((sum, order) => sum + order.subtotal, 0),
    discount: orders.reduce((sum, order) => sum + order.discount, 0),
    deliveryFee: orders.reduce((sum, order) => sum + order.deliveryFee, 0),
    ppn: orders.reduce((sum, order) => sum + order.ppn, 0),
  };
}

export const listBuyer = query({
  args: {}, returns: v.array(orderResult),
  handler: async (ctx) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    const orders = await ctx.db.query("orders").withIndex("by_buyer", (q) => q.eq("buyerId", profile.authUserId)).order("desc").collect();
    return orders.map(mapOrder);
  },
});

export const getBuyerOrder = query({
  args: { orderId: v.id("orders") },
  returns: v.union(v.object({ order: orderResult, history: v.array(historyResult) }), v.null()),
  handler: async (ctx, { orderId }) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    const order = await ctx.db.get("orders", orderId);
    if (!order || order.buyerId !== profile.authUserId) return null;
    return { order: mapOrder(order), history: (await history(ctx, orderId)).map(mapHistory) };
  },
});

export const buyerReport = query({
  args: {}, returns: reportResult,
  handler: async (ctx) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    const orders = await ctx.db.query("orders").withIndex("by_buyer", (q) => q.eq("buyerId", profile.authUserId)).collect();
    return { ...summarize(orders), total: orders.reduce((sum, order) => sum + order.total, 0) };
  },
});

export const listSeller = query({
  args: {}, returns: v.array(orderResult),
  handler: async (ctx) => {
    const { profile } = await requireActiveRole(ctx, "Seller");
    const orders = await ctx.db.query("orders").withIndex("by_seller", (q) => q.eq("sellerId", profile.authUserId)).order("desc").collect();
    return orders.map(mapOrder);
  },
});

export const processSellerOrder = mutation({
  args: { orderId: v.id("orders") }, returns: orderResult,
  handler: async (ctx, { orderId }) => {
    const { profile } = await requireActiveRole(ctx, "Seller");
    const order = await ctx.db.get("orders", orderId);
    if (!order || order.sellerId !== profile.authUserId) throw new ConvexError({ code: "FORBIDDEN", message: "Order does not belong to the active seller." });
    if (order.status === "Menunggu Pengirim") return mapOrder(order);
    if (order.status !== "Sedang Dikemas") throw new ConvexError({ code: "INVALID_STATUS", message: "Only packed orders can be processed." });
    const now = Date.now();
    await ctx.db.patch("orders", order._id, { status: "Menunggu Pengirim" });
    await ctx.db.insert("orderStatusHistory", { orderId, status: "Menunggu Pengirim", note: "Seller finished packing; waiting for a driver.", createdAt: now });
    const job = await ctx.db.query("deliveryJobs").withIndex("by_order", (q) => q.eq("orderId", orderId)).unique();
    if (!job) await ctx.db.insert("deliveryJobs", { orderId, status: "available", earning: 0, createdAt: now, updatedAt: now });
    return mapOrder({ ...order, status: "Menunggu Pengirim" });
  },
});

export const sellerReport = query({
  args: {}, returns: reportResult,
  handler: async (ctx) => {
    const { profile } = await requireActiveRole(ctx, "Seller");
    const orders = (await ctx.db.query("orders").withIndex("by_seller", (q) => q.eq("sellerId", profile.authUserId)).collect()).filter((order) => order.status !== "Dikembalikan");
    return { ...summarize(orders), income: orders.reduce((sum, order) => sum + order.subtotal - order.discount, 0) };
  },
});

export const sellerInsights = query({
  args: {},
  returns: v.object({ series: v.array(v.object({ label: v.string(), value: v.number() })), compare: v.array(v.number()), sales: metricResult, orders: metricResult, units: metricResult, avgOrderValue: metricResult, topProducts: v.array(v.object({ name: v.string(), revenue: v.number(), units: v.number() })), synthesized: v.boolean() }),
  handler: async (ctx) => {
    const { profile } = await requireActiveRole(ctx, "Seller");
    const rows = (await ctx.db.query("orders").withIndex("by_seller", (q) => q.eq("sellerId", profile.authUserId)).collect()).filter((order) => order.status !== "Dikembalikan");
    const DAY = 86_400_000;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const starts = Array.from({ length: 7 }, (_, i) => today.getTime() - (6 - i) * DAY);
    const sales = (start: number) => rows.filter((order) => order.createdAt >= start && order.createdAt < start + DAY).reduce((sum, order) => sum + order.total, 0);
    const series = starts.map((start) => ({ label: new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: sales(start) }));
    const total = rows.reduce((sum, order) => sum + order.total, 0);
    const units = rows.reduce((sum, order) => sum + order.items.reduce((acc, item) => acc + item.quantity, 0), 0);
    const products = new Map<string, { revenue: number; units: number }>();
    for (const order of rows) for (const item of order.items) { const value = products.get(item.productName) ?? { revenue: 0, units: 0 }; value.revenue += item.lineTotal; value.units += item.quantity; products.set(item.productName, value); }
    return { series, compare: Array(7).fill(0), sales: { value: total, delta: 0 }, orders: { value: rows.length, delta: 0 }, units: { value: units, delta: 0 }, avgOrderValue: { value: rows.length ? Math.round(total / rows.length) : 0, delta: 0 }, topProducts: [...products].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.revenue - a.revenue).slice(0, 5), synthesized: false };
  },
});

export const listAvailableJobs = query({
  args: {}, returns: v.array(jobResult),
  handler: async (ctx) => {
    await requireActiveRole(ctx, "Driver");
    const jobs = await ctx.db.query("deliveryJobs").withIndex("by_status", (q) => q.eq("status", "available")).collect();
    return await Promise.all(jobs.map(async (job) => mapJob(job, await ctx.db.get("orders", job.orderId))));
  },
});

export const getJob = query({
  args: { jobId: v.id("deliveryJobs") }, returns: v.union(jobResult, v.null()),
  handler: async (ctx, { jobId }) => { await requireActiveRole(ctx, "Driver"); const job = await ctx.db.get("deliveryJobs", jobId); return job ? mapJob(job, await ctx.db.get("orders", job.orderId)) : null; },
});

export const takeJob = mutation({
  args: { jobId: v.id("deliveryJobs") }, returns: jobResult,
  handler: async (ctx, { jobId }) => {
    const { profile } = await requireActiveRole(ctx, "Driver");
    const job = await ctx.db.get("deliveryJobs", jobId);
    if (!job || job.status !== "available" || job.driverId) throw new ConvexError({ code: "JOB_TAKEN", message: "Delivery job already taken." });
    const order = await ctx.db.get("orders", job.orderId);
    if (!order || order.status !== "Menunggu Pengirim") throw new ConvexError({ code: "INVALID_STATUS", message: "Only jobs waiting for driver can be taken." });
    const now = Date.now();
    await ctx.db.patch("deliveryJobs", job._id, { driverId: profile.authUserId, status: "taken", updatedAt: now });
    await ctx.db.patch("orders", order._id, { status: "Sedang Dikirim" });
    await ctx.db.insert("orderStatusHistory", { orderId: order._id, status: "Sedang Dikirim", note: "Driver took the delivery job.", createdAt: now });
    return mapJob({ ...job, driverId: profile.authUserId, status: "taken", updatedAt: now }, { ...order, status: "Sedang Dikirim" });
  },
});

export const completeJob = mutation({
  args: { jobId: v.id("deliveryJobs") }, returns: jobResult,
  handler: async (ctx, { jobId }) => {
    const { profile } = await requireActiveRole(ctx, "Driver");
    const job = await ctx.db.get("deliveryJobs", jobId);
    if (!job || job.driverId !== profile.authUserId) throw new ConvexError({ code: "FORBIDDEN", message: "Delivery job not found." });
    if (job.status === "completed") return mapJob(job, await ctx.db.get("orders", job.orderId));
    const order = await ctx.db.get("orders", job.orderId);
    if (!order || job.status !== "taken" || order.status !== "Sedang Dikirim") throw new ConvexError({ code: "INVALID_STATUS", message: "Only active deliveries can be completed." });
    const now = Date.now(); const earning = Math.round(order.deliveryFee * 0.8);
    await ctx.db.patch("deliveryJobs", job._id, { status: "completed", earning, updatedAt: now });
    await ctx.db.patch("orders", order._id, { status: "Pesanan Selesai", completedAt: now });
    await ctx.db.insert("orderStatusHistory", { orderId: order._id, status: "Pesanan Selesai", note: "Driver completed the delivery.", createdAt: now });
    return mapJob({ ...job, status: "completed", earning, updatedAt: now }, { ...order, status: "Pesanan Selesai", completedAt: now });
  },
});

export const driverHistory = query({
  args: {}, returns: v.object({ activeJob: v.union(jobResult, v.null()), history: v.array(jobResult), earnings: v.number() }),
  handler: async (ctx) => {
    const { profile } = await requireActiveRole(ctx, "Driver");
    const jobs = await ctx.db.query("deliveryJobs").withIndex("by_driver", (q) => q.eq("driverId", profile.authUserId)).collect();
    const mapped = await Promise.all(jobs.map(async (job) => mapJob(job, await ctx.db.get("orders", job.orderId))));
    return { activeJob: mapped.find((job) => job.status === "taken") ?? null, history: mapped.filter((job) => job.status === "completed"), earnings: mapped.reduce((sum, job) => sum + job.earning, 0) };
  },
});
