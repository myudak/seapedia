import { describe, expect, it, beforeEach } from "vitest";
import { loginUser } from "./state";

describe("active role selection", () => {
  beforeEach(() => {
    globalThis.__seapediaState = undefined;
  });

  it("requires non-admin multi-role users to choose an active role after login", async () => {
    const { profile } = await loginUser("maya", "seapedia123");

    expect(profile.user.roles).toEqual(["Buyer", "Seller", "Driver"]);
    expect(profile.activeRole).toBeUndefined();
    expect(profile.needsRoleSelection).toBe(true);
  });
});
