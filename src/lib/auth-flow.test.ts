import { describe, expect, it } from "vitest";
import { dashboardPath, rolesForSession } from "./auth-flow";

describe("post-auth routing", () => {
  it.each([
    ["Buyer", "/dashboard/buyer"],
    ["Seller", "/dashboard/seller"],
    ["Driver", "/dashboard/driver"],
    ["Admin", "/dashboard/admin"],
  ])("routes %s sessions to their workspace", (role, expected) => {
    expect(dashboardPath(role)).toBe(expected);
  });

  it("offers every owned role for a multi-role session", () => {
    expect(
      rolesForSession({
        user: { roles: ["Buyer", "Seller", "Driver"] },
        needsRoleSelection: true,
      }),
    ).toEqual(["Buyer", "Seller", "Driver"]);
  });

  it("does not reopen role selection for an established session", () => {
    expect(
      rolesForSession({
        user: { roles: ["Buyer", "Seller"] },
        activeRole: "Seller",
        needsRoleSelection: false,
      }),
    ).toEqual([]);
  });
});
