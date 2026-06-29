import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { requireActiveRole } from "./model/auth";

const walletResult = v.object({ id: v.string(), buyerId: v.string(), balance: v.number() });
const transactionResult = v.object({
  id: v.string(),
  type: v.union(v.literal("topup"), v.literal("checkout"), v.literal("refund")),
  amount: v.number(),
  note: v.string(),
  createdAt: v.number(),
});
const addressResult = v.object({
  id: v.string(), label: v.string(), recipient: v.string(), phone: v.string(),
  fullAddress: v.string(), lat: v.optional(v.number()), lng: v.optional(v.number()), isDefault: v.boolean(),
});
const cartItemResult = v.object({
  id: v.string(), productId: v.string(), storeId: v.string(), productName: v.string(),
  price: v.number(), quantity: v.number(), lineTotal: v.number(),
});
const cartResult = v.object({
  storeId: v.optional(v.string()), storeName: v.optional(v.string()),
  items: v.array(cartItemResult), subtotal: v.number(),
});

async function cartSummary(ctx: QueryCtx | MutationCtx, buyerId: string) {
  const rows = await ctx.db.query("cartItems").withIndex("by_buyer", (q) => q.eq("buyerId", buyerId)).collect();
  const hydrated = await Promise.all(rows.map(async (row) => ({ row, product: await ctx.db.get("products", row.productId) })));
  const valid = hydrated.filter((entry) => entry.product !== null);
  const store = valid[0] ? await ctx.db.get("stores", valid[0].row.storeId) : null;
  const items = valid.map(({ row, product }) => ({
    id: row._id,
    productId: product!.publicId,
    storeId: row.storeId,
    productName: product!.name,
    price: product!.price,
    quantity: row.quantity,
    lineTotal: product!.price * row.quantity,
  }));
  return {
    storeId: store?._id,
    storeName: store?.name,
    items,
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
}

export const getWallet = query({
  args: {},
  returns: v.object({ wallet: walletResult, transactions: v.array(transactionResult) }),
  handler: async (ctx) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    const wallet = await ctx.db.query("wallets").withIndex("by_buyer", (q) => q.eq("buyerId", profile.authUserId)).unique();
    const transactions = await ctx.db.query("walletTransactions").withIndex("by_buyer", (q) => q.eq("buyerId", profile.authUserId)).order("desc").take(100);
    return {
      wallet: { id: wallet?._id ?? "", buyerId: profile.authUserId, balance: wallet?.balance ?? 0 },
      transactions: transactions.map((row) => ({ id: row._id, type: row.type, amount: row.amount, note: row.note, createdAt: row.createdAt })),
    };
  },
});

export const topUpWallet = mutation({
  args: { amount: v.number() },
  returns: v.object({ wallet: walletResult, transaction: transactionResult }),
  handler: async (ctx, { amount }) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new ConvexError({ code: "INVALID_AMOUNT", message: "Top-up amount must be positive." });
    const now = Date.now();
    const wallet = await ctx.db.query("wallets").withIndex("by_buyer", (q) => q.eq("buyerId", profile.authUserId)).unique();
    const balance = (wallet?.balance ?? 0) + amount;
    const walletId = wallet?._id ?? await ctx.db.insert("wallets", { buyerId: profile.authUserId, balance, updatedAt: now });
    if (wallet) await ctx.db.patch("wallets", wallet._id, { balance, updatedAt: now });
    const transactionId = await ctx.db.insert("walletTransactions", { buyerId: profile.authUserId, type: "topup", amount, note: "Wallet top-up", createdAt: now });
    return { wallet: { id: walletId, buyerId: profile.authUserId, balance }, transaction: { id: transactionId, type: "topup" as const, amount, note: "Wallet top-up", createdAt: now } };
  },
});

export const listAddresses = query({
  args: {},
  returns: v.array(addressResult),
  handler: async (ctx) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    const rows = await ctx.db.query("addresses").withIndex("by_buyer", (q) => q.eq("buyerId", profile.authUserId)).collect();
    return rows.map((row) => ({ id: row._id, label: row.label, recipient: row.recipient, phone: row.phone, fullAddress: row.fullAddress, lat: row.lat, lng: row.lng, isDefault: row.isDefault }));
  },
});

