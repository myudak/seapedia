import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const reviewResult = v.object({ id: v.string(), reviewerName: v.string(), rating: v.number(), comment: v.string(), createdAt: v.number() });

export const list = query({
  args: {}, returns: v.array(reviewResult),
  handler: async (ctx) => (await ctx.db.query("appReviews").withIndex("by_created").order("desc").take(50)).map((row) => ({ id: row._id, reviewerName: row.reviewerName, rating: row.rating, comment: row.comment, createdAt: row.createdAt })),
});

export const create = mutation({
  args: { reviewerName: v.string(), rating: v.number(), comment: v.string() }, returns: reviewResult,
  handler: async (ctx, args) => {
    const reviewerName = args.reviewerName.replace(/\s+/g, " ").trim();
    const comment = args.comment.replace(/\s+/g, " ").trim();
    if (reviewerName.length < 2 || reviewerName.length > 60 || comment.length < 3 || comment.length > 500 || !Number.isInteger(args.rating) || args.rating < 1 || args.rating > 5) {
      throw new ConvexError({ code: "INVALID_REVIEW", message: "Invalid review payload." });
    }
    const createdAt = Date.now(); const id = await ctx.db.insert("appReviews", { reviewerName, rating: args.rating, comment, createdAt });
    return { id, reviewerName, rating: args.rating, comment, createdAt };
  },
});
