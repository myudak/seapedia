import { z } from "zod";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "../../../../../../convex/_generated/api";

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
    return ok(await fetchAuthMutation(api.buyer.addCartItem, parsed.data), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Cart update failed.");
  }
}
