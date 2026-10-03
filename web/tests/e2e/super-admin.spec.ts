import { test, expect } from "@playwright/test";

// ── Auth guard ────────────────────────────────────────────────────────────────
test("gym admin cannot access super-admin", async ({ browser }) => {
  const ctx = await browser.newContext({
    storageState: "tests/e2e/.auth/gym-owner.json",
  });
  const page = await ctx.newPage();
  await page.goto("/super-admin");
  await expect(page).toHaveURL(/login/);
  await ctx.close();
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
test.describe("dashboard", () => {
  test("super admin dashboard loads", async ({ page }) => {
    await page.goto("/super-admin");
    await expect(page).toHaveURL(/super-admin/);
  });
});

// ── Gyms ──────────────────────────────────────────────────────────────────────
test.describe("gyms list", () => {
  test("gyms page loads", async ({ page }) => {
    await page.goto("/super-admin/gyms");
    await expect(page.getByRole("heading", { name: /gyms/i })).toBeVisible();
  });

  test("status filter tabs are visible", async ({ page }) => {
    await page.goto("/super-admin/gyms");
    await expect(page.getByRole("link", { name: /pending/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /active/i })).toBeVisible();
  });

  test("pending tab shows pending gyms or empty state", async ({ page }) => {
    await page.goto("/super-admin/gyms?status=pending");
    const hasRows = await page.locator("table tbody tr, [class*='gym-card']").count() > 0;
    const hasEmpty = await page.getByText(/no gyms|no pending/i).isVisible().catch(() => false);
    expect(hasRows || hasEmpty).toBeTruthy();
  });

  test("all-gyms view shows the test gym", async ({ page }) => {
    // Test gym has subscription_status: 'trial', not 'active' — check the unfiltered list
    await page.goto("/super-admin/gyms");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/test gym/i).first()).toBeVisible({ timeout: 6000 });
  });

  test("trial tab shows the test gym", async ({ page }) => {
    await page.goto("/super-admin/gyms?status=trial");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/test gym/i).first()).toBeVisible({ timeout: 6000 });
  });
});

// ── Team ──────────────────────────────────────────────────────────────────────
test.describe("platform team", () => {
  test("team page loads", async ({ page }) => {
    await page.goto("/super-admin/team");
    await expect(page).toHaveURL(/super-admin\/team/);
  });

  test("invite staff form is visible on team page", async ({ page }) => {
    await page.goto("/super-admin/team");
    await page.waitForLoadState("networkidle");
    // Inline form — no dialog. "Send invite" button is always on the page.
    await expect(page.getByRole("button", { name: /send invite/i })).toBeVisible();
  });

  test("invite form has an email field", async ({ page }) => {
    await page.goto("/super-admin/team");
    await page.waitForLoadState("networkidle");
    // Label has no htmlFor — locate by placeholder instead
    await expect(page.getByPlaceholder("jane@example.com")).toBeVisible();
  });
});
