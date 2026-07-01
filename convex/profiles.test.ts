import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import { createConvexTest, testIdentity } from "./test.setup";

describe("Convex test harness", () => {
  it("runs authenticated queries against an isolated schema", async () => {
    const backend = createConvexTest();
    const identity = testIdentity("buyer-test");

    await backend.run(async (ctx) => {
      await ctx.db.insert("profiles", {
        authUserId: identity.subject,
        username: "buyer-test",
        displayName: "Buyer Test",
        roles: ["Buyer"],
        createdAt: 1,
        updatedAt: 1,
      });
    });

    const profile = await backend
      .withIdentity(identity)
      .query(api.profiles.getProfile, {});

    expect(profile).toMatchObject({
      user: {
        id: "buyer-test",
        username: "buyer-test",
        roles: ["Buyer"],
      },
      activeRole: "Buyer",
      needsRoleSelection: false,
    });
  });
});
