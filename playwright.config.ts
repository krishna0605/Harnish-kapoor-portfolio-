import { defineConfig, devices } from "@playwright/test";

/** End-to-end tests against the production build. */
export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:3100",
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  },
  webServer: {
    // CI builds in its own step; locally, build first so the tests never run a stale build
    command: process.env.CI ? "npm run start -- -p 3100" : "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
