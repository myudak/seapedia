export type PublicProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  storeName: string;
  storeSlug: string;
  imageUrl: string;
  galleryImages: string[];
  category: string;
  rating: number;
  soldCount: number;
  discountLabel?: string;
  featured?: boolean;
};

export const publicProducts: PublicProduct[] = [
  {
    id: "prd-coral-tote",
    name: "Coral Market Tote",
    description:
      "Water-resistant daily tote with reinforced handles for Jakarta commutes and weekend errands.",
    price: 129000,
    stock: 18,
    storeName: "Pasar Pagi Studio",
    storeSlug: "pasar-pagi-studio",
    imageUrl: "/assets/products/coral-market-tote.png",
    galleryImages: [
      "/assets/products/coral-market-tote.png",
      "/assets/products/gallery/coral-market-tote-side.png",
      "/assets/products/gallery/coral-market-tote-interior.png",
      "/assets/products/gallery/coral-market-tote-lifestyle.png",
    ],
    category: "Fashion",
    rating: 4.8,
    soldCount: 342,
    discountLabel: "Flash -10%",
    featured: true,
  },
  {
    id: "prd-archipelago-coffee",
    name: "Archipelago Coffee Set",
    description:
      "Three-origin tasting box with sealed pouches, ceramic cup, and a gift-ready sleeve.",
    price: 185000,
    stock: 26,
    storeName: "Kedai Timur",
    storeSlug: "kedai-timur",
    imageUrl: "/assets/products/archipelago-coffee-set.png",
    galleryImages: [
      "/assets/products/archipelago-coffee-set.png",
      "/assets/products/gallery/archipelago-coffee-open-box.png",
      "/assets/products/gallery/archipelago-coffee-pouches.png",
      "/assets/products/gallery/archipelago-coffee-bar.png",
    ],
    category: "Food",
    rating: 4.9,
    soldCount: 511,
    discountLabel: "Bundle",
    featured: true,
  },
  {
    id: "prd-rattan-lamp",
    name: "Rattan Desk Lamp",
    description:
      "Compact woven rattan lamp with a warm diffuser for bedrooms, desks, and small studios.",
    price: 249000,
    stock: 9,
    storeName: "Nusa Homecraft",
    storeSlug: "nusa-homecraft",
    imageUrl: "/assets/products/rattan-desk-lamp.png",
    galleryImages: [
      "/assets/products/rattan-desk-lamp.png",
      "/assets/products/gallery/rattan-desk-lamp-side.png",
      "/assets/products/gallery/rattan-desk-lamp-bedroom.png",
      "/assets/products/gallery/rattan-desk-lamp-detail.png",
    ],
    category: "Home",
    rating: 4.7,
    soldCount: 128,
    discountLabel: "Limited",
  },
  {
    id: "prd-batik-organizer",
    name: "Batik Cable Organizer",
    description:
      "Leather tech pouch with batik lining for chargers, earbuds, and travel cables.",
    price: 79000,
    stock: 31,
    storeName: "Lurik Lab",
    storeSlug: "lurik-lab",
    imageUrl: "/assets/products/batik-cable-organizer.png",
    galleryImages: [
      "/assets/products/batik-cable-organizer.png",
      "/assets/products/gallery/batik-cable-organizer-open.png",
      "/assets/products/gallery/batik-cable-organizer-travel.png",
      "/assets/products/gallery/batik-cable-organizer-detail.png",
    ],
    category: "Gadget",
    rating: 4.6,
    soldCount: 274,
    discountLabel: "Best Deal",
  },
];

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
