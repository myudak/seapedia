import { beforeEach, describe, expect, it } from "vitest";
import { addCartItem, createCheckoutOrder, getBuyerWallet, getState } from "./state";

describe("checkout safeguards", () => {
  beforeEach(() => {
    globalThis.__seapediaState = undefined;
  });

  it("rejects checkout when buyer wallet is insufficient", () => {
    const state = getState();
    const buyer = state.users.find((user) => user.username === "buyer")!;
    const product = state.products[0];
    const wallet = getBuyerWallet(buyer.id);
    wallet.balance = 1;

    addCartItem(buyer.id, product.id, 1);

    expect(() => createCheckoutOrder(buyer.id, "Regular")).toThrow(
      "Insufficient wallet balance.",
    );
  });

  it("rejects checkout when stock would become negative", () => {
    const state = getState();
    const buyer = state.users.find((user) => user.username === "buyer")!;
    const product = state.products[0];
    product.stock = 0;

    addCartItem(buyer.id, product.id, 1);

    expect(() => createCheckoutOrder(buyer.id, "Regular")).toThrow(
      "Insufficient stock for Coral Market Tote.",
    );
  });
});
