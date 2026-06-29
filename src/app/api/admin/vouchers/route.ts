import { z } from "zod";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

const voucherSchema = z.object({
  code: z.string().min(3).max(24),
  percentOff: z.number().int().min(1).max(90),
  remainingUsage: z.number().int().min(1),
  expiresAt: z.number().int().positive(),
});

export async function GET() {
  try {
    return ok(await fetchAuthQuery(api.admin.listVouchers, {}));
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
    return ok(await fetchAuthMutation(api.admin.createVoucher, parsed.data), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Voucher creation failed.", 403);
  }
}
