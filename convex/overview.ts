import { v } from "convex/values";
import { query } from "./_generated/server";
import { getActiveRole } from "./model/auth";
import { orderStatusValidator, roleValidator } from "./validators";

const attentionResult = v.object({ id: v.string(), storeName: v.string(), status: orderStatusValidator, total: v.number(), createdAt: v.number(), dueAt: v.number() });

export const dashboard = query({
  args: {},
  returns: v.object({
    profile: v.object({ username: v.string(), displayName: v.string(), activeRole: v.optional(roleValidator) }),
    monitoring: v.object({ users: v.number(), stores: v.number(), products: v.number(), orders: v.number(), vouchers: v.number(), promos: v.number(), deliveryJobs: v.number(), overdueOrders: v.number() }),
    overview: v.object({ series: v.array(v.object({ label: v.string(), value: v.number() })), compare: v.array(v.number()), revenueThisPeriod: v.number(), revenuePrevPeriod: v.number(), ordersThisPeriod: v.number(), attention: v.object({ awaitingSeller: v.array(attentionResult), awaitingDriver: v.array(attentionResult), overdue: v.array(attentionResult) }), synthesized: v.boolean() }),
    lowStock: v.array(v.object({ id: v.string(), name: v.string(), stock: v.number() })),
  }),
  handler: async (ctx) => {
    const auth = await getActiveRole(ctx);
    const [profiles, stores, products, orders, vouchers, promos, jobs, setting] = await Promise.all([
      ctx.db.query("profiles").collect(), ctx.db.query("stores").collect(), ctx.db.query("products").collect(), ctx.db.query("orders").collect(),
      ctx.db.query("vouchers").collect(), ctx.db.query("promos").collect(), ctx.db.query("deliveryJobs").collect(),
      ctx.db.query("systemSettings").withIndex("by_key", (q) => q.eq("key", "systemTime")).unique(),
    ]);
    const nowValue = Number(setting?.value); const now = Number.isFinite(nowValue) ? nowValue : Date.now();
    const overdue = orders.filter((order) => !["Pesanan Selesai", "Dikembalikan"].includes(order.status) && order.dueAt < now);
    const DAY = 86_400_000; const today = new Date(now); today.setHours(0, 0, 0, 0);
    const starts = Array.from({ length: 7 }, (_, index) => today.getTime() - (6 - index) * DAY);
    const previous = starts.map((start) => start - 7 * DAY);
    const revenue = (start: number) => orders.filter((order) => order.createdAt >= start && order.createdAt < start + DAY && order.status !== "Dikembalikan").reduce((sum, order) => sum + order.total, 0);
    const series = starts.map((start) => ({ label: new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: revenue(start) }));
    const compare = previous.map(revenue);
    const attention = (rows: typeof orders) => rows.map((order) => ({ id: order._id, storeName: order.storeName, status: order.status, total: order.total, createdAt: order.createdAt, dueAt: order.dueAt }));
    return {
      profile: { username: auth.profile.username, displayName: auth.profile.displayName, activeRole: auth.activeRole },
      monitoring: { users: profiles.length, stores: stores.length, products: products.length, orders: orders.length, vouchers: vouchers.length, promos: promos.length, deliveryJobs: jobs.length, overdueOrders: overdue.length },
      overview: { series, compare, revenueThisPeriod: series.reduce((sum, point) => sum + point.value, 0), revenuePrevPeriod: compare.reduce((sum, value) => sum + value, 0), ordersThisPeriod: orders.filter((order) => order.createdAt >= starts[0]).length, attention: { awaitingSeller: attention(orders.filter((order) => order.status === "Sedang Dikemas")), awaitingDriver: attention(orders.filter((order) => order.status === "Menunggu Pengirim")), overdue: attention(overdue) }, synthesized: false },
      lowStock: products.filter((product) => product.stock <= 12).sort((a, b) => a.stock - b.stock).map((product) => ({ id: product.publicId, name: product.name, stock: product.stock })),
    };
  },
});
