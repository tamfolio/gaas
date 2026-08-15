import { test as setup, expect, request } from "@playwright/test";
import fs from "fs";

const AUTH_DIR = "tests/e2e/.auth";

setup.beforeAll(async () => {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  // Seed all test accounts in one shot
  const api = await request.newContext({ baseURL: "http://localhost:3000" });
  const res = await api.post("/api/dev/seed-test-accounts", {
    data: { secret: process.env.SEED_SECRET },
  });
  const body = await res.json();
  if (!body.ok) throw new Error(`Seed failed: ${JSON.stringify(body)}`);
  await api.dispose();
});

async function loginAs(
  page: Parameters<Parameters<typeof setup>[1]>[0],
  email: string,
  password: string,
  expectedUrlPattern: string,
  stateFile: string
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(expectedUrlPattern, { timeout: 10000 });
  await page.context().storageState({ path: stateFile });
}

setup("auth: gym owner", async ({ page }) => {
  await loginAs(
    page,
    process.env.TEST_GYM_OWNER_EMAIL!,
    process.env.TEST_GYM_OWNER_PASSWORD!,
    "**/gym-admin",
    `${AUTH_DIR}/gym-owner.json`
  );
});

setup("auth: platform admin", async ({ page }) => {
  await loginAs(
    page,
    process.env.TEST_PLATFORM_ADMIN_EMAIL!,
    process.env.TEST_PLATFORM_ADMIN_PASSWORD!,
    "**/super-admin",
    `${AUTH_DIR}/platform-admin.json`
  );
});

setup("auth: front desk", async ({ page }) => {
  await loginAs(
    page,
    process.env.TEST_FRONT_DESK_EMAIL!,
    process.env.TEST_FRONT_DESK_PASSWORD!,
    "**/gym-admin",
    `${AUTH_DIR}/front-desk.json`
  );
});
