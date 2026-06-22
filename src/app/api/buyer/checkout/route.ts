import { z } from "zod";
import { createCheckoutOrder } from "@/lib/domain/state";
import { deliveryMethods } from "@/lib/domain/types";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

const checkoutSchema = z.object({
  deliveryMethod: z.enum(deliveryMethods),
  discountCode: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid checkout payload.");
  }

  try {
    const profile = await requireActiveRole("Buyer");
    return ok(
      createCheckoutOrder(
        profile.user.id,
        parsed.data.deliveryMethod,
        parsed.data.discountCode,
      ),
      { status: 201 },
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Checkout failed.");
  }
}
