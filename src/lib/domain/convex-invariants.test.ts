import { describe, expect, it } from "vitest";
import { publicProducts } from "../seed/public-products";
import { canClaimDeliveryJob, isOrderRefundable } from "./convex-invariants";

describe("Convex transaction invariants", () => {
  it("allows only one driver to claim an available order", () => {
    expect(canClaimDeliveryJob({ jobStatus: "available", orderStatus: "Menunggu Pengirim" })).toBe(true);
    expect(canClaimDeliveryJob({ jobStatus: "taken", driverId: "driver-a", orderStatus: "Sedang Dikirim" })).toBe(false);
    expect(canClaimDeliveryJob({ jobStatus: "available", driverId: "driver-a", orderStatus: "Menunggu Pengirim" })).toBe(false);
  });

  it("never refunds a returned or previously refunded order twice", () => {
    const now = 2_000;
    expect(isOrderRefundable({ status: "Sedang Dikirim", dueAt: 1_000 }, now)).toBe(true);
    expect(isOrderRefundable({ status: "Dikembalikan", dueAt: 1_000, refundedAt: 1_500 }, now)).toBe(false);
    expect(isOrderRefundable({ status: "Pesanan Selesai", dueAt: 1_000 }, now)).toBe(false);
  });

  it("keeps seed product identities unique for idempotent upserts", () => {
    expect(new Set(publicProducts.map((product) => product.id))).toHaveLength(32);
    expect(new Set(publicProducts.map((product) => `${product.storeSlug}:${product.id}`))).toHaveLength(32);
  });
});
