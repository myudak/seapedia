import { beforeEach, describe, expect, it } from "vitest";
import { getState, updateSellerProduct } from "./state";

describe("seller product ownership", () => {
  beforeEach(() => {
    globalThis.__seapediaState = undefined;
  });

  it("rejects updates to products owned by another seller", () => {
    const state = getState();
    const bima = state.users.find((user) => user.username === "seller");
    const maya = state.users.find((user) => user.username === "maya");
    const bimaProduct = state.products.find(
      (product) => product.sellerId === bima?.id,
    );

    expect(maya).toBeDefined();
    expect(bimaProduct).toBeDefined();
    expect(() =>
      updateSellerProduct(maya!.id, bimaProduct!.id, { stock: 99 }),
    ).toThrow("Product does not belong to this seller.");
  });
});
