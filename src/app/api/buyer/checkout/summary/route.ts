import { z } from "zod";
import { previewCheckout } from "@/lib/domain/state";
import { deliveryMethods } from "@/lib/domain/types";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

const summarySchema = z.object({
  deliveryMethod: z.enum(deliveryMethods),
});

export async function POST(request: Request) {
  const parsed = summarySchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid checkout summary payload.");
  }

  try {
    const profile = await requireActiveRole("Buyer");
    return ok(previewCheckout(profile.user.id, parsed.data.deliveryMethod));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Checkout summary failed.");
  }
}
