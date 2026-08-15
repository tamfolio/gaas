import { defineConfig } from "@playwright/test";
import { existsSync } from "fs";

// Load .env.test when running locally (Node 20.12+ built-in)
if (existsSync(".env.test")) {
  (process as NodeJS.Process & { loadEnvFile?: (path: string) => void })
    .loadEnvFile?.(".env.test");
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 1,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "gym-admin",
      testMatch: /gym-admin\.spec\.ts/,
      dependencies: ["setup"],
      use: { storageState: "tests/e2e/.auth/gym-owner.json" },
    },
    {
      name: "super-admin",
      testMatch: /super-admin\.spec\.ts/,
      dependencies: ["setup"],
      use: { storageState: "tests/e2e/.auth/platform-admin.json" },
    },
    {
      name: "front-desk",
      testMatch: /front-desk\.spec\.ts/,
      dependencies: ["setup"],
      use: { storageState: "tests/e2e/.auth/front-desk.json" },
    },
  ],
});
