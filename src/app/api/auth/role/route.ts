import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import { fetchAuthMutation } from "@/lib/auth-server";
import { fail, ok } from "@/lib/server/http";

const roleSchema = z.object({
  role: z.enum(["Admin", "Seller", "Buyer", "Driver"]),
});

export async function POST(request: Request) {
  const parsed = roleSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid role selection.");

  try {
    return ok(await fetchAuthMutation(api.profiles.setActiveRole, parsed.data));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Role selection failed.", 403);
  }
}
