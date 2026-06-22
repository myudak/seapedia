import { expect, test } from "@playwright/test";

test("guest can browse core SEAPEDIA surfaces", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "SEAPEDIA" })).toBeVisible();
  await expect(page.getByText("Application Reviews")).toBeVisible();

  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "Public Catalog" })).toBeVisible();
  await page.getByText("Coral Market Tote").first().click();
  await expect(page.getByText("Read-only detail")).toBeVisible();
});

test("auth and dashboard entry points render", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Login/ })).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard Entry" })).toBeVisible();
  await page.goto("/dashboard/admin");
  await expect(page.getByText("Marketplace Monitoring")).toBeVisible();
});
