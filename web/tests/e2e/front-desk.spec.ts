import { test, expect } from "@playwright/test";

// ── Auth guard ─────────────────────────────────────────────────────────────
test("unauthenticated user is redirected to login", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto("/gym-admin");
  await expect(page).toHaveURL(/login/);
  await ctx.close();
});

// ── Permitted routes ──────────────────────────────────────────────────────────
test.describe("permitted access", () => {
  test("can access check-in page and QR is visible", async ({ page }) => {
    await page.goto("/gym-admin/check-in");
    await expect(page).toHaveURL(/check-in/);
    await expect(page.locator("svg").first()).toBeVisible();
  });

  test("can access members list", async ({ page }) => {
    await page.goto("/gym-admin/members");
    await expect(page).toHaveURL(/members/);
  });

  test("can access guest visits", async ({ page }) => {
    await page.goto("/gym-admin/guests");
    await expect(page).toHaveURL(/guests/);
  });

  test("can view notifications", async ({ page }) => {
    await page.goto("/gym-admin/notifications");
    await expect(page).toHaveURL(/notifications/);
  });

  // Settings and plans have no role-based restriction — front desk can access them
  test("can access settings page", async ({ page }) => {
    await page.goto("/gym-admin/settings");
    await expect(page).toHaveURL(/settings/);
  });

  test("can access plans page", async ({ page }) => {
    await page.goto("/gym-admin/plans");
    await expect(page).toHaveURL(/plans/);
  });
});

// ── Restricted routes ─────────────────────────────────────────────────────────
test.describe("restricted access", () => {
  test("cannot access team management", async ({ page }) => {
    await page.goto("/gym-admin/team");
    // Team page redirects non-admin roles back to /gym-admin
    await expect(page).not.toHaveURL(/\/team/);
  });

  test("cannot access super admin", async ({ page }) => {
    await page.goto("/super-admin");
    await expect(page).toHaveURL(/login|gym-admin/);
  });
});
