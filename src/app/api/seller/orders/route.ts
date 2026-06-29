import { fail, ok } from "@/lib/server/http";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  try {
    return ok(await fetchAuthQuery(api.orders.listSeller, {}));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Seller role required.", 403);
  }
}
