import { authNextjs } from "@/lib/auth-server";

// Better Auth owns /api/auth/* in Convex mode (sign-in/up/out, get-session, …).
// Static auth routes like /api/auth/login take precedence over this catch-all,
// so memory-mode endpoints keep working. Returns 503 when Convex isn't set up.
async function notConfigured() {
  return new Response(
    JSON.stringify({ ok: false, error: "Convex auth is not configured." }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

export const GET = authNextjs?.handler.GET ?? notConfigured;
export const POST = authNextjs?.handler.POST ?? notConfigured;
