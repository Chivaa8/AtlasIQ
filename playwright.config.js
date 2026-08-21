import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/setup.js",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:8022",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "Chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "Edge", use: { ...devices["Desktop Edge"], channel: "msedge" } },
    { name: "Firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "Safari-WebKit", use: { ...devices["Desktop Safari"] } }
  ]
});
