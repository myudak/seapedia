import { expect, test, type Page } from "@playwright/test";

const password = process.env.SEED_ACCOUNT_PASSWORD ?? "seapedia123";

async function login(page: Page, username: string) {
  await page.goto("/login");
  await page.getByLabel("Username", { exact: true }).fill(username);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
}

test("guest can browse the Convex-backed catalog", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "Public Catalog" })).toBeVisible();
  await expect(page.getByText("32 curated products")).toBeVisible();
  await page.getByRole("link", { name: "2", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
});

test("login form hydrates before credentials are submitted", async ({ page }) => {
  await page.goto("/login");
  const passwordInput = page.getByLabel("Password", { exact: true });

  await expect(passwordInput).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(passwordInput).toHaveAttribute("type", "text");
});

test("a new user can register and receives the Buyer dashboard", async ({
  page,
}) => {
  const suffix = Date.now().toString(36);
  const username = `e2e${suffix}`;

  await page.goto("/register");
  await page.getByLabel("Display name").fill("E2E Buyer");
  await page.getByLabel("Email").fill(`${username}@example.test`);
  await page.getByLabel("Username", { exact: true }).fill(username);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL("/dashboard/buyer", { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "Buyer Dashboard" }),
  ).toBeVisible();
});

for (const account of [
  { username: "buyer", role: "Buyer" },
  { username: "seller", role: "Seller" },
  { username: "driver", role: "Driver" },
  { username: "admin", role: "Admin" },
]) {
  test(`${account.username} logs in and keeps the session after reload`, async ({ page }) => {
    await login(page, account.username);
    await expect(page).toHaveURL(`/dashboard/${account.role.toLowerCase()}`);
    await expect(page.getByRole("heading", { name: `${account.role} Dashboard` })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: `${account.role} Dashboard` })).toBeVisible();
  });
}

test("maya selects an active role after login", async ({ page }) => {
  await login(page, "maya");
  await expect(page.getByRole("heading", { name: "Choose your role" })).toBeVisible();
  await page.getByRole("button", { name: "Seller", exact: true }).click();
  await expect(page).toHaveURL("/dashboard/seller");
  await expect(page.getByRole("heading", { name: "Seller Dashboard" })).toBeVisible();
});

test("invalid credentials show an error without leaving login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username", { exact: true }).fill("buyer");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText(/invalid username or password/i)).toBeVisible();
});

test("buyer can log out from an authenticated session", async ({ page }) => {
  await login(page, "buyer");
  await expect(page).toHaveURL("/dashboard/buyer");
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");
  await expect(
    page
      .getByRole("banner")
      .getByRole("link", { name: "Login", exact: true }),
  ).toBeVisible();
});
