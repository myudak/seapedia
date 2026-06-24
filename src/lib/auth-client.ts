"use client";

import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

/**
 * Better Auth client. Used only in Convex mode (when NEXT_PUBLIC_CONVEX_URL is
 * configured); the username plugin lets users sign in with a username, matching
 * the SEAPEDIA seed accounts.
 */
export const authClient = createAuthClient({
  plugins: [usernameClient(), convexClient()],
});
