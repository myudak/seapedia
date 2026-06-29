import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  categoryValidator,
  deliveryMethodValidator,
  orderStatusValidator,
  roleValidator,
} from "./validators";

export default defineSchema({
  profiles: defineTable({
    authUserId: v.string(),
    username: v.string(),
    displayName: v.string(),
    roles: v.array(roleValidator),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_user", ["authUserId"])
    .index("by_username", ["username"]),

  sessionRoles: defineTable({
    sessionId: v.string(),
    authUserId: v.string(),
    activeRole: roleValidator,
    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_auth_user", ["authUserId"]),

  stores: defineTable({
    sellerId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  products: defineTable({
    publicId: v.string(),
    storeId: v.id("stores"),
    sellerId: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(),
    imageUrl: v.string(),
    galleryImages: v.array(v.string()),
    category: categoryValidator,
    rating: v.number(),
    soldCount: v.number(),
    discountLabel: v.optional(v.string()),
    featured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_public_id", ["publicId"])
    .index("by_store", ["storeId"])
    .index("by_seller", ["sellerId"])
    .index("by_category", ["category"]),

  appReviews: defineTable({
    reviewerName: v.string(),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  wallets: defineTable({
    buyerId: v.string(),
    balance: v.number(),
    updatedAt: v.number(),
  }).index("by_buyer", ["buyerId"]),

  walletTransactions: defineTable({
    buyerId: v.string(),
    type: v.union(v.literal("topup"), v.literal("checkout"), v.literal("refund")),
    amount: v.number(),
    note: v.string(),
    createdAt: v.number(),
  }).index("by_buyer", ["buyerId"]),

  addresses: defineTable({
    buyerId: v.string(),
    label: v.string(),
    recipient: v.string(),
    phone: v.string(),
    fullAddress: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    isDefault: v.boolean(),
    createdAt: v.number(),
  }).index("by_buyer", ["buyerId"]),

  cartItems: defineTable({
    buyerId: v.string(),
    storeId: v.id("stores"),
    productId: v.id("products"),
    quantity: v.number(),
    updatedAt: v.number(),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_buyer_product", ["buyerId", "productId"])
    .index("by_product", ["productId"]),

  orders: defineTable({
    buyerId: v.string(),
    sellerId: v.string(),
    storeId: v.id("stores"),
    storeName: v.string(),
    addressId: v.id("addresses"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        publicId: v.string(),
        productName: v.string(),
        price: v.number(),
        quantity: v.number(),
        lineTotal: v.number(),
      }),
    ),
    deliveryMethod: deliveryMethodValidator,
    status: orderStatusValidator,
    subtotal: v.number(),
    discount: v.number(),
    deliveryFee: v.number(),
    ppn: v.number(),
    total: v.number(),
    discountCode: v.optional(v.string()),
    discountType: v.optional(v.union(v.literal("Voucher"), v.literal("Promo"))),
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
    status: orderStatusValidator,
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
    driverId: v.optional(v.string()),
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
