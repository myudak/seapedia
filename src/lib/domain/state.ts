import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "crypto";
import { nanoid } from "nanoid";
import { calculateCheckoutSummary } from "./commerce";
import { deliverySlaDays } from "./commerce";
import type {
  AppReview,
  AuthProfile,
  CartItem,
  CartSummary,
  CatalogProduct,
  DeliveryAddress,
  Order,
  OrderStatus,
  OrderStatusEntry,
  Product,
  PublicUser,
  Role,
  Session,
  StoreProfile,
  User,
  Promo,
  Voucher,
  Wallet,
  WalletTransaction,
  DeliveryMethod,
  DeliveryJob,
} from "./types";
import { SESSION_TTL_MS } from "./types";

type AppState = {
  users: User[];
  sessions: Session[];
  appReviews: AppReview[];
  stores: StoreProfile[];
  products: Product[];
  wallets: Wallet[];
  walletTransactions: WalletTransaction[];
  addresses: DeliveryAddress[];
  cartItems: CartItem[];
  orders: Order[];
  orderStatusHistory: OrderStatusEntry[];
  vouchers: Voucher[];
  promos: Promo[];
  deliveryJobs: DeliveryJob[];
  systemTime?: number;
};

declare global {
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
      seedProduct("prd-coral-tote", firstStore, "Coral Market Tote", 129000, 18),
      seedProduct(
        "prd-archipelago-coffee",
        secondStore,
        "Archipelago Coffee Set",
        185000,
        26,
      ),
      seedProduct("prd-rattan-lamp", firstStore, "Rattan Desk Lamp", 249000, 9),
      seedProduct(
        "prd-batik-organizer",
        secondStore,
        "Batik Cable Organizer",
        79000,
        31,
      ),
    ],
    wallets: [
      {
        id: randomUUID(),
        buyerId: buyer.id,
        balance: 650000,
        updatedAt: now(),
      },
      {
        id: randomUUID(),
        buyerId: maya.id,
        balance: 850000,
        updatedAt: now(),
      },
    ],
    walletTransactions: [],
    addresses: [
      {
        id: randomUUID(),
        buyerId: buyer.id,
        label: "Home",
        recipient: "Nadia Buyer",
        phone: "081234567890",
        fullAddress: "Jl. Merdeka No. 18, Jakarta",
        isDefault: true,
        createdAt: now(),
      },
    ],
    cartItems: [],
    orders: [],
    orderStatusHistory: [],
    vouchers: [
      {
        id: randomUUID(),
        code: "HEMAT12",
        percentOff: 12,
        remainingUsage: 10,
        expiresAt: now() + 7 * 86_400_000,
        createdAt: now(),
      },
    ],
    promos: [
      {
        id: randomUUID(),
        code: "ONGKIR8K",
        amountOff: 8000,
        expiresAt: now() + 5 * 86_400_000,
        createdAt: now(),
      },
    ],
    deliveryJobs: [],
    systemTime: now(),
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
  id: string,
  store: StoreProfile,
  name: string,
  price: number,
  stock: number,
): Product {
  return {
    id,
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

export function updateSellerProduct(
  sellerId: string,
  productId: string,
  input: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
  }>,
) {
  const product = getState().products.find((item) => item.id === productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  if (product.sellerId !== sellerId) {
    throw new Error("Product does not belong to this seller.");
  }

  if (input.name !== undefined) {
    product.name = publicText(input.name, 100);
  }
  if (input.description !== undefined) {
    product.description = publicText(input.description, 500);
  }
  if (input.price !== undefined) {
    product.price = input.price;
  }
  if (input.stock !== undefined) {
    product.stock = input.stock;
  }
  if (input.imageUrl !== undefined) {
    product.imageUrl = input.imageUrl;
  }

  product.updatedAt = now();
  return product;
}

export function deleteSellerProduct(sellerId: string, productId: string) {
  const state = getState();
  const index = state.products.findIndex((item) => item.id === productId);

  if (index === -1) {
    throw new Error("Product not found.");
  }

  const [deleted] = state.products.slice(index, index + 1);

  if (deleted.sellerId !== sellerId) {
    throw new Error("Product does not belong to this seller.");
  }

  state.products.splice(index, 1);
  return deleted;
}

export function listCatalogProducts(): CatalogProduct[] {
  const state = getState();
  return state.products.map((product) => {
    const store = state.stores.find((item) => item.id === product.storeId);
    return {
      ...product,
      storeName: store?.name ?? "Unknown Store",
      storeSlug: store?.slug ?? "unknown-store",
    };
  });
}

export function getCatalogProduct(productId: string) {
  return listCatalogProducts().find((product) => product.id === productId) ?? null;
}

export function getBuyerWallet(buyerId: string) {
  const state = getState();
  let wallet = state.wallets.find((item) => item.buyerId === buyerId);

  if (!wallet) {
    wallet = {
      id: randomUUID(),
      buyerId,
      balance: 0,
      updatedAt: now(),
    };
    state.wallets.push(wallet);
  }

  return wallet;
}

export function topUpBuyerWallet(buyerId: string, amount: number) {
  if (amount <= 0) {
    throw new Error("Top up amount must be positive.");
  }

  const wallet = getBuyerWallet(buyerId);
  wallet.balance += amount;
  wallet.updatedAt = now();

  const transaction: WalletTransaction = {
    id: randomUUID(),
    buyerId,
    type: "topup",
    amount,
    note: "Dummy top-up",
    createdAt: now(),
  };

  getState().walletTransactions.unshift(transaction);
  return { wallet, transaction };
}

export function listWalletTransactions(buyerId: string) {
  return getState().walletTransactions.filter(
    (transaction) => transaction.buyerId === buyerId,
  );
}

export function listBuyerAddresses(buyerId: string) {
  return getState().addresses.filter((address) => address.buyerId === buyerId);
}

export function createBuyerAddress(
  buyerId: string,
  input: {
    label: string;
    recipient: string;
    phone: string;
    fullAddress: string;
    isDefault?: boolean;
  },
) {
  const state = getState();

  if (input.isDefault) {
    state.addresses
      .filter((address) => address.buyerId === buyerId)
      .forEach((address) => {
        address.isDefault = false;
      });
  }

  const address: DeliveryAddress = {
    id: randomUUID(),
    buyerId,
    label: publicText(input.label, 60),
    recipient: publicText(input.recipient, 80),
    phone: publicText(input.phone, 24),
    fullAddress: publicText(input.fullAddress, 240),
    isDefault: input.isDefault ?? listBuyerAddresses(buyerId).length === 0,
    createdAt: now(),
  };

  state.addresses.push(address);
  return address;
}

export function getCartSummary(buyerId: string): CartSummary {
  const state = getState();
  const items = state.cartItems
    .filter((item) => item.buyerId === buyerId)
    .map((item) => {
      const product = state.products.find((candidate) => candidate.id === item.productId);
      return {
        ...item,
        productName: product?.name ?? "Unknown product",
        price: product?.price ?? 0,
        lineTotal: (product?.price ?? 0) * item.quantity,
      };
    });
  const store = state.stores.find((candidate) => candidate.id === items[0]?.storeId);

  return {
    storeId: store?.id,
    storeName: store?.name,
    items,
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
}

export function addCartItem(
  buyerId: string,
  productId: string,
  quantity: number,
) {
  const state = getState();
  const product = state.products.find((item) => item.id === productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  const existing = state.cartItems.find(
    (item) => item.buyerId === buyerId && item.productId === productId,
  );
  const existingStoreId = state.cartItems.find(
    (item) => item.buyerId === buyerId,
  )?.storeId;

  if (existingStoreId && existingStoreId !== product.storeId) {
    throw new Error("Cart can only contain products from one store.");
  }

  if (existing) {
    existing.quantity += quantity;
    existing.updatedAt = now();
    return existing;
  }

  const item: CartItem = {
    id: randomUUID(),
    buyerId,
    storeId: product.storeId,
    productId,
    quantity,
    updatedAt: now(),
  };

  state.cartItems.push(item);
  return item;
}

export function updateCartItem(
  buyerId: string,
  itemId: string,
  quantity: number,
) {
  const item = getState().cartItems.find(
    (candidate) => candidate.id === itemId && candidate.buyerId === buyerId,
  );

  if (!item) {
    throw new Error("Cart item not found.");
  }

  item.quantity = quantity;
  item.updatedAt = now();
  return item;
}

export function removeCartItem(buyerId: string, itemId: string) {
  const state = getState();
  const index = state.cartItems.findIndex(
    (item) => item.id === itemId && item.buyerId === buyerId,
  );

  if (index === -1) {
    throw new Error("Cart item not found.");
  }

  const [deleted] = state.cartItems.splice(index, 1);
  return deleted;
}

export function previewCheckout(
  buyerId: string,
  deliveryMethod: DeliveryMethod,
  discountCode?: string,
) {
  const cart = getCartSummary(buyerId);

  if (cart.items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const discount = resolveDiscount(discountCode, cart.subtotal);

  return {
    cart,
    summary: calculateCheckoutSummary({
      subtotal: cart.subtotal,
      deliveryMethod,
      discount: discount.amount,
      discountCode: discount.code,
      discountType: discount.type,
    }),
  };
}

function resolveDiscount(discountCode: string | undefined, subtotal: number) {
  if (!discountCode) {
    return { amount: 0 };
  }

  const code = discountCode.trim().toUpperCase();
  const state = getState();
  const voucher = state.vouchers.find((item) => item.code === code);

  if (voucher) {
    if (voucher.expiresAt <= now()) {
      throw new Error("Voucher is expired.");
    }
    if (voucher.remainingUsage <= 0) {
      throw new Error("Voucher has no remaining usage.");
    }

    return {
      amount: Math.round(subtotal * (voucher.percentOff / 100)),
      code: voucher.code,
      type: "Voucher" as const,
    };
  }

  const promo = state.promos.find((item) => item.code === code);

  if (promo) {
    if (promo.expiresAt <= now()) {
      throw new Error("Promo is expired.");
    }

    return {
      amount: Math.min(promo.amountOff, subtotal),
      code: promo.code,
      type: "Promo" as const,
    };
  }

  throw new Error("Discount code not found.");
}

function addOrderStatus(orderId: string, status: OrderStatus, note: string) {
  const entry: OrderStatusEntry = {
    id: randomUUID(),
    orderId,
    status,
    note,
    createdAt: now(),
  };
  getState().orderStatusHistory.push(entry);
  return entry;
}

export function getOrderStatusTimeline(orderId: string) {
  return getState().orderStatusHistory
    .filter((entry) => entry.orderId === orderId)
    .sort((left, right) => left.createdAt - right.createdAt);
}

export function createCheckoutOrder(
  buyerId: string,
  deliveryMethod: DeliveryMethod,
  discountCode?: string,
) {
  const state = getState();
  const { cart, summary } = previewCheckout(buyerId, deliveryMethod, discountCode);
  const firstItem = cart.items[0];
  const product = state.products.find((item) => item.id === firstItem.productId);
  const store = state.stores.find((item) => item.id === firstItem.storeId);
  const wallet = getBuyerWallet(buyerId);

  if (!product || !store) {
    throw new Error("Cart product is no longer available.");
  }

  if (wallet.balance < summary.total) {
    throw new Error("Insufficient wallet balance.");
  }

  cart.items.forEach((item) => {
    const cartProduct = state.products.find(
      (candidate) => candidate.id === item.productId,
    );

    if (!cartProduct || cartProduct.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.productName}.`);
    }
  });

  cart.items.forEach((item) => {
    const cartProduct = state.products.find(
      (candidate) => candidate.id === item.productId,
    );

    if (cartProduct) {
      cartProduct.stock -= item.quantity;
    }
  });

  wallet.balance -= summary.total;
  wallet.updatedAt = now();

  state.walletTransactions.unshift({
    id: randomUUID(),
    buyerId,
    type: "checkout",
    amount: -summary.total,
    note: "Checkout payment",
    createdAt: now(),
  });

  if (summary.discountType === "Voucher" && summary.discountCode) {
    const voucher = state.vouchers.find((item) => item.code === summary.discountCode);
    if (voucher) {
      voucher.remainingUsage -= 1;
    }
  }

  const order: Order = {
    id: randomUUID(),
    buyerId,
    sellerId: product.sellerId,
    storeId: store.id,
    storeName: store.name,
    items: cart.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    status: "Sedang Dikemas",
    dueAt: now() + deliverySlaDays[deliveryMethod] * 86_400_000,
    createdAt: now(),
    ...summary,
  };

  state.orders.unshift(order);
  addOrderStatus(order.id, order.status, "Order created after buyer checkout.");
  state.cartItems = state.cartItems.filter((item) => item.buyerId !== buyerId);

  return order;
}

export function listBuyerOrders(buyerId: string) {
  return getState().orders.filter((order) => order.buyerId === buyerId);
}

export function listSellerOrders(sellerId: string) {
  return getState().orders.filter((order) => order.sellerId === sellerId);
}

export function getOrderForParticipant(userId: string, orderId: string) {
  const order = getState().orders.find(
    (item) =>
      item.id === orderId &&
      (item.buyerId === userId || item.sellerId === userId),
  );

  if (!order) {
    return null;
  }

  return {
    order,
    history: getOrderStatusTimeline(orderId),
  };
}

export function processSellerOrder(sellerId: string, orderId: string) {
  const order = getState().orders.find(
    (item) => item.id === orderId && item.sellerId === sellerId,
  );

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.status !== "Sedang Dikemas") {
    throw new Error("Only orders in Sedang Dikemas can be processed.");
  }

  order.status = "Menunggu Pengirim";
  addOrderStatus(order.id, order.status, "Seller processed the order.");
  ensureDeliveryJob(order.id);
  return order;
}

function ensureDeliveryJob(orderId: string) {
  const state = getState();
  const existing = state.deliveryJobs.find((job) => job.orderId === orderId);
  const order = state.orders.find((item) => item.id === orderId);

  if (existing || !order || order.status !== "Menunggu Pengirim") {
    return existing ?? null;
  }

  const job: DeliveryJob = {
    id: randomUUID(),
    orderId,
    status: "available",
    earning: 0,
    createdAt: now(),
    updatedAt: now(),
  };
  state.deliveryJobs.unshift(job);
  return job;
}

export function listAvailableDeliveryJobs() {
  const state = getState();
  return state.deliveryJobs
    .filter((job) => job.status === "available")
    .map((job) => ({
      ...job,
      order: state.orders.find((order) => order.id === job.orderId),
    }));
}

export function getDeliveryJob(jobId: string) {
  const state = getState();
  const job = state.deliveryJobs.find((item) => item.id === jobId);
  return job
    ? {
        ...job,
        order: state.orders.find((order) => order.id === job.orderId),
      }
    : null;
}

export function takeDeliveryJob(driverId: string, jobId: string) {
  const state = getState();
  const job = state.deliveryJobs.find((item) => item.id === jobId);

  if (!job) {
    throw new Error("Delivery job not found.");
  }

  if (job.status !== "available" || job.driverId) {
    throw new Error("Delivery job already taken.");
  }

  const order = state.orders.find((item) => item.id === job.orderId);

  if (!order || order.status !== "Menunggu Pengirim") {
    throw new Error("Only jobs waiting for driver can be taken.");
  }

  job.driverId = driverId;
  job.status = "taken";
  job.updatedAt = now();
  order.status = "Sedang Dikirim";
  addOrderStatus(order.id, order.status, "Driver took the delivery job.");
  return job;
}

export function completeDeliveryJob(driverId: string, jobId: string) {
  const state = getState();
  const job = state.deliveryJobs.find(
    (item) => item.id === jobId && item.driverId === driverId,
  );

  if (!job) {
    throw new Error("Delivery job not found.");
  }

  if (job.status !== "taken") {
    throw new Error("Only taken jobs can be completed.");
  }

  const order = state.orders.find((item) => item.id === job.orderId);

  if (!order || order.status !== "Sedang Dikirim") {
    throw new Error("Order is not currently being delivered.");
  }

  job.status = "completed";
  job.earning = Math.round(order.deliveryFee * 0.8);
  job.updatedAt = now();
  order.status = "Pesanan Selesai";
  order.completedAt = now();
  addOrderStatus(order.id, order.status, "Driver completed the delivery.");
  return job;
}

export function listDriverJobs(driverId: string) {
  const state = getState();
  const jobs = state.deliveryJobs
    .filter((job) => job.driverId === driverId)
    .map((job) => ({
      ...job,
      order: state.orders.find((order) => order.id === job.orderId),
    }));

  return {
    activeJob: jobs.find((job) => job.status === "taken") ?? null,
    history: jobs.filter((job) => job.status === "completed"),
    earnings: jobs.reduce((sum, job) => sum + job.earning, 0),
  };
}

export function getAdminMonitoring() {
  const state = getState();
  const currentTime = getCurrentTime();
  const overdueOrders = findOverdueOrders(currentTime);

  return {
    users: state.users.length,
    stores: state.stores.length,
    products: state.products.length,
    orders: state.orders.length,
    vouchers: state.vouchers.length,
    promos: state.promos.length,
    deliveryJobs: state.deliveryJobs.length,
    overdueOrders: overdueOrders.length,
    currentTime,
  };
}

export function listOverdueOrders() {
  return findOverdueOrders(getCurrentTime());
}

function findOverdueOrders(currentTime: number) {
  return getState().orders.filter(
    (order) =>
      order.status !== "Pesanan Selesai" &&
      order.status !== "Dikembalikan" &&
      order.dueAt < currentTime,
  );
}

export function handleOverdueOrders() {
  const state = getState();
  const overdueOrders = listOverdueOrders();

  overdueOrders.forEach((order) => {
    if (order.refundedAt || order.status === "Dikembalikan") {
      return;
    }

    order.items.forEach((item) => {
      const product = state.products.find(
        (candidate) => candidate.id === item.productId,
      );

      if (product) {
        product.stock += item.quantity;
      }
    });

    const wallet = getBuyerWallet(order.buyerId);
    wallet.balance += order.total;
    wallet.updatedAt = now();
    order.refundedAt = now();
    order.status = "Dikembalikan";

    state.walletTransactions.unshift({
      id: randomUUID(),
      buyerId: order.buyerId,
      type: "refund",
      amount: order.total,
      note: `Refund for overdue order ${order.id}`,
      createdAt: now(),
    });

    addOrderStatus(order.id, order.status, "Auto return/refund for overdue order.");
  });

  return overdueOrders;
}

export function getCurrentTime() {
  return Number(getState().systemTime ?? now());
}

export function advanceSystemTime(days: number) {
  const state = getState();
  state.systemTime = getCurrentTime() + days * 86_400_000;
  return { currentTime: state.systemTime };
}

export function getBuyerSpendingReport(buyerId: string) {
  const orders = listBuyerOrders(buyerId);
  return {
    orderCount: orders.length,
    subtotal: orders.reduce((sum, order) => sum + order.subtotal, 0),
    discount: orders.reduce((sum, order) => sum + order.discount, 0),
    deliveryFee: orders.reduce((sum, order) => sum + order.deliveryFee, 0),
    ppn: orders.reduce((sum, order) => sum + order.ppn, 0),
    total: orders.reduce((sum, order) => sum + order.total, 0),
  };
}

export function getSellerIncomeReport(sellerId: string) {
  const orders = listSellerOrders(sellerId).filter(
    (order) => order.status !== "Dikembalikan",
  );
  return {
    orderCount: orders.length,
    subtotal: orders.reduce((sum, order) => sum + order.subtotal, 0),
    discount: orders.reduce((sum, order) => sum + order.discount, 0),
    deliveryFee: orders.reduce((sum, order) => sum + order.deliveryFee, 0),
    ppn: orders.reduce((sum, order) => sum + order.ppn, 0),
    income: orders.reduce((sum, order) => sum + order.subtotal - order.discount, 0),
  };
}

export function listVouchers() {
  return getState().vouchers;
}

export function listPromos() {
  return getState().promos;
}

export function createVoucher(input: {
  code: string;
  percentOff: number;
  remainingUsage: number;
  expiresAt: number;
}) {
  const voucher: Voucher = {
    id: randomUUID(),
    code: input.code.trim().toUpperCase(),
    percentOff: input.percentOff,
    remainingUsage: input.remainingUsage,
    expiresAt: input.expiresAt,
    createdAt: now(),
  };
  getState().vouchers.unshift(voucher);
  return voucher;
}

export function createPromo(input: {
  code: string;
  amountOff: number;
  expiresAt: number;
}) {
  const promo: Promo = {
    id: randomUUID(),
    code: input.code.trim().toUpperCase(),
    amountOff: input.amountOff,
    expiresAt: input.expiresAt,
    createdAt: now(),
  };
  getState().promos.unshift(promo);
  return promo;
}
