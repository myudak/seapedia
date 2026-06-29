export type ProductCategory = "Fashion" | "Food" | "Home" | "Gadget";
export type SeedStoreSlug = "pasar-pagi-studio" | "kedai-timur";

export type PublicProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  storeName: string;
  storeSlug: SeedStoreSlug;
  imageUrl: string;
  galleryImages: string[];
  category: ProductCategory;
  rating: number;
  soldCount: number;
  discountLabel?: string;
  featured?: boolean;
};

const storeNames: Record<SeedStoreSlug, string> = {
  "pasar-pagi-studio": "Pasar Pagi Studio",
  "kedai-timur": "Kedai Timur",
};

function product(
  value: Omit<PublicProduct, "storeName" | "galleryImages"> & {
    galleryImages?: string[];
  },
): PublicProduct {
  return {
    ...value,
    storeName: storeNames[value.storeSlug],
    galleryImages: value.galleryImages ?? [value.imageUrl],
  };
}

export const publicProducts: PublicProduct[] = [
  product({
    id: "prd-coral-tote", name: "Coral Market Tote", category: "Fashion",
    description: "Water-resistant daily tote with reinforced handles for Jakarta commutes and weekend errands.",
    price: 129000, stock: 18, storeSlug: "pasar-pagi-studio", rating: 4.8, soldCount: 342,
    imageUrl: "/assets/products/coral-market-tote.png", discountLabel: "Flash -10%", featured: true,
    galleryImages: ["/assets/products/coral-market-tote.png", "/assets/products/gallery/coral-market-tote-side.png", "/assets/products/gallery/coral-market-tote-interior.png", "/assets/products/gallery/coral-market-tote-lifestyle.png"],
  }),
  product({
    id: "prd-sumba-sling", name: "Sumba Woven Sling", category: "Fashion",
    description: "Compact woven sling bag with an adjustable cotton strap and organized everyday compartments.",
    price: 169000, stock: 22, storeSlug: "kedai-timur", rating: 4.9, soldCount: 418,
    imageUrl: "/assets/products/catalog/sumba-woven-sling.webp", discountLabel: "Bestseller", featured: true,
    galleryImages: ["/assets/products/catalog/sumba-woven-sling.webp", "/assets/products/gallery/sumba-woven-sling-side.webp", "/assets/products/gallery/sumba-woven-sling-interior.webp", "/assets/products/gallery/sumba-woven-sling-worn.webp"],
  }),
  product({
    id: "prd-linen-shirt", name: "Linen Weekend Shirt", category: "Fashion",
    description: "Relaxed breathable linen shirt with a clean camp collar for warm city weekends.",
    price: 219000, stock: 28, storeSlug: "pasar-pagi-studio", rating: 4.7, soldCount: 196,
    imageUrl: "/assets/products/catalog/linen-weekend-shirt.webp", discountLabel: "New",
  }),
  product({
    id: "prd-batik-scarf", name: "Batik Scarf Set", category: "Fashion",
    description: "Two lightweight batik-inspired scarves finished with neat hand-rolled edges.",
    price: 149000, stock: 17, storeSlug: "kedai-timur", rating: 4.8, soldCount: 231,
    imageUrl: "/assets/products/catalog/batik-scarf-set.webp", discountLabel: "Set of 2",
  }),
  product({
    id: "prd-canvas-backpack", name: "Canvas Commuter Backpack", category: "Fashion",
    description: "Structured canvas backpack with a padded laptop sleeve and weather-resistant base.",
    price: 289000, stock: 14, storeSlug: "pasar-pagi-studio", rating: 4.7, soldCount: 154,
    imageUrl: "/assets/products/catalog/canvas-commuter-backpack.webp",
  }),
  product({
    id: "prd-pleated-skirt", name: "Pleated Everyday Skirt", category: "Fashion",
    description: "Mid-length pleated skirt with a comfortable waistband and fluid everyday drape.",
    price: 189000, stock: 24, storeSlug: "kedai-timur", rating: 4.6, soldCount: 187,
    imageUrl: "/assets/products/catalog/pleated-everyday-skirt.webp", discountLabel: "-12%",
  }),
  product({
    id: "prd-card-wallet", name: "Leather Card Wallet", category: "Fashion",
    description: "Slim vegetable-tanned leather wallet with six card slots and a central cash pocket.",
    price: 99000, stock: 35, storeSlug: "pasar-pagi-studio", rating: 4.8, soldCount: 386,
    imageUrl: "/assets/products/catalog/leather-card-wallet.webp", discountLabel: "Popular",
  }),
  product({
    id: "prd-bucket-hat", name: "Rainproof Bucket Hat", category: "Fashion",
    description: "Packable water-repellent bucket hat with breathable lining and a secure chin cord.",
    price: 119000, stock: 30, storeSlug: "kedai-timur", rating: 4.5, soldCount: 142,
    imageUrl: "/assets/products/catalog/rainproof-bucket-hat.webp",
  }),

  product({
    id: "prd-archipelago-coffee", name: "Archipelago Coffee Set", category: "Food",
    description: "Three-origin tasting box with sealed pouches, ceramic cup, and a gift-ready sleeve.",
    price: 185000, stock: 26, storeSlug: "kedai-timur", rating: 4.9, soldCount: 511,
    imageUrl: "/assets/products/archipelago-coffee-set.png", discountLabel: "Bundle", featured: true,
    galleryImages: ["/assets/products/archipelago-coffee-set.png", "/assets/products/gallery/archipelago-coffee-open-box.png", "/assets/products/gallery/archipelago-coffee-pouches.png", "/assets/products/gallery/archipelago-coffee-bar.png"],
  }),
  product({
    id: "prd-palm-granola", name: "Palm Sugar Granola", category: "Food",
    description: "Crunchy oat granola baked with coconut, cashews, and fragrant palm sugar.",
    price: 72000, stock: 42, storeSlug: "pasar-pagi-studio", rating: 4.7, soldCount: 298,
    imageUrl: "/assets/products/catalog/palm-sugar-granola.webp", discountLabel: "Fresh Batch",
  }),
  product({
    id: "prd-sambal-trio", name: "Sambal Trio Gift Box", category: "Food",
    description: "Three small-batch sambal varieties ranging from smoky mild to bright extra hot.",
    price: 135000, stock: 33, storeSlug: "kedai-timur", rating: 4.9, soldCount: 467,
    imageUrl: "/assets/products/catalog/sambal-trio-gift-box.webp", discountLabel: "Top Rated", featured: true,
    galleryImages: ["/assets/products/catalog/sambal-trio-gift-box.webp", "/assets/products/gallery/sambal-trio-open.webp", "/assets/products/gallery/sambal-trio-jars.webp", "/assets/products/gallery/sambal-trio-serving.webp"],
  }),
  product({
    id: "prd-drip-bags", name: "Single Origin Drip Bags", category: "Food",
    description: "Ten individually sealed pour-over coffee bags for a clean cup anywhere.",
    price: 89000, stock: 48, storeSlug: "pasar-pagi-studio", rating: 4.8, soldCount: 522,
    imageUrl: "/assets/products/catalog/single-origin-drip-bags.webp", discountLabel: "10 Pack",
  }),
  product({
    id: "prd-pandan-cookies", name: "Pandan Coconut Cookies", category: "Food",
    description: "Crisp butter cookies scented with pandan and toasted coconut in a reusable tin.",
    price: 68000, stock: 37, storeSlug: "kedai-timur", rating: 4.6, soldCount: 245,
    imageUrl: "/assets/products/catalog/pandan-coconut-cookies.webp",
  }),
  product({
    id: "prd-herbal-tea", name: "Herbal Tea Collection", category: "Food",
    description: "A calming assortment of lemongrass, ginger, rosella, and jasmine tea sachets.",
    price: 96000, stock: 29, storeSlug: "pasar-pagi-studio", rating: 4.7, soldCount: 204,
    imageUrl: "/assets/products/catalog/herbal-tea-collection.webp", discountLabel: "4 Flavours",
  }),
  product({
    id: "prd-chocolate-set", name: "Artisan Chocolate Bar Set", category: "Food",
    description: "Four Indonesian cacao bars with distinct roast profiles and restrained sweetness.",
    price: 158000, stock: 21, storeSlug: "kedai-timur", rating: 4.8, soldCount: 176,
    imageUrl: "/assets/products/catalog/artisan-chocolate-bar-set.webp", discountLabel: "Gift Set",
  }),
  product({
    id: "prd-cashew-mix", name: "Cashew Snack Mix", category: "Food",
    description: "Roasted cashews tossed with sesame, curry leaves, and a gently spicy seasoning.",
    price: 64000, stock: 45, storeSlug: "pasar-pagi-studio", rating: 4.5, soldCount: 319,
    imageUrl: "/assets/products/catalog/cashew-snack-mix.webp",
  }),

  product({
    id: "prd-rattan-lamp", name: "Rattan Desk Lamp", category: "Home",
    description: "Compact woven rattan lamp with a warm diffuser for bedrooms, desks, and small studios.",
    price: 249000, stock: 9, storeSlug: "pasar-pagi-studio", rating: 4.7, soldCount: 128,
    imageUrl: "/assets/products/rattan-desk-lamp.png", discountLabel: "Limited", featured: true,
    galleryImages: ["/assets/products/rattan-desk-lamp.png", "/assets/products/gallery/rattan-desk-lamp-side.png", "/assets/products/gallery/rattan-desk-lamp-bedroom.png", "/assets/products/gallery/rattan-desk-lamp-detail.png"],
  }),
  product({
    id: "prd-teak-tray", name: "Teak Serving Tray", category: "Home",
    description: "Solid teak serving tray with rounded handles and a food-safe natural finish.",
    price: 229000, stock: 16, storeSlug: "kedai-timur", rating: 4.9, soldCount: 273,
    imageUrl: "/assets/products/catalog/teak-serving-tray.webp", discountLabel: "Craft Pick", featured: true,
    galleryImages: ["/assets/products/catalog/teak-serving-tray.webp", "/assets/products/gallery/teak-serving-tray-side.webp", "/assets/products/gallery/teak-serving-tray-breakfast.webp", "/assets/products/gallery/teak-serving-tray-grain.webp"],
  }),
  product({
    id: "prd-storage-basket", name: "Woven Storage Basket", category: "Home",
    description: "Handwoven natural-fiber basket sized for throws, laundry, or living-room storage.",
    price: 195000, stock: 20, storeSlug: "pasar-pagi-studio", rating: 4.7, soldCount: 164,
    imageUrl: "/assets/products/catalog/woven-storage-basket.webp",
  }),
  product({
    id: "prd-aroma-diffuser", name: "Ceramic Aroma Diffuser", category: "Home",
    description: "Quiet ceramic aroma diffuser with a warm ambient light and simple timer control.",
    price: 279000, stock: 13, storeSlug: "kedai-timur", rating: 4.8, soldCount: 221,
    imageUrl: "/assets/products/catalog/ceramic-aroma-diffuser.webp", discountLabel: "Quiet Home",
  }),
  product({
    id: "prd-cushion-cover", name: "Cotton Cushion Cover", category: "Home",
    description: "Textured cotton cushion cover with concealed zip and understated woven stripes.",
    price: 85000, stock: 40, storeSlug: "pasar-pagi-studio", rating: 4.6, soldCount: 308,
    imageUrl: "/assets/products/catalog/cotton-cushion-cover.webp", discountLabel: "Mix & Match",
  }),
  product({
    id: "prd-bedside-organizer", name: "Bamboo Bedside Organizer", category: "Home",
    description: "Compact bamboo caddy that keeps glasses, phone, watch, and small essentials together.",
    price: 145000, stock: 23, storeSlug: "kedai-timur", rating: 4.7, soldCount: 182,
    imageUrl: "/assets/products/catalog/bamboo-bedside-organizer.webp",
  }),
  product({
    id: "prd-dinnerware", name: "Speckled Dinnerware Set", category: "Home",
    description: "Four-piece stoneware place setting with soft speckles and hand-finished edges.",
    price: 319000, stock: 11, storeSlug: "pasar-pagi-studio", rating: 4.8, soldCount: 146,
    imageUrl: "/assets/products/catalog/speckled-dinnerware-set.webp", discountLabel: "4 Piece",
  }),
  product({
    id: "prd-wall-clock", name: "Minimal Wall Clock", category: "Home",
    description: "Silent sweep wall clock with a warm wood frame and crisp high-contrast markers.",
    price: 179000, stock: 19, storeSlug: "kedai-timur", rating: 4.5, soldCount: 137,
    imageUrl: "/assets/products/catalog/minimal-wall-clock.webp",
  }),

  product({
    id: "prd-batik-organizer", name: "Batik Cable Organizer", category: "Gadget",
    description: "Leather tech pouch with batik lining for chargers, earbuds, and travel cables.",
    price: 79000, stock: 31, storeSlug: "kedai-timur", rating: 4.6, soldCount: 274,
    imageUrl: "/assets/products/batik-cable-organizer.png", discountLabel: "Best Deal", featured: true,
    galleryImages: ["/assets/products/batik-cable-organizer.png", "/assets/products/gallery/batik-cable-organizer-open.png", "/assets/products/gallery/batik-cable-organizer-travel.png", "/assets/products/gallery/batik-cable-organizer-detail.png"],
  }),
  product({
    id: "prd-gan-charger", name: "Compact GaN Charger", category: "Gadget",
    description: "Pocket-sized dual-port fast charger for phones, tablets, and lightweight laptops.",
    price: 329000, stock: 27, storeSlug: "pasar-pagi-studio", rating: 4.9, soldCount: 603,
    imageUrl: "/assets/products/catalog/compact-gan-charger.webp", discountLabel: "Top Tech", featured: true,
    galleryImages: ["/assets/products/catalog/compact-gan-charger.webp", "/assets/products/gallery/compact-gan-charger-ports.webp", "/assets/products/gallery/compact-gan-charger-scale.webp", "/assets/products/gallery/compact-gan-charger-travel.webp"],
  }),
  product({
    id: "prd-mechanical-keyboard", name: "Wireless Mechanical Keyboard", category: "Gadget",
    description: "Compact wireless mechanical keyboard with tactile switches and a durable low-profile case.",
    price: 649000, stock: 12, storeSlug: "kedai-timur", rating: 4.8, soldCount: 189,
    imageUrl: "/assets/products/catalog/wireless-mechanical-keyboard.webp", discountLabel: "Hot Item",
  }),
  product({
    id: "prd-laptop-stand", name: "Foldable Laptop Stand", category: "Gadget",
    description: "Adjustable aluminum laptop stand that folds flat for hybrid work and travel.",
    price: 239000, stock: 34, storeSlug: "pasar-pagi-studio", rating: 4.7, soldCount: 412,
    imageUrl: "/assets/products/catalog/foldable-laptop-stand.webp",
  }),
  product({
    id: "prd-phone-stand", name: "Magnetic Phone Stand", category: "Gadget",
    description: "Weighted magnetic phone stand with a smooth adjustable hinge for desks and counters.",
    price: 189000, stock: 38, storeSlug: "kedai-timur", rating: 4.6, soldCount: 355,
    imageUrl: "/assets/products/catalog/magnetic-phone-stand.webp", discountLabel: "Desk Pick",
  }),
  product({
    id: "prd-wireless-earbuds", name: "Pocket Wireless Earbuds", category: "Gadget",
    description: "Compact wireless earbuds with balanced sound, clear calls, and a pocket charging case.",
    price: 399000, stock: 25, storeSlug: "pasar-pagi-studio", rating: 4.7, soldCount: 328,
    imageUrl: "/assets/products/catalog/pocket-wireless-earbuds.webp",
  }),
  product({
    id: "prd-power-bank", name: "Portable Power Bank", category: "Gadget",
    description: "Slim high-capacity power bank with two-way USB-C charging and a clear battery indicator.",
    price: 359000, stock: 29, storeSlug: "kedai-timur", rating: 4.8, soldCount: 491,
    imageUrl: "/assets/products/catalog/portable-power-bank.webp", discountLabel: "Travel Ready",
  }),
  product({
    id: "prd-usb-hub", name: "USB-C Hub", category: "Gadget",
    description: "Seven-port aluminum USB-C hub for display, storage, charging, and everyday peripherals.",
    price: 429000, stock: 18, storeSlug: "pasar-pagi-studio", rating: 4.7, soldCount: 267,
    imageUrl: "/assets/products/catalog/usb-c-hub.webp",
  }),
];

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
