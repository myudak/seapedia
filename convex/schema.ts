import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const role = v.union(
  v.literal("Admin"),
  v.literal("Seller"),
  v.literal("Buyer"),
  v.literal("Driver"),
);

const orderStatus = v.union(
  v.literal("Sedang Dikemas"),
  v.literal("Menunggu Pengirim"),
  v.literal("Sedang Dikirim"),
  v.literal("Pesanan Selesai"),
  v.literal("Dikembalikan"),
);

export default defineSchema({
  users: defineTable({
    username: v.string(),
    displayName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    passwordHash: v.string(),
    roles: v.array(role),
    createdAt: v.number(),
  }).index("by_username", ["username"]),

  sessions: defineTable({
    userId: v.id("users"),
    tokenHash: v.string(),
    activeRole: v.optional(role),
    expiresAt: v.number(),
    revokedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_token", ["tokenHash"])
    .index("by_user", ["userId"]),

  stores: defineTable({
    sellerId: v.id("users"),
    name: v.string(),
    description: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_name", ["name"]),

  products: defineTable({
    storeId: v.id("stores"),
    sellerId: v.id("users"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(),
    imageUrl: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_store", ["storeId"])
    .index("by_seller", ["sellerId"]),

  appReviews: defineTable({
    reviewerName: v.string(),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  wallets: defineTable({
    buyerId: v.id("users"),
    balance: v.number(),
    updatedAt: v.number(),
  }).index("by_buyer", ["buyerId"]),

  walletTransactions: defineTable({
    buyerId: v.id("users"),
    type: v.union(v.literal("topup"), v.literal("checkout"), v.literal("refund")),
    amount: v.number(),
    note: v.string(),
    createdAt: v.number(),
  }).index("by_buyer", ["buyerId"]),

  addresses: defineTable({
    buyerId: v.id("users"),
    label: v.string(),
    recipient: v.string(),
    phone: v.string(),
    fullAddress: v.string(),
    isDefault: v.boolean(),
    createdAt: v.number(),
  }).index("by_buyer", ["buyerId"]),

  cartItems: defineTable({
    buyerId: v.id("users"),
    storeId: v.id("stores"),
    productId: v.id("products"),
    quantity: v.number(),
    updatedAt: v.number(),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_buyer_product", ["buyerId", "productId"]),

  orders: defineTable({
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    storeId: v.id("stores"),
    deliveryMethod: v.union(
      v.literal("Instant"),
      v.literal("Next Day"),
      v.literal("Regular"),
    ),
    status: orderStatus,
    subtotal: v.number(),
    discount: v.number(),
    deliveryFee: v.number(),
    ppn: v.number(),
    total: v.number(),
    discountCode: v.optional(v.string()),
    dueAt: v.number(),
    refundedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_status", ["status"]),

  orderStatusHistory: defineTable({
    orderId: v.id("orders"),
    status: orderStatus,
    note: v.string(),
    createdAt: v.number(),
  }).index("by_order", ["orderId"]),

  vouchers: defineTable({
    code: v.string(),
    percentOff: v.number(),
    remainingUsage: v.number(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  promos: defineTable({
    code: v.string(),
    amountOff: v.number(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  deliveryJobs: defineTable({
    orderId: v.id("orders"),
    driverId: v.optional(v.id("users")),
    status: v.union(
      v.literal("available"),
      v.literal("taken"),
      v.literal("completed"),
    ),
    earning: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_driver", ["driverId"])
    .index("by_status", ["status"]),

  systemSettings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
