import { beforeEach, describe, expect, it } from "vitest";
import { createAppReview, loginUser } from "./state";

describe("security hardening", () => {
  beforeEach(() => {
    globalThis.__seapediaState = undefined;
  });

  it("stores public review script payload as safe text", () => {
    const review = createAppReview({
      reviewerName: "Mallory",
      rating: 1,
      comment: "<script>alert(1)</script>",
    });

    expect(review.comment).not.toContain("<script>");
    expect(review.comment).toContain("&lt;script&gt;");
  });

  it("does not authenticate SQL-like login payloads", async () => {
    await expect(loginUser("' OR 1=1 --", "whatever")).rejects.toThrow(
      "Invalid username or password.",
    );
  });
});
