import { handleOverdueOrders, listOverdueOrders } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

export async function GET() {
  try {
    await requireActiveRole("Admin");
    return ok(listOverdueOrders());
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Admin role required.", 403);
  }
}

export async function POST() {
  try {
    await requireActiveRole("Admin");
    return ok(handleOverdueOrders());
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Admin role required.", 403);
  }
}
