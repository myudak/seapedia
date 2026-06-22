import type { AuthProfile, Role } from "./types";

export function ownsRole(profile: AuthProfile, role: Role) {
  return profile.user.roles.includes(role);
}

export function hasActiveRole(profile: AuthProfile, role: Role) {
  return profile.activeRole === role && ownsRole(profile, role);
}

export function assertActiveRole(profile: AuthProfile | null, role: Role) {
  if (!profile) {
    throw new Error("Authentication required.");
  }

  if (!hasActiveRole(profile, role)) {
    throw new Error(`Active ${role} role required.`);
  }

  return profile;
}

export function roleDashboard(role: Role) {
  return `/dashboard/${role.toLowerCase()}`;
}
