export type AuthFlowProfile = {
  user: { roles: string[] };
  activeRole?: string;
  needsRoleSelection: boolean;
};

export function dashboardPath(role?: string) {
  return `/dashboard/${(role ?? "buyer").toLowerCase()}`;
}

export function rolesForSession(profile: AuthFlowProfile) {
  return profile.needsRoleSelection ? profile.user.roles : [];
}
