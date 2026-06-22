import { z } from "zod";
import { getStoreForSeller, upsertSellerStore } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

const storeSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().min(8).max(240),
});

export async function GET() {
  try {
    const profile = await requireActiveRole("Seller");
    return ok(getStoreForSeller(profile.user.id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Seller role required.", 403);
  }
}

export async function POST(request: Request) {
  const parsed = storeSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid store payload.");
  }

  try {
    const profile = await requireActiveRole("Seller");
    return ok(upsertSellerStore(profile.user.id, parsed.data));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Store update failed.", 400);
  }
}
