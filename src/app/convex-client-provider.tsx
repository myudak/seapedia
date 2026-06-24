"use client";

import type { ComponentProps, ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

// The username plugin augments the client's inferred session type, which the
// provider's narrow `authClient` prop doesn't accept — runtime is compatible.
type ProviderAuthClient = ComponentProps<
  typeof ConvexBetterAuthProvider
>["authClient"];

/**
 * In Convex mode, provides the Convex + Better Auth context. In memory mode
 * (no NEXT_PUBLIC_CONVEX_URL) it's a transparent pass-through, so the app runs
 * unchanged without a deployment.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) return <>{children}</>;
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient as unknown as ProviderAuthClient}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}
