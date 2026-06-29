import { z } from "zod";
import { deliveryMethods } from "@/lib/domain/types";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../../convex/_generated/api";

const summarySchema = z.object({
  deliveryMethod: z.enum(deliveryMethods),
  discountCode: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = summarySchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid checkout summary payload.");
  }

  try {
    return ok(await fetchAuthQuery(api.checkout.preview, parsed.data));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Checkout summary failed.");
  }
}
