import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Role } from "../validators";

type AuthCtx = Pick<QueryCtx | MutationCtx, "auth" | "db">;

export async function requireIdentity(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Authentication required." });
  }
  return identity;
}

export async function requireProfile(ctx: AuthCtx) {
  const identity = await requireIdentity(ctx);
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_auth_user", (q) => q.eq("authUserId", identity.subject))
    .unique();

  if (!profile) {
    throw new ConvexError({ code: "PROFILE_REQUIRED", message: "Marketplace profile is not ready." });
  }
  return { identity, profile };
}

export function getSessionId(identity: { subject: string; [key: string]: unknown }) {
  const sessionId = identity.sessionId;
  if (typeof sessionId !== "string" || !sessionId) {
    throw new ConvexError({ code: "SESSION_REQUIRED", message: "Authenticated session is unavailable." });
  }
  return sessionId;
}

export async function getActiveRole(ctx: AuthCtx) {
  const { identity, profile } = await requireProfile(ctx);
  const sessionId = getSessionId(identity);
  const selected = await ctx.db
    .query("sessionRoles")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .unique();
  const activeRole = selected?.activeRole ?? (profile.roles.length === 1 ? profile.roles[0] : undefined);
  return { identity, profile, sessionId, activeRole };
}

export async function requireActiveRole(ctx: AuthCtx, role: Role) {
  const auth = await getActiveRole(ctx);
  if (!auth.profile.roles.includes(role) || auth.activeRole !== role) {
    throw new ConvexError({ code: "FORBIDDEN", message: `${role} active role required.` });
  }
  return auth;
}
