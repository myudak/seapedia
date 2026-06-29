import { fail, ok } from "@/lib/server/http";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  try {
    return ok(await fetchAuthQuery(api.buyer.getCart, {}));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Buyer role required.", 403);
  }
}
