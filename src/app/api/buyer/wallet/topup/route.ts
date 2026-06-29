import { z } from "zod";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "../../../../../../convex/_generated/api";

const topUpSchema = z.object({
  amount: z.number().int().positive(),
});

export async function POST(request: Request) {
  const parsed = topUpSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid top-up amount.");
  }

  try {
    return ok(await fetchAuthMutation(api.buyer.topUpWallet, parsed.data));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Top-up failed.", 403);
  }
}
