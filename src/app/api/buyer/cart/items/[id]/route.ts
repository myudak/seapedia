import { z } from "zod";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";

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
    const { id } = await params;
    return ok(await fetchAuthMutation(api.buyer.updateCartItem, { cartItemId: id as Id<"cartItems">, quantity: parsed.data.quantity }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Cart update failed.");
  }
}

export async function DELETE(_request: Request, { params }: CartItemRouteProps) {
  try {
    const { id } = await params;
    return ok(await fetchAuthMutation(api.buyer.removeCartItem, { cartItemId: id as Id<"cartItems"> }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Cart update failed.");
  }
}
