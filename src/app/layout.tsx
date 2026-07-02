import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "@/app/convex-client-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { getToken } from "@/lib/auth-server";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

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
  metadataBase: siteUrl,
  title: {
    default: "SEAPEDIA | Marketplace Multi-Peran Indonesia",
    template: "%s | SEAPEDIA",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "marketplace Indonesia",
    "produk lokal",
    "ecommerce multi seller",
    "SEAPEDIA",
  ],
  creator: "Muchamad Yuda Tri Ananda",
  publisher: siteName,
  category: "ecommerce",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName,
    title: "SEAPEDIA | Marketplace Multi-Peran Indonesia",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "SEAPEDIA | Marketplace Multi-Peran Indonesia",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#171512",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialToken = await getToken();

  return (
    <html
      lang="id"
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
