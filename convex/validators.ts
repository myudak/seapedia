import { v } from "convex/values";

export const roleValidator = v.union(
  v.literal("Admin"),
  v.literal("Seller"),
  v.literal("Buyer"),
  v.literal("Driver"),
);

export const categoryValidator = v.union(
  v.literal("Fashion"),
  v.literal("Food"),
  v.literal("Home"),
  v.literal("Gadget"),
);

export const deliveryMethodValidator = v.union(
  v.literal("Instant"),
  v.literal("Next Day"),
  v.literal("Regular"),
);

export const orderStatusValidator = v.union(
  v.literal("Sedang Dikemas"),
  v.literal("Menunggu Pengirim"),
  v.literal("Sedang Dikirim"),
  v.literal("Pesanan Selesai"),
  v.literal("Dikembalikan"),
);

export type Role = "Admin" | "Seller" | "Buyer" | "Driver";
