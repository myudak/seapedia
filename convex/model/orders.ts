import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { deliveryMethodValidator, orderStatusValidator } from "../validators";

export const orderResult = v.object({
  id: v.string(), buyerId: v.string(), sellerId: v.string(), storeId: v.string(), storeName: v.string(), addressId: v.string(),
  items: v.array(v.object({ productId: v.string(), productName: v.string(), price: v.number(), quantity: v.number(), lineTotal: v.number() })),
  deliveryMethod: deliveryMethodValidator, status: orderStatusValidator,
  subtotal: v.number(), discount: v.number(), deliveryFee: v.number(), ppn: v.number(), total: v.number(),
  discountCode: v.optional(v.string()), discountType: v.optional(v.union(v.literal("Voucher"), v.literal("Promo"))),
  dueAt: v.number(), refundedAt: v.optional(v.number()), completedAt: v.optional(v.number()), createdAt: v.number(),
});

export const historyResult = v.object({ id: v.string(), orderId: v.string(), status: orderStatusValidator, note: v.string(), createdAt: v.number() });

export function mapOrder(order: Doc<"orders">) {
  return {
    id: order._id,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    storeId: order.storeId,
    storeName: order.storeName,
    addressId: order.addressId,
    items: order.items.map((item) => ({ productId: item.publicId, productName: item.productName, price: item.price, quantity: item.quantity, lineTotal: item.lineTotal })),
    deliveryMethod: order.deliveryMethod,
    status: order.status,
    subtotal: order.subtotal,
    discount: order.discount,
    deliveryFee: order.deliveryFee,
    ppn: order.ppn,
    total: order.total,
    discountCode: order.discountCode,
    discountType: order.discountType,
    dueAt: order.dueAt,
    refundedAt: order.refundedAt,
    completedAt: order.completedAt,
    createdAt: order.createdAt,
  };
}

export function mapHistory(row: Doc<"orderStatusHistory">) {
  return { id: row._id, orderId: row.orderId, status: row.status, note: row.note, createdAt: row.createdAt };
}
