import { getOrderForParticipant } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

type OrderRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: OrderRouteProps) {
  try {
    const profile = await requireActiveRole("Buyer");
    const { id } = await params;
    const result = getOrderForParticipant(profile.user.id, id);

    if (!result) {
      return fail("Order not found.", 404);
    }

    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Buyer role required.", 403);
  }
}