export const createAddress = mutation({
  args: { label: v.string(), recipient: v.string(), phone: v.string(), fullAddress: v.string(), lat: v.optional(v.number()), lng: v.optional(v.number()), isDefault: v.optional(v.boolean()) },
  returns: addressResult,
  handler: async (ctx, args) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    const existing = await ctx.db.query("addresses").withIndex("by_buyer", (q) => q.eq("buyerId", profile.authUserId)).collect();
    const isDefault = args.isDefault ?? existing.length === 0;
    if (isDefault) await Promise.all(existing.filter((row) => row.isDefault).map((row) => ctx.db.patch("addresses", row._id, { isDefault: false })));
    const id = await ctx.db.insert("addresses", { buyerId: profile.authUserId, label: args.label.trim(), recipient: args.recipient.trim(), phone: args.phone.trim(), fullAddress: args.fullAddress.trim(), lat: args.lat, lng: args.lng, isDefault, createdAt: Date.now() });
    return { id, label: args.label.trim(), recipient: args.recipient.trim(), phone: args.phone.trim(), fullAddress: args.fullAddress.trim(), lat: args.lat, lng: args.lng, isDefault };
  },
});

export const getCart = query({
  args: {},
  returns: cartResult,
  handler: async (ctx) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    return await cartSummary(ctx, profile.authUserId);
  },
});

export const addCartItem = mutation({
  args: { productId: v.string(), quantity: v.number() },
  returns: cartResult,
  handler: async (ctx, { productId, quantity }) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new ConvexError({ code: "INVALID_QUANTITY", message: "Quantity must be positive." });
    const product = await ctx.db.query("products").withIndex("by_public_id", (q) => q.eq("publicId", productId)).unique();
    if (!product) throw new ConvexError({ code: "NOT_FOUND", message: "Product not found." });
    if (product.stock < quantity) throw new ConvexError({ code: "OUT_OF_STOCK", message: `Insufficient stock for ${product.name}.` });
    const cart = await ctx.db.query("cartItems").withIndex("by_buyer", (q) => q.eq("buyerId", profile.authUserId)).collect();
    if (cart.some((item) => item.storeId !== product.storeId)) throw new ConvexError({ code: "CROSS_STORE_CART", message: "Cart can only contain products from one store." });
    const current = await ctx.db.query("cartItems").withIndex("by_buyer_product", (q) => q.eq("buyerId", profile.authUserId).eq("productId", product._id)).unique();
    const nextQuantity = (current?.quantity ?? 0) + quantity;
    if (nextQuantity > product.stock) throw new ConvexError({ code: "OUT_OF_STOCK", message: `Insufficient stock for ${product.name}.` });
    if (current) await ctx.db.patch("cartItems", current._id, { quantity: nextQuantity, updatedAt: Date.now() });
    else await ctx.db.insert("cartItems", { buyerId: profile.authUserId, storeId: product.storeId, productId: product._id, quantity, updatedAt: Date.now() });
    return await cartSummary(ctx, profile.authUserId);
  },
});

export const updateCartItem = mutation({
  args: { cartItemId: v.id("cartItems"), quantity: v.number() },
  returns: cartResult,
  handler: async (ctx, { cartItemId, quantity }) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    const item = await ctx.db.get("cartItems", cartItemId);
    if (!item || item.buyerId !== profile.authUserId) throw new ConvexError({ code: "FORBIDDEN", message: "Cart item is unavailable." });
    const product = await ctx.db.get("products", item.productId);
    if (!product || quantity > product.stock) throw new ConvexError({ code: "OUT_OF_STOCK", message: `Insufficient stock for ${product?.name ?? "product"}.` });
    if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new ConvexError({ code: "INVALID_QUANTITY", message: "Quantity must be positive." });
    await ctx.db.patch("cartItems", item._id, { quantity, updatedAt: Date.now() });
    return await cartSummary(ctx, profile.authUserId);
  },
});

export const removeCartItem = mutation({
  args: { cartItemId: v.id("cartItems") },
  returns: cartResult,
  handler: async (ctx, { cartItemId }) => {
    const { profile } = await requireActiveRole(ctx, "Buyer");
    const item = await ctx.db.get("cartItems", cartItemId);
    if (!item || item.buyerId !== profile.authUserId) throw new ConvexError({ code: "FORBIDDEN", message: "Cart item is unavailable." });
    await ctx.db.delete("cartItems", item._id);
    return await cartSummary(ctx, profile.authUserId);
  },
});
