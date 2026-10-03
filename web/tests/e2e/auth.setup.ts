import { test as setup, request } from "@playwright/test";
import fs from "fs";

const AUTH_DIR = "tests/e2e/.auth";

async function loginAs(
  page: Parameters<Parameters<typeof setup>[1]>[0],
  email: string,
  password: string,
  expectedUrlPattern: string,
  stateFile: string
) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill(email);
  await page.locator("input[name='password']").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(expectedUrlPattern, { timeout: 20000 });
  await page.context().storageState({ path: stateFile });
}

// The seed lives inside auth: gym owner (the first test), NOT in beforeAll.
// This way, if a LATER test (e.g. auth: member) fails and retries, only that
// test's login is retried — the seed is NOT re-run, so it cannot call
// updateUserById again and invalidate the already-saved sessions for the
// earlier roles. If auth: gym owner itself retries, the seed re-runs, but
// no other sessions exist yet, so nothing is invalidated.
setup("auth: gym owner", async ({ page }) => {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  const api = await request.newContext({ baseURL: "http://localhost:3000" });
  const res = await api.post("/api/dev/seed-test-accounts", {
    data: { secret: process.env.SEED_SECRET },
  });
  const body = await res.json();
  await api.dispose();
  if (!body.ok) throw new Error(`Seed failed: ${JSON.stringify(body)}`);

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

setup("auth: trainer", async ({ page }) => {
  await loginAs(
    page,
    process.env.TEST_TRAINER_EMAIL!,
    process.env.TEST_TRAINER_PASSWORD!,
    "**/trainer",
    `${AUTH_DIR}/trainer.json`
  );
});

setup("auth: member", async ({ page }) => {
  await loginAs(
    page,
    process.env.TEST_MEMBER_EMAIL!,
    process.env.TEST_MEMBER_PASSWORD!,
    "**/member",
    `${AUTH_DIR}/member.json`
  );
});
