import { test, expect } from "@playwright/test";

test("gyms list loads", async ({ page }) => {
  await page.goto("/super-admin/gyms");
  await expect(page.getByRole("heading", { name: "Gyms" })).toBeVisible();
});

test("status filter tabs are visible", async ({ page }) => {
  await page.goto("/super-admin/gyms");
  await expect(page.getByRole("link", { name: "Pending" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Active" })).toBeVisible();
});

test("team page loads", async ({ page }) => {
  await page.goto("/super-admin/team");
  await expect(page).toHaveURL(/super-admin\/team/);
});

test("gym admin cannot access super-admin", async ({ browser }) => {
  // Uses gym-owner session, not platform-admin session
  const ctx = await browser.newContext({
    storageState: "tests/e2e/.auth/gym-owner.json",
  });
  const page = await ctx.newPage();
  await page.goto("/super-admin");
  await expect(page).toHaveURL(/login/);
  await ctx.close();
});
