import { describe, expect, it } from "vitest";
import { assertActiveRole, assertOwner } from "./authz";
import type { AuthProfile } from "./types";

const profile: AuthProfile = {
  user: {
    id: "u1",
    username: "maya",
    displayName: "Maya",
    email: "maya@seapedia.test",
    roles: ["Buyer", "Seller"],
  },
  activeRole: "Buyer",
  needsRoleSelection: false,
};

describe("authorization helpers", () => {
  it("uses active role instead of owned role list", () => {
    expect(() => assertActiveRole(profile, "Seller")).toThrow(
      "Active Seller role required.",
    );
  });

  it("rejects cross-owner mutations", () => {
    expect(() => assertOwner("seller-1", "seller-2", "Forbidden")).toThrow(
      "Forbidden",
    );
  });
});
