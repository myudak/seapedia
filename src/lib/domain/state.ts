import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "crypto";
import { nanoid } from "nanoid";
import type {
  AppReview,
  AuthProfile,
  Product,
  PublicUser,
  Role,
  Session,
  StoreProfile,
  User,
} from "./types";
import { SESSION_TTL_MS } from "./types";

type AppState = {
  users: User[];
  sessions: Session[];
  appReviews: AppReview[];
  stores: StoreProfile[];
  products: Product[];
};

declare global {
  // eslint-disable-next-line no-var
  var __seapediaState: AppState | undefined;
}

function now() {
  return Date.now();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function seedUser(
  username: string,
  displayName: string,
  email: string,
  roles: Role[],
): User {
  return {
    id: randomUUID(),
    username,
    displayName,
    email,
    passwordHash: bcrypt.hashSync("seapedia123", 10),
    roles,
    createdAt: now(),
  };
}

function createInitialState(): AppState {
  const admin = seedUser("admin", "Admin Raya", "admin@seapedia.test", ["Admin"]);
  const maya = seedUser("maya", "Maya Multirole", "maya@seapedia.test", [
    "Buyer",
    "Seller",
    "Driver",
  ]);
  const seller = seedUser("seller", "Bima Seller", "seller@seapedia.test", [
    "Seller",
  ]);
  const buyer = seedUser("buyer", "Nadia Buyer", "buyer@seapedia.test", ["Buyer"]);
  const driver = seedUser("driver", "Rafi Driver", "driver@seapedia.test", [
    "Driver",
  ]);
  const firstStore = seedStore(seller.id, "Pasar Pagi Studio");
  const secondStore = seedStore(maya.id, "Kedai Timur");

  return {
    users: [admin, maya, seller, buyer, driver],
    sessions: [],
    appReviews: [
      {
        id: randomUUID(),
        reviewerName: "Dina",
        rating: 5,
        comment:
          "Role flow is clear, and the marketplace feels ready for a demo.",
        createdAt: now() - 86_400_000,
      },
      {
        id: randomUUID(),
        reviewerName: "Raka",
        rating: 4,
        comment: "Catalog is easy to scan even before logging in.",
        createdAt: now() - 43_200_000,
      },
    ],
    stores: [firstStore, secondStore],
    products: [
      seedProduct(firstStore, "Coral Market Tote", 129000, 18),
      seedProduct(secondStore, "Archipelago Coffee Set", 185000, 26),
    ],
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function seedStore(sellerId: string, name: string): StoreProfile {
  return {
    id: randomUUID(),
    sellerId,
    name,
    slug: slugify(name),
    description: `${name} brings curated Indonesian marketplace goods to SEAPEDIA.`,
    createdAt: now(),
    updatedAt: now(),
  };
}

function seedProduct(
  store: StoreProfile,
  name: string,
  price: number,
  stock: number,
): Product {
  return {
    id: randomUUID(),
    storeId: store.id,
    sellerId: store.sellerId,
    name,
    description: `${name} from ${store.name}, available for the public catalog.`,
    price,
    stock,
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    createdAt: now(),
    updatedAt: now(),
  };
}

export function getState() {
  if (!globalThis.__seapediaState) {
    globalThis.__seapediaState = createInitialState();
  }

  return globalThis.__seapediaState;
}

function publicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    roles: user.roles,
  };
}

export async function registerUser(input: {
  username: string;
  displayName: string;
  email: string;
  password: string;
  roles: Role[];
}) {
  const state = getState();
  const username = input.username.trim().toLowerCase();

  if (state.users.some((user) => user.username === username)) {
    throw new Error("Username is already used.");
  }

  const user: User = {
    id: randomUUID(),
    username,
    displayName: input.displayName.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(input.password, 10),
    roles: input.roles,
    createdAt: now(),
  };

  state.users.push(user);
  return publicUser(user);
}

export async function loginUser(username: string, password: string) {
  const state = getState();
  const user = state.users.find(
    (item) => item.username === username.trim().toLowerCase(),
  );

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid username or password.");
  }

  const token = nanoid(48);
  const session: Session = {
    id: randomUUID(),
    userId: user.id,
    tokenHash: hashToken(token),
    activeRole:
      user.roles.length === 1 || user.roles.includes("Admin")
        ? user.roles[0]
        : undefined,
    expiresAt: now() + SESSION_TTL_MS,
    createdAt: now(),
  };

  state.sessions.push(session);
  return { token, profile: profileFor(user, session) };
}

