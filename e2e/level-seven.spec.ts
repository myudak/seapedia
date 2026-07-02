import { expect, test, type Page } from "@playwright/test";

const password = process.env.SEED_ACCOUNT_PASSWORD ?? "seapedia123";

async function login(page: Page, username: string) {
  await page.goto("/login");
  await page.getByLabel("Username", { exact: true }).fill(username);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.waitForURL(/\/dashboard\//);
  await page.reload();
}

test.describe.serial("Level 1-7 marketplace demo", () => {
  test("guest submits a safely rendered application review", async ({ page }) => {
    await page.goto("/#reviews");
    await page.getByLabel("Your name").fill("E2E Reviewer");
    await page.getByRole("button", { name: "5 stars" }).click();
    await page
      .getByLabel("Comment")
      .fill("<script>window.__seapedia_xss = true</script>");
    await page.getByRole("button", { name: /submit review/i }).click();

    await expect(page.getByText(/<script>window.__seapedia_xss/)).toBeVisible();
    expect(await page.evaluate(() => window.__seapedia_xss)).toBeUndefined();
  });

  test("buyer tops up, adds a product, and checks out with a voucher", async ({ page }) => {
    await login(page, "buyer");
    await expect(page).toHaveURL("/dashboard/buyer");

    await page.getByLabel("Top-up amount (Rp)").fill("50000");
    await page.getByRole("button", { name: "Top up", exact: true }).click();
    await expect(page.getByText("Top-up successful.")).toBeVisible();

    await page.goto("/products/prd-coral-tote");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("button", { name: /Added/ })).toBeVisible();
    await page.goto("/cart");
    await page.getByRole("link", { name: /Checkout \(1\)/ }).click();
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

    await page.getByPlaceholder(/HEMAT12/).fill("HEMAT12");
    await expect(page.getByText(/applied/)).toBeVisible();
    await expect(page.getByText("PPN 12%", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page.getByRole("heading", { name: "Order placed!" })).toBeVisible();
  });

  test("seller processes the paid order", async ({ page }) => {
    await login(page, "seller");
    await expect(page).toHaveURL("/dashboard/seller");
    await expect(page.getByText("Coral Market Tote × 1")).toBeVisible();
    await page.getByRole("button", { name: "Process order" }).first().click();
    await expect(page.getByText(/Order moved to Menunggu Pengirim/)).toBeVisible();
  });

  test("driver claims and completes the delivery", async ({ page }) => {
    await login(page, "driver");
    await expect(page).toHaveURL("/dashboard/driver");
    await page.getByRole("button", { name: "Take job" }).first().click();
    await expect(page.getByText(/Job taken.*Sedang Dikirim/)).toBeVisible();
    await page.getByRole("button", { name: "Complete delivery" }).click();
    await expect(page.getByText(/Rp\s*6\.400/)).toBeVisible();
  });

  test("buyer sees the completed order timeline", async ({ page }) => {
    await login(page, "buyer");
    await expect(page.getByText("Pesanan Selesai").first()).toBeVisible();
    await page
      .getByRole("button", { name: /Pasar Pagi Studio.*Pesanan Selesai/ })
      .first()
      .click();
    await expect(page.getByText("Status timeline")).toBeVisible();
    await expect(page.getByText(/Sedang Dikirim/)).toBeVisible();
  });

  test("buyer creates an instant order for the overdue scenario", async ({ page }) => {
    await login(page, "buyer");
    await page.goto("/products/prd-coral-tote");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.goto("/cart");
    await page.getByRole("link", { name: /Checkout \(1\)/ }).click();
    await page.getByText("Instant", { exact: true }).click();
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page.getByRole("heading", { name: "Order placed!" })).toBeVisible();
  });

  test("admin monitors and refunds the overdue order", async ({ page }) => {
    await login(page, "admin");
    await expect(page).toHaveURL("/dashboard/admin");
    await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Time machine" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Overdue handling" })).toBeVisible();
    await page.getByRole("button", { name: "Simulate next day" }).click();
    await expect(page.getByText("Advanced by one day.")).toBeVisible();
    await page.getByRole("button", { name: "View overdue" }).click();
    await expect(page.getByText("Sedang Dikemas")).toBeVisible();
    await page.getByRole("button", { name: "Run refund" }).click();
    await expect(page.getByText("Auto return/refund executed.")).toBeVisible();
  });

  test("buyer sees the overdue wallet refund", async ({ page }) => {
    await login(page, "buyer");
    await expect(page.getByText("Dikembalikan").first()).toBeVisible();
    await expect(page.getByText("Refund").first()).toBeVisible();
  });
});

declare global {
  interface Window {
    __seapedia_xss?: boolean;
  }
}
