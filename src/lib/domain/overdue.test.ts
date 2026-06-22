import { beforeEach, describe, expect, it } from "vitest";
import {
  addCartItem,
  advanceSystemTime,
  createCheckoutOrder,
  getBuyerWallet,
  getState,
  handleOverdueOrders,
} from "./state";

describe("overdue handling", () => {
  beforeEach(() => {
    globalThis.__seapediaState = undefined;
  });

  it("does not double refund or double restore stock for the same order", () => {
    const state = getState();
    const buyer = state.users.find((user) => user.username === "buyer")!;
    const product = state.products[0];
    const originalStock = product.stock;

    addCartItem(buyer.id, product.id, 1);
    const order = createCheckoutOrder(buyer.id, "Instant");
    const balanceAfterCheckout = getBuyerWallet(buyer.id).balance;

    advanceSystemTime(1);
    handleOverdueOrders();
    handleOverdueOrders();

    expect(getBuyerWallet(buyer.id).balance).toBe(
      balanceAfterCheckout + order.total,
    );
    expect(product.stock).toBe(originalStock);
    expect(order.status).toBe("Dikembalikan");
  });
});
