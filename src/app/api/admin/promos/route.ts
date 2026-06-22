import { z } from "zod";
import { createPromo, listPromos } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

const promoSchema = z.object({
  code: z.string().min(3).max(24),
  amountOff: z.number().int().min(1),
  expiresAt: z.number().int().positive(),
});

export async function GET() {
  try {
    await requireActiveRole("Admin");
    return ok(listPromos());
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
    await requireActiveRole("Admin");
    return ok(createPromo(parsed.data), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Promo creation failed.", 403);
  }
}
