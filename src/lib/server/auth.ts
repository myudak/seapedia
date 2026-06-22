import { getProfileFromToken } from "@/lib/domain/state";
import { assertActiveRole } from "@/lib/domain/authz";
import type { Role } from "@/lib/domain/types";
import { readSessionToken } from "@/lib/server/session";

export async function requireActiveRole(role: Role) {
  const profile = getProfileFromToken(await readSessionToken());
  return assertActiveRole(profile, role);
}
