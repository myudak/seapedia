import { processSellerOrder } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

type OrderProcessRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: OrderProcessRouteProps) {
  try {
    const profile = await requireActiveRole("Seller");
    const { id } = await params;
    return ok(processSellerOrder(profile.user.id, id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Order process failed.", 403);
  }
}
