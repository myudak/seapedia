import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

export async function GET() {
  try {
    return ok(await fetchAuthQuery(api.admin.listOverdue, {}));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Admin role required.", 403);
  }
}

export async function POST() {
  try {
    return ok(await fetchAuthMutation(api.admin.handleOverdue, {}));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Admin role required.", 403);
  }
}
