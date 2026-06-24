import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Script from "next/script";
import { ConvexClientProvider } from "@/app/convex-client-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable} ${fraunces.variable}`}
    >
      <head>
        {process.env.NODE_ENV === "development" && (
          <>
            <Script
          src="//unpkg.com/react-scan/dist/auto.global.js"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />

          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
            />
            </>
        )}

      </head>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <ConvexClientProvider>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
