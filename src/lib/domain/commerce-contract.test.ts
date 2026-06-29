import { describe, expect, it } from "vitest";
import { assertCheckoutCapacity, assertSingleStore } from "./commerce";

describe("commerce transaction contracts", () => {
  it("rejects cart items from more than one store", () => {
    expect(() => assertSingleStore(["store-a", "store-a", "store-b"])).toThrow(
      "Cart can only contain products from one store.",
    );
  });

  it("rejects checkout that would make stock negative", () => {
    expect(() =>
      assertCheckoutCapacity({
        items: [{ name: "Coral Market Tote", stock: 1, quantity: 2 }],
        balance: 500000,
        total: 200000,
      }),
    ).toThrow("Insufficient stock for Coral Market Tote.");
  });

  it("rejects checkout that exceeds wallet balance", () => {
    expect(() =>
      assertCheckoutCapacity({
        items: [{ name: "Coral Market Tote", stock: 3, quantity: 1 }],
        balance: 1000,
        total: 200000,
      }),
    ).toThrow("Insufficient wallet balance.");
  });
});
