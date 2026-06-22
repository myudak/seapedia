import { beforeEach, describe, expect, it } from "vitest";
import { addCartItem, getState } from "./state";

describe("single-store cart rule", () => {
  beforeEach(() => {
    globalThis.__seapediaState = undefined;
  });

  it("rejects products from a different store while cart has existing items", () => {
    const state = getState();
    const buyer = state.users.find((user) => user.username === "buyer");
    const [firstProduct, secondProduct] = state.products;

    expect(buyer).toBeDefined();
    expect(firstProduct.storeId).not.toBe(secondProduct.storeId);

    addCartItem(buyer!.id, firstProduct.id, 1);

    expect(() => addCartItem(buyer!.id, secondProduct.id, 1)).toThrow(
      "Cart can only contain products from one store.",
    );
  });
});
