import { z } from "zod";
import { createBuyerAddress, listBuyerAddresses } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

const addressSchema = z.object({
  label: z.string().min(2).max(60),
  recipient: z.string().min(2).max(80),
  phone: z.string().min(8).max(24),
  fullAddress: z.string().min(10).max(240),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  try {
    const profile = await requireActiveRole("Buyer");
    return ok(listBuyerAddresses(profile.user.id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Buyer role required.", 403);
  }
}

export async function POST(request: Request) {
  const parsed = addressSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid address payload.");
  }

  try {
    const profile = await requireActiveRole("Buyer");
    return ok(createBuyerAddress(profile.user.id, parsed.data), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Address creation failed.");
  }
}
