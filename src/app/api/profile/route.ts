import { api } from "../../../../convex/_generated/api";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { fail, ok } from "@/lib/server/http";

export async function GET() {
  try {
    const profile = await fetchAuthQuery(api.profiles.getProfile, {});
    return profile ? ok(profile) : fail("Authentication required.", 401);
  } catch {
    return fail("Authentication required.", 401);
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; displayName?: string };
  if (!body.username?.trim() || !body.displayName?.trim()) {
    return fail("Username and display name are required.");
  }

  try {
    const profileId = await fetchAuthMutation(api.profiles.bootstrap, {
      username: body.username,
      displayName: body.displayName,
    });
    return ok({ profileId }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Profile setup failed.", 401);
  }
}
