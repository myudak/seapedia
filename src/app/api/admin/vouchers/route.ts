import { z } from "zod";
import { createVoucher, listVouchers } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

const voucherSchema = z.object({
  code: z.string().min(3).max(24),
  percentOff: z.number().int().min(1).max(90),
  remainingUsage: z.number().int().min(1),
  expiresAt: z.number().int().positive(),
});

export async function GET() {
  try {
    await requireActiveRole("Admin");
    return ok(listVouchers());
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Admin role required.", 403);
  }
}

export async function POST(request: Request) {
  const parsed = voucherSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid voucher payload.");
  }

  try {
    await requireActiveRole("Admin");
    return ok(createVoucher(parsed.data), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Voucher creation failed.", 403);
  }
}
