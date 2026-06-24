import { internalMutation } from "./_generated/server";

const DAY = 86_400_000;

/**
 * Seeds foreign-key-free demo data (app reviews, a voucher, a promo, system
 * time). Run from the Convex dashboard or `npx convex run seed:seed`.
 *
 * Demo *accounts* are created through the Better Auth sign-up flow (or the
 * dashboard) because users/sessions are owned by the Better Auth component;
 * see README "Convex activation".
 */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    if ((await ctx.db.query("appReviews").take(1)).length === 0) {
      await ctx.db.insert("appReviews", {
        reviewerName: "Dina",
        rating: 5,
        comment:
          "Role flow is clear, and the marketplace feels ready for launch.",
        createdAt: now - DAY,
      });
      await ctx.db.insert("appReviews", {
        reviewerName: "Raka",
        rating: 4,
        comment: "Catalog is easy to scan even before logging in.",
        createdAt: now - DAY / 2,
      });
    }

    if ((await ctx.db.query("vouchers").take(1)).length === 0) {
      await ctx.db.insert("vouchers", {
        code: "HEMAT12",
        percentOff: 12,
        remainingUsage: 10,
        expiresAt: now + 7 * DAY,
        createdAt: now,
      });
    }

    if ((await ctx.db.query("promos").take(1)).length === 0) {
      await ctx.db.insert("promos", {
        code: "ONGKIR8K",
        amountOff: 8000,
        expiresAt: now + 5 * DAY,
        createdAt: now,
      });
    }

    const time = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q) => q.eq("key", "systemTime"))
      .unique();
    if (!time) {
      await ctx.db.insert("systemSettings", {
        key: "systemTime",
        value: String(now),
        updatedAt: now,
      });
    }

    return { ok: true };
  },
});
