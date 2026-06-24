import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

/** True only when a Convex deployment is configured (Convex mode). */
export const isConvexConfigured = Boolean(convexUrl && convexSiteUrl);

/**
 * Better Auth ⇄ Convex Next.js helpers. Null in memory mode so the app runs
 * without a Convex deployment; the catch-all auth route falls back to 503.
 */
export const authNextjs = isConvexConfigured
  ? convexBetterAuthNextJs({
      convexUrl: convexUrl!,
      convexSiteUrl: convexSiteUrl!,
      basePath: "/api/auth",
    })
  : null;
