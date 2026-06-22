export type PublicProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  storeName: string;
  storeSlug: string;
  imageUrl: string;
};

export const publicProducts: PublicProduct[] = [
  {
    id: "prd-coral-tote",
    name: "Coral Market Tote",
    description:
      "Water-resistant daily tote made for Jakarta commutes and weekend groceries.",
    price: 129000,
    stock: 18,
    storeName: "Pasar Pagi Studio",
    storeSlug: "pasar-pagi-studio",
    imageUrl:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "prd-archipelago-coffee",
    name: "Archipelago Coffee Set",
    description:
      "Three-origin tasting box with beans from Aceh, Toraja, and Flores.",
    price: 185000,
    stock: 26,
    storeName: "Kedai Timur",
    storeSlug: "kedai-timur",
    imageUrl:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "prd-rattan-lamp",
    name: "Rattan Desk Lamp",
    description:
      "Compact woven lamp with a warm diffuser for bedrooms and small studios.",
    price: 249000,
    stock: 9,
    storeName: "Nusa Homecraft",
    storeSlug: "nusa-homecraft",
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "prd-batik-organizer",
    name: "Batik Cable Organizer",
    description:
      "Small leather organizer with batik lining for chargers and travel cables.",
    price: 79000,
    stock: 31,
    storeName: "Lurik Lab",
    storeSlug: "lurik-lab",
    imageUrl:
      "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=900&q=80",
  },
];

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
