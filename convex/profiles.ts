import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getActiveRole, getSessionId, requireIdentity, requireProfile } from "./model/auth";
import { roleValidator } from "./validators";

const profileResult = v.object({
  user: v.object({
    id: v.string(),
    username: v.string(),
    displayName: v.string(),
    email: v.string(),
    roles: v.array(roleValidator),
  }),
  activeRole: v.optional(roleValidator),
  needsRoleSelection: v.boolean(),
});

export const getProfile = query({
  args: {},
  returns: v.union(profileResult, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", identity.subject))
      .unique();
    if (!profile) return null;

    const sessionId = getSessionId(identity);
    const session = await ctx.db
      .query("sessionRoles")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .unique();
    const activeRole = session?.activeRole ?? (profile.roles.length === 1 ? profile.roles[0] : undefined);

    return {
      user: {
        id: profile.authUserId,
        username: profile.username,
        displayName: profile.displayName,
        email: typeof identity.email === "string" ? identity.email : "",
        roles: profile.roles,
      },
      activeRole,
      needsRoleSelection: profile.roles.length > 1 && activeRole === undefined,
    };
  },
});

export const bootstrap = mutation({
  args: { username: v.string(), displayName: v.string() },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", identity.subject))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("profiles", {
      authUserId: identity.subject,
      username: args.username.trim().toLowerCase(),
      displayName: args.displayName.trim(),
      roles: ["Buyer"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const setActiveRole = mutation({
  args: { role: roleValidator },
  returns: profileResult,
  handler: async (ctx, { role }) => {
    const { identity, profile } = await requireProfile(ctx);
    if (!profile.roles.includes(role)) {
      throw new Error("Role is not owned by this user.");
    }

    const sessionId = getSessionId(identity);
    const existing = await ctx.db
      .query("sessionRoles")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .unique();
    if (existing) {
      await ctx.db.patch("sessionRoles", existing._id, { activeRole: role, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("sessionRoles", {
        sessionId,
        authUserId: identity.subject,
        activeRole: role,
        updatedAt: Date.now(),
      });
    }

    const current = await getActiveRole(ctx);
    return {
      user: {
        id: profile.authUserId,
        username: profile.username,
        displayName: profile.displayName,
        email: typeof identity.email === "string" ? identity.email : "",
        roles: profile.roles,
      },
      activeRole: current.activeRole,
      needsRoleSelection: profile.roles.length > 1 && current.activeRole === undefined,
    };
  },
});
