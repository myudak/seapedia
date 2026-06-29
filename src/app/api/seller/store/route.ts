import { z } from "zod";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

const storeSchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().min(8).max(240),
});

export async function GET() {
  try {
    return ok(await fetchAuthQuery(api.seller.getStore, {}));
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
    return ok(await fetchAuthMutation(api.seller.upsertStore, parsed.data));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Store update failed.", 400);
  }
}
