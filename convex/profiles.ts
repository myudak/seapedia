import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const roleValidator = v.union(
  v.literal("Admin"),
  v.literal("Seller"),
  v.literal("Buyer"),
  v.literal("Driver"),
);

/**
 * Multi-role + active-role layer on top of Better Auth, using documented Convex
 * identity (`ctx.auth.getUserIdentity()`, populated by the Better Auth `convex`
 * plugin). `identity.subject` is the authenticated Better Auth user id.
 *
 * NOTE: active role is keyed per user here (not strictly per browser session)
 * as a documented simplification of the Tugas "active role per session" rule.
 */

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", identity.subject))
      .unique();
    const session = await ctx.db
      .query("sessionRoles")
      .withIndex("by_session", (q) => q.eq("sessionToken", identity.subject))
      .unique();

    const roles = profile?.roles ?? ["Buyer"];
    const activeRole =
      session?.activeRole ??
      (roles.length === 1 || roles.includes("Admin") ? roles[0] : undefined);

    return {
      user: {
        username: profile?.username ?? identity.subject,
        displayName: profile?.displayName ?? "",
        roles,
      },
      activeRole,
      needsRoleSelection:
        roles.length > 1 &&
        !roles.includes("Admin") &&
        activeRole === undefined,
    };
  },
});

export const setActiveRole = mutation({
  args: { role: roleValidator },
  handler: async (ctx, { role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required.");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", identity.subject))
      .unique();
    if (!profile || !profile.roles.includes(role)) {
      throw new Error("Role is not owned by this user.");
    }

    const existing = await ctx.db
      .query("sessionRoles")
      .withIndex("by_session", (q) => q.eq("sessionToken", identity.subject))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        activeRole: role,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("sessionRoles", {
        sessionToken: identity.subject,
        activeRole: role,
        updatedAt: Date.now(),
      });
    }
    return { role };
  },
});

/** Sets the roles owned by the current user (called after sign-up). */
export const setRoles = mutation({
  args: {
    username: v.string(),
    displayName: v.string(),
    roles: v.array(roleValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required.");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", identity.subject))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        username: args.username,
        displayName: args.displayName,
        roles: args.roles,
      });
      return existing._id;
    }
    return await ctx.db.insert("profiles", {
      authUserId: identity.subject,
      username: args.username,
      displayName: args.displayName,
      roles: args.roles,
      createdAt: Date.now(),
    });
  },
});
