import { z } from "zod";
import { advanceSystemTime, getCurrentTime } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

const advanceSchema = z.object({
  days: z.number().int().min(1).max(30),
});

export async function GET() {
  try {
    await requireActiveRole("Admin");
    return ok({ currentTime: getCurrentTime() });
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
    await requireActiveRole("Admin");
    return ok(advanceSystemTime(parsed.data.days));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Time simulation failed.", 403);
  }
}
