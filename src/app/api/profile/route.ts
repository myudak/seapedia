import { getProfileFromToken } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { readSessionToken } from "@/lib/server/session";

export async function GET() {
  const profile = getProfileFromToken(await readSessionToken());

  if (!profile) {
    return fail("Authentication required.", 401);
  }

  return ok(profile);
}
