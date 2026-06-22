export const roles = ["Admin", "Seller", "Buyer", "Driver"] as const;

export type Role = (typeof roles)[number];

export type User = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  roles: Role[];
  createdAt: number;
};

export type Session = {
  id: string;
  userId: string;
  tokenHash: string;
  activeRole?: Role;
  expiresAt: number;
  revokedAt?: number;
  createdAt: number;
};

export type PublicUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  roles: Role[];
};

export type AuthProfile = {
  user: PublicUser;
  activeRole?: Role;
  needsRoleSelection: boolean;
};

export type AppReview = {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: number;
};

export type StoreProfile = {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  description: string;
  createdAt: number;
  updatedAt: number;
};

export type Product = {
  id: string;
  storeId: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
};

export type CatalogProduct = Product & {
  storeName: string;
  storeSlug: string;
};

export type Wallet = {
  id: string;
  buyerId: string;
  balance: number;
  updatedAt: number;
};

export type WalletTransaction = {
  id: string;
  buyerId: string;
  type: "topup" | "checkout" | "refund";
  amount: number;
  note: string;
  createdAt: number;
};

export type DeliveryAddress = {
  id: string;
  buyerId: string;
  label: string;
  recipient: string;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
  createdAt: number;
};

export type CartItem = {
  id: string;
  buyerId: string;
  storeId: string;
  productId: string;
  quantity: number;
  updatedAt: number;
};

export type CartSummary = {
  storeId?: string;
  storeName?: string;
  items: Array<
    CartItem & {
      productName: string;
      price: number;
      lineTotal: number;
    }
  >;
  subtotal: number;
};

export const deliveryMethods = ["Instant", "Next Day", "Regular"] as const;

export type DeliveryMethod = (typeof deliveryMethods)[number];

export type CheckoutSummary = {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  ppn: number;
  total: number;
  deliveryMethod: DeliveryMethod;
};

export const orderStatuses = [
  "Sedang Dikemas",
  "Menunggu Pengirim",
  "Sedang Dikirim",
  "Pesanan Selesai",
  "Dikembalikan",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type OrderItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type Order = CheckoutSummary & {
  id: string;
  buyerId: string;
  sellerId: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  status: OrderStatus;
  dueAt: number;
  createdAt: number;
  refundedAt?: number;
  completedAt?: number;
};

export type OrderStatusEntry = {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string;
  createdAt: number;
};

export type Voucher = {
  id: string;
  code: string;
  percentOff: number;
  remainingUsage: number;
  expiresAt: number;
  createdAt: number;
};

export type Promo = {
  id: string;
  code: string;
  amountOff: number;
  expiresAt: number;
  createdAt: number;
};

export const SESSION_COOKIE = "seapedia_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
