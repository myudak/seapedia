import { z } from "zod";
import { addCartItem, getCartSummary } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function POST(request: Request) {
  const parsed = cartItemSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid cart item payload.");
  }

  try {
    const profile = await requireActiveRole("Buyer");
    addCartItem(profile.user.id, parsed.data.productId, parsed.data.quantity);
    return ok(getCartSummary(profile.user.id), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Cart update failed.");
  }
}
