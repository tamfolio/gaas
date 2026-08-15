import { test, expect } from "@playwright/test";

test("dashboard loads", async ({ page }) => {
  await page.goto("/gym-admin");
  await expect(page).toHaveURL(/gym-admin/);
});

test("team page is accessible", async ({ page }) => {
  await page.goto("/gym-admin/team");
  await expect(page.getByRole("heading", { name: "Team" })).toBeVisible();
});

test("guests page loads", async ({ page }) => {
  await page.goto("/gym-admin/guests");
  await expect(page.getByRole("heading", { name: /guest visits/i })).toBeVisible();
});

test("settings page loads", async ({ page }) => {
  await page.goto("/gym-admin/settings");
  await expect(page).toHaveURL(/settings/);
});

test("unauthenticated user is redirected to login", async ({ browser }) => {
  const ctx = await browser.newContext(); // fresh context, no session
  const page = await ctx.newPage();
  await page.goto("/gym-admin");
  await expect(page).toHaveURL(/login/);
  await ctx.close();
});
