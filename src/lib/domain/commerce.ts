import type { CheckoutSummary, DeliveryMethod } from "./types";

export const PPN_RATE = 0.12;

export const mainOrderLifecycle = [
  "Sedang Dikemas",
  "Menunggu Pengirim",
  "Sedang Dikirim",
  "Pesanan Selesai",
  "Dikembalikan",
] as const;

export const deliveryFees: Record<DeliveryMethod, number> = {
  Instant: 20000,
  "Next Day": 12000,
  Regular: 8000,
};

export const deliverySlaDays: Record<DeliveryMethod, number> = {
  Instant: 0,
  "Next Day": 1,
  Regular: 3,
};

export function assertSingleStore(storeIds: readonly string[]) {
  if (new Set(storeIds).size > 1) {
    throw new Error("Cart can only contain products from one store.");
  }
}

export function assertCheckoutCapacity(input: {
  items: readonly { name: string; stock: number; quantity: number }[];
  balance: number;
  total: number;
}) {
  const unavailable = input.items.find((item) => item.quantity > item.stock);
  if (unavailable) {
    throw new Error(`Insufficient stock for ${unavailable.name}.`);
  }
  if (input.balance < input.total) {
    throw new Error("Insufficient wallet balance.");
  }
}

export function calculateCheckoutSummary(input: {
  subtotal: number;
  deliveryMethod: DeliveryMethod;
  discount?: number;
  discountCode?: string;
  discountType?: "Voucher" | "Promo";
}): CheckoutSummary {
  const discount = Math.min(input.discount ?? 0, input.subtotal);
  const taxableSubtotal = input.subtotal - discount;
  const ppn = Math.round(taxableSubtotal * PPN_RATE);
  const deliveryFee = deliveryFees[input.deliveryMethod];

  return {
    subtotal: input.subtotal,
    discount,
    deliveryFee,
    ppn,
    total: taxableSubtotal + deliveryFee + ppn,
    deliveryMethod: input.deliveryMethod,
    discountCode: input.discountCode,
    discountType: input.discountType,
  };
}
