import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Better Auth owns authentication + sessions. SEAPEDIA's multi-role concept is
 * layered on top: the user's owned roles are stored as a CSV `roles` field
 * (Better Auth additional fields are scalar), and the active-role-per-session
 * lives in the `sessionRoles` table (see convex/profiles.ts).
 */
export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [username(), convex({ authConfig })],
  });

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => authComponent.getAuthUser(ctx),
});
