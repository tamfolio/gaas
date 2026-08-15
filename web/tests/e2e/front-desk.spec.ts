import { test, expect } from "@playwright/test";

test("front desk can access check-in", async ({ page }) => {
  await page.goto("/gym-admin/check-in");
  await expect(page).toHaveURL(/check-in/);
});

test("front desk can access members", async ({ page }) => {
  await page.goto("/gym-admin/members");
  await expect(page).toHaveURL(/members/);
});

test("front desk cannot access settings", async ({ page }) => {
  await page.goto("/gym-admin/settings");
  // middleware or layout should redirect away
  await expect(page).not.toHaveURL(/settings/);
});

test("front desk cannot access team", async ({ page }) => {
  await page.goto("/gym-admin/team");
  await expect(page).not.toHaveURL(/team/);
});
