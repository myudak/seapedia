import { fail, ok } from "@/lib/server/http";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

type OrderRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: OrderRouteProps) {
  try {
    const { id } = await params;
    const result = await fetchAuthQuery(api.orders.getBuyerOrder, { orderId: id as Id<"orders"> });

    if (!result) {
      return fail("Order not found.", 404);
    }

    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Buyer role required.", 403);
  }
}
