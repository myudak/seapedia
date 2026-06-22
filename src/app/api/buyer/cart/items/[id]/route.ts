import { z } from "zod";
import { getCartSummary, removeCartItem, updateCartItem } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

type CartItemRouteProps = {
  params: Promise<{ id: string }>;
};

const cartPatchSchema = z.object({
  quantity: z.number().int().positive(),
});

export async function PATCH(request: Request, { params }: CartItemRouteProps) {
  const parsed = cartPatchSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid cart quantity.");
  }

  try {
    const profile = await requireActiveRole("Buyer");
    const { id } = await params;
    updateCartItem(profile.user.id, id, parsed.data.quantity);
    return ok(getCartSummary(profile.user.id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Cart update failed.");
  }
}

export async function DELETE(_request: Request, { params }: CartItemRouteProps) {
  try {
    const profile = await requireActiveRole("Buyer");
    const { id } = await params;
    removeCartItem(profile.user.id, id);
    return ok(getCartSummary(profile.user.id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Cart update failed.");
  }
}
