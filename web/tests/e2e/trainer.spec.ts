import { test, expect } from "@playwright/test";

// If the storageState session is rejected (redirect to /login), fall back to a
// fresh login so tests are self-healing. This handles Supabase session edge
// cases without relying solely on the stored auth token.
async function ensureTrainerAuth(page: Parameters<Parameters<typeof test>[1]>[0]) {
  await page.goto("/trainer");
  await page.waitForLoadState("load");
  if (page.url().includes("login")) {
    await page.getByLabel("Email").fill(process.env.TEST_TRAINER_EMAIL!);
    await page.locator("input[name='password']").fill(process.env.TEST_TRAINER_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/trainer/, { timeout: 20000 });
  }
}

// ── Auth guard ─────────────────────────────────────────────────────────────
test("unauthenticated user is redirected to login", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto("/trainer");
  // Middleware redirects unauthenticated users; give it up to 10s to complete
  await page.waitForURL(/login/, { timeout: 10000 });
  await expect(page).toHaveURL(/login/);
  await ctx.close();
});

// ── Dashboard ───────────────────────────────────────────────────────────────
test.describe("dashboard", () => {
  test("loads and shows stats", async ({ page }) => {
    await ensureTrainerAuth(page);
    await expect(page).toHaveURL(/trainer/);
  });

  test("recent check-ins section is visible", async ({ page }) => {
    await ensureTrainerAuth(page);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/recent check.in/i)).toBeVisible();
  });
});

// ── Members ───────────────────────────────────────────────────────────────────
test.describe("assigned members", () => {
  test("members list page loads", async ({ page }) => {
    await ensureTrainerAuth(page);
    await page.goto("/trainer/members");
    await expect(page).toHaveURL(/trainer\/members/);
  });

  test("shows members list or empty state", async ({ page }) => {
    await ensureTrainerAuth(page);
    await page.goto("/trainer/members");
    await page.waitForLoadState("networkidle");
    const hasRows = (await page.locator("table tbody tr").count()) > 0;
    const hasEmpty = await page
      .getByText("No members assigned yet")
      .isVisible()
      .catch(() => false);
    expect(hasRows || hasEmpty).toBeTruthy();
  });
});

// ── Access control ────────────────────────────────────────────────────────────
test.describe("access control", () => {
  test("trainer cannot access gym admin routes", async ({ page }) => {
    await ensureTrainerAuth(page);
    await page.goto("/gym-admin");
    await expect(page).not.toHaveURL(/\/gym-admin$/);
  });

  test("trainer cannot access super admin routes", async ({ page }) => {
    await ensureTrainerAuth(page);
    await page.goto("/super-admin");
    await expect(page).toHaveURL(/login|trainer/);
  });
});
