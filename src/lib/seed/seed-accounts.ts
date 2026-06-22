import type { Role } from "@/lib/domain/types";

export type SeedAccount = {
  username: string;
  password: string;
  roles: Role[];
  note: string;
};

export const seedAccounts: SeedAccount[] = [
  {
    username: "admin",
    password: "seapedia123",
    roles: ["Admin"],
    note: "Admin monitoring, discount management, and overdue simulation.",
  },
  {
    username: "maya",
    password: "seapedia123",
    roles: ["Buyer", "Seller", "Driver"],
    note: "Multi-role user that must choose an active role after login.",
  },
  {
    username: "seller",
    password: "seapedia123",
    roles: ["Seller"],
    note: "Seller store and product management.",
  },
  {
    username: "buyer",
    password: "seapedia123",
    roles: ["Buyer"],
    note: "Wallet, cart, checkout, and order history.",
  },
  {
    username: "driver",
    password: "seapedia123",
    roles: ["Driver"],
    note: "Delivery job discovery and completion.",
  },
];
