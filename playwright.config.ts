import { defineConfig, devices } from "@playwright/test";
// import 'dotenv/config';

const PORT = process.env["PORT"] || "3000";

export default defineConfig({
  testDir: "./tests/e2e",

  fullyParallel: true,

  ...(process.env["CI"]
    ? {
        retries: 2,
        workers: 1,
      }
    : {
        retries: 0,
      }),

  forbidOnly: Boolean(process.env["CI"]),

  reporter: "html",

  use: {
    baseURL: `http://127.0.0.1:${PORT}`, // `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: process.env["CI"] ? "pnpm run start:mocks" : "pnpm run dev",

    stdout: "pipe",

    reuseExistingServer: !process.env["CI"],

    port: Number(PORT),

    env: { PORT },
  },
});
