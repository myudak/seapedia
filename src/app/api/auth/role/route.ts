import { z } from "zod";
import { chooseActiveRole } from "@/lib/domain/state";
import { roles } from "@/lib/domain/types";
import { fail, ok } from "@/lib/server/http";
import { readSessionToken } from "@/lib/server/session";

const roleSchema = z.object({
  role: z.enum(roles),
});

export async function POST(request: Request) {
  const parsed = roleSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid role selection.");
  }

  try {
    return ok(chooseActiveRole(await readSessionToken(), parsed.data.role));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Role selection failed.", 403);
  }
}
