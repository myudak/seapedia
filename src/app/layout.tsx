import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "@/app/convex-client-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { getToken } from "@/lib/auth-server";

// Self-hosted variable fonts (no runtime Google Fonts fetch — works offline).
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const fraunces = localFont({
  src: "./fonts/fraunces-latin.woff2",
  variable: "--font-fraunces",
  display: "swap",
  weight: "300 700",
});

export const metadata: Metadata = {
  title: {
    default: "SEAPEDIA",
    template: "%s | SEAPEDIA",
  },
  description:
    "A multi-role marketplace for buyers, sellers, drivers, and admins.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialToken = await getToken();

  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable} ${fraunces.variable}`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <ConvexClientProvider initialToken={initialToken}>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
