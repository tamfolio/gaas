import { test, expect } from "@playwright/test";

// ── Auth guard ─────────────────────────────────────────────────────────────
test("unauthenticated user is redirected to login", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto("/member");
  await expect(page).toHaveURL(/login/);
  await ctx.close();
});

// ── Dashboard ───────────────────────────────────────────────────────────────
test.describe("dashboard", () => {
  test("loads and shows membership status", async ({ page }) => {
    await page.goto("/member");
    await expect(page).toHaveURL(/member/);
    await expect(page.getByText(/active|pending|expired/i).first()).toBeVisible();
  });

  test("referral card is visible", async ({ page }) => {
    await page.goto("/member");
    await expect(page.getByText(/referral/i).first()).toBeVisible();
  });
});

// ── Check-in ────────────────────────────────────────────────────────────────
test.describe("check-in history", () => {
  test("check-in history page loads", async ({ page }) => {
    // Route is /member/checkins (with 's')
    await page.goto("/member/checkins");
    await expect(page).toHaveURL(/checkins/);
    await expect(page.getByRole("heading", { name: /check.in history/i })).toBeVisible();
  });

  test("calendar view is visible", async ({ page }) => {
    await page.goto("/member/checkins");
    await page.waitForLoadState("networkidle");
    // Calendar renders DAYS = ["Sun","Mon",...] as column headers (inline styles, no CSS classes)
    await expect(page.getByText("Sun").first()).toBeVisible({ timeout: 8000 });
  });
});

// ── BMI tracker ─────────────────────────────────────────────────────────────
test.describe("BMI tracker", () => {
  test("BMI page loads", async ({ page }) => {
    await page.goto("/member/bmi");
    await expect(page).toHaveURL(/bmi/);
  });

  test("log BMI form has weight and height inputs", async ({ page }) => {
    await page.goto("/member/bmi");
    await expect(page.getByLabel(/weight/i)).toBeVisible();
    await expect(page.getByLabel(/height/i)).toBeVisible();
  });

  test("submitting BMI does not crash the page", async ({ page }) => {
    await page.goto("/member/bmi");
    await page.getByLabel(/weight/i).fill("75");
    await page.getByLabel(/height/i).fill("175");
    await page.getByRole("button", { name: /save measurement/i }).click();
    await page.waitForTimeout(4000);
    // Page should still be on /bmi (no navigation crash)
    await expect(page).toHaveURL(/bmi/);
  });
});

// ── Workout plan ─────────────────────────────────────────────────────────────
test.describe("workout plan", () => {
  test("workout plan page loads", async ({ page }) => {
    await page.goto("/member/workout");
    await expect(page).toHaveURL(/workout/);
  });
});

// ── Notifications ─────────────────────────────────────────────────────────────
test.describe("notifications", () => {
  test("notifications page loads", async ({ page }) => {
    await page.goto("/member/notifications");
    await expect(page).toHaveURL(/notifications/);
  });
});

// ── Profile ──────────────────────────────────────────────────────────────────
test.describe("profile", () => {
  test("profile page loads with name input", async ({ page }) => {
    await page.goto("/member/profile");
    await expect(page).toHaveURL(/profile/);
    // Label is a custom <span>, not <label> — use placeholder
    await expect(page.getByPlaceholder("Your full name")).toBeVisible();
  });

  test("profile name field is editable", async ({ page }) => {
    await page.goto("/member/profile");
    const nameInput = page.getByPlaceholder("Your full name");
    await nameInput.fill("Test Member Updated");
    await expect(nameInput).toHaveValue("Test Member Updated");
  });
});

// ── Referral ──────────────────────────────────────────────────────────────────
test.describe("referral", () => {
  test("referral page loads with unique code", async ({ page }) => {
    await page.goto("/member/referral");
    await expect(page).toHaveURL(/referral/);
    await expect(page.getByText(/[A-Z0-9]{6}/).first()).toBeVisible();
  });
});
