import { expect, test } from "@playwright/test";

test("public storefront remains usable at a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: /Shop catalog/i }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");

  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "Public Catalog" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Coral Market Tote/i })).toBeVisible();
});