export function chooseActiveRole(token: string | undefined | null, role: Role) {
  if (!token) {
    throw new Error("Authentication required.");
  }

  const state = getState();
  const session = state.sessions.find(
    (item) =>
      item.tokenHash === hashToken(token) &&
      !item.revokedAt &&
      item.expiresAt > now(),
  );

  if (!session) {
    throw new Error("Session is no longer valid.");
  }

  const user = state.users.find((item) => item.id === session.userId);

  if (!user || !user.roles.includes(role)) {
    throw new Error("Role is not owned by this user.");
  }

  if (role === "Admin" && !user.roles.includes("Admin")) {
    throw new Error("Admin role is not available.");
  }

  session.activeRole = role;
  return profileFor(user, session);
}

export function profileFor(user: User, session: Session): AuthProfile {
  return {
    user: publicUser(user),
    activeRole: session.activeRole,
    needsRoleSelection:
      user.roles.length > 1 &&
      !user.roles.includes("Admin") &&
      session.activeRole === undefined,
  };
}

export function getProfileFromToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const state = getState();
  const tokenHash = hashToken(token);
  const session = state.sessions.find(
    (item) =>
      item.tokenHash === tokenHash &&
      !item.revokedAt &&
      item.expiresAt > now(),
  );

  if (!session) {
    return null;
  }

  const user = state.users.find((item) => item.id === session.userId);
  return user ? profileFor(user, session) : null;
}

export function logoutToken(token?: string | null) {
  if (!token) {
    return;
  }

  const state = getState();
  const session = state.sessions.find((item) => item.tokenHash === hashToken(token));

  if (session && !session.revokedAt) {
    session.revokedAt = now();
  }
}

function publicText(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function listAppReviews() {
  return [...getState().appReviews].sort((left, right) => right.createdAt - left.createdAt);
}

export function createAppReview(input: {
  reviewerName: string;
  rating: number;
  comment: string;
}) {
  const review: AppReview = {
    id: randomUUID(),
    reviewerName: publicText(input.reviewerName, 60),
    rating: input.rating,
    comment: publicText(input.comment, 500),
    createdAt: now(),
  };

  getState().appReviews.unshift(review);
  return review;
}

export function getStoreForSeller(sellerId: string) {
  return getState().stores.find((store) => store.sellerId === sellerId) ?? null;
}

export function upsertSellerStore(
  sellerId: string,
  input: { name: string; description: string },
) {
  const state = getState();
  const name = publicText(input.name, 80);
  const slug = slugify(name);
  const existingByName = state.stores.find(
    (store) => store.slug === slug && store.sellerId !== sellerId,
  );

  if (existingByName) {
    throw new Error("Store name is already used.");
  }

  const existing = getStoreForSeller(sellerId);

  if (existing) {
    existing.name = name;
    existing.slug = slug;
    existing.description = publicText(input.description, 240);
    existing.updatedAt = now();
    return existing;
  }

  const store: StoreProfile = {
    id: randomUUID(),
    sellerId,
    name,
    slug,
    description: publicText(input.description, 240),
    createdAt: now(),
    updatedAt: now(),
  };

  state.stores.push(store);
  return store;
}

export function listSellerProducts(sellerId: string) {
  return getState().products.filter((product) => product.sellerId === sellerId);
}

export function createSellerProduct(
  sellerId: string,
  input: {
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
  },
) {
  const store = getStoreForSeller(sellerId);

  if (!store) {
    throw new Error("Create a store before adding products.");
  }

  const product: Product = {
    id: randomUUID(),
    sellerId,
    storeId: store.id,
    name: publicText(input.name, 100),
    description: publicText(input.description, 500),
    price: input.price,
    stock: input.stock,
    imageUrl:
      input.imageUrl?.trim() ||
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    createdAt: now(),
    updatedAt: now(),
  };

  getState().products.push(product);
  return product;
}
