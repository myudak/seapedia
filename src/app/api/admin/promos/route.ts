import { z } from "zod";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

const promoSchema = z.object({
  code: z.string().min(3).max(24),
  amountOff: z.number().int().min(1),
  expiresAt: z.number().int().positive(),
});

export async function GET() {
  try {
    return ok(await fetchAuthQuery(api.admin.listPromos, {}));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Admin role required.", 403);
  }
}

export async function POST(request: Request) {
  const parsed = promoSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid promo payload.");
  }

  try {
    return ok(await fetchAuthMutation(api.admin.createPromo, parsed.data), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Promo creation failed.", 403);
  }
}
