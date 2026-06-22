import { z } from "zod";
import { registerUser } from "@/lib/domain/state";
import { roles } from "@/lib/domain/types";
import { fail, ok } from "@/lib/server/http";

const registerSchema = z.object({
  username: z.string().min(3),
  displayName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  roles: z.array(z.enum(roles)).min(1),
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid registration payload.");
  }

  try {
    return ok(await registerUser(parsed.data), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Registration failed.");
  }
}
