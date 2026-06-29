import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";

type OrderProcessRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: OrderProcessRouteProps) {
  try {
    const { id } = await params;
    return ok(await fetchAuthMutation(api.orders.processSellerOrder, { orderId: id as Id<"orders"> }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Order process failed.", 403);
  }
}
