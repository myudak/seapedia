export const siteName = "SEAPEDIA";
export const siteDescription =
  "Marketplace multi-peran Indonesia untuk belanja produk lokal, mengelola toko, memproses pesanan, dan mengantar barang dalam satu alur.";

const configuredUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://127.0.0.1:3001");

export const siteUrl = new URL(configuredUrl);

export function absoluteUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}
