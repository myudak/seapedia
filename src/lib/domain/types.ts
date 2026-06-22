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

export const SESSION_COOKIE = "seapedia_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
