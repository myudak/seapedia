import { z } from "zod";
import { deliveryMethods } from "@/lib/domain/types";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const checkoutSchema = z.object({
  deliveryMethod: z.enum(deliveryMethods),
  discountCode: z.string().optional(),
  addressId: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid checkout payload.");
  }

  try {
    return ok(await fetchAuthMutation(api.checkout.placeOrder, {
      ...parsed.data,
      addressId: parsed.data.addressId as Id<"addresses">,
    }), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Checkout failed.");
  }
}
