import { z } from "zod";
import { topUpBuyerWallet } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

const topUpSchema = z.object({
  amount: z.number().int().positive(),
});

export async function POST(request: Request) {
  const parsed = topUpSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid top-up amount.");
  }

  try {
    const profile = await requireActiveRole("Buyer");
    return ok(topUpBuyerWallet(profile.user.id, parsed.data.amount));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Top-up failed.", 403);
  }
}
