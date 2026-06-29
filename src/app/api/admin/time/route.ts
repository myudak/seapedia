import { z } from "zod";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

const advanceSchema = z.object({
  days: z.number().int().min(1).max(30),
});

export async function GET() {
  try {
    return ok(await fetchAuthQuery(api.admin.getTime, {}));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Admin role required.", 403);
  }
}

export async function POST(request: Request) {
  const parsed = advanceSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid time simulation payload.");
  }

  try {
    return ok(await fetchAuthMutation(api.admin.advanceTime, parsed.data));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Time simulation failed.", 403);
  }
}
