import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { fail, ok } from "@/lib/server/http";

const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9._-]+$/),
  displayName: z.string().trim().min(2).max(80),
});

export async function GET() {
  try {
    const profile = await fetchAuthQuery(api.profiles.getProfile, {});
    return profile ? ok(profile) : fail("Authentication required.", 401);
  } catch {
    return fail("Authentication required.", 401);
  }
}

export async function POST(request: Request) {
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return fail("Username or display name is invalid.");
  }

  try {
    const profileId = await fetchAuthMutation(api.profiles.bootstrap, {
      username: parsed.data.username,
      displayName: parsed.data.displayName,
    });
    return ok({ profileId }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Profile setup failed.", 401);
  }
}
