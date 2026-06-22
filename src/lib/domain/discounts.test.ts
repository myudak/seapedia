import { beforeEach, describe, expect, it } from "vitest";
import {
  addCartItem,
  createPromo,
  createVoucher,
  getState,
  previewCheckout,
} from "./state";

describe("discount validation", () => {
  beforeEach(() => {
    globalThis.__seapediaState = undefined;
  });

  function prepareBuyerCart() {
    const state = getState();
    const buyer = state.users.find((user) => user.username === "buyer")!;
    addCartItem(buyer.id, state.products[0].id, 1);
    return buyer;
  }

  it("rejects expired vouchers", () => {
    const buyer = prepareBuyerCart();
    createVoucher({
      code: "EXPIRED",
      percentOff: 10,
      remainingUsage: 3,
      expiresAt: Date.now() - 1000,
    });

    expect(() => previewCheckout(buyer.id, "Regular", "EXPIRED")).toThrow(
      "Voucher is expired.",
    );
  });

  it("rejects vouchers with no remaining usage", () => {
    const buyer = prepareBuyerCart();
    createVoucher({
      code: "EMPTY",
      percentOff: 10,
      remainingUsage: 0,
      expiresAt: Date.now() + 1000,
    });

    expect(() => previewCheckout(buyer.id, "Regular", "EMPTY")).toThrow(
      "Voucher has no remaining usage.",
    );
  });

  it("rejects expired promos", () => {
    const buyer = prepareBuyerCart();
    createPromo({
      code: "OLDPROMO",
      amountOff: 5000,
      expiresAt: Date.now() - 1000,
    });

    expect(() => previewCheckout(buyer.id, "Regular", "OLDPROMO")).toThrow(
      "Promo is expired.",
    );
  });
});
