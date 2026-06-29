import { z } from "zod";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

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
    return ok(await fetchAuthQuery(api.buyer.listAddresses, {}));
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
    return ok(await fetchAuthMutation(api.buyer.createAddress, parsed.data), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Address creation failed.");
  }
}
