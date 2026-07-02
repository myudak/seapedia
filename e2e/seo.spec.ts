import { expect, test } from "@playwright/test";

test.describe("public SEO surface", () => {
  test("publishes crawl and install metadata", async ({ page, request }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/SEAPEDIA/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https?:\/\/[^/]+\/?$/,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/opengraph-image/,
    );
    const homeSchema = page.locator('script[type="application\/ld\+json"]');
    await expect(homeSchema).toHaveCount(1);
    const homeSchemaJson = await homeSchema.evaluate((element) => element.textContent);
    expect(homeSchemaJson).toContain('"@type":"Organization"');
    expect(homeSchemaJson).toContain('"@type":"WebSite"');

    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("/products/prd-coral-tote");

    const manifest = await request.get("/manifest.webmanifest");
    expect(manifest.ok()).toBe(true);
    expect(await manifest.json()).toMatchObject({
      short_name: "SEAPEDIA",
      display: "standalone",
      lang: "id",
    });
  });

  test("publishes product metadata and excludes private entry points", async ({
    page,
  }) => {
    await page.goto("/products/prd-coral-tote");

    await expect(page).toHaveTitle(/Coral Market Tote.*SEAPEDIA/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/products\/prd-coral-tote$/,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
    const productSchema = page.locator('script[type="application\/ld\+json"]');
    await expect(productSchema).toHaveCount(1);
    const productSchemaJson = await productSchema.evaluate(
      (element) => element.textContent,
    );
    expect(productSchemaJson).toContain('"@type":"Product"');
    expect(productSchemaJson).toContain('"@type":"BreadcrumbList"');

    await page.goto("/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});
