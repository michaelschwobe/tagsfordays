/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["app/**/*.test.{ts,tsx}"],
    coverage: { all: true, include: ["app/**/*.{ts,tsx}"] },
    setupFiles: ["tests/setup/setup-test-env.ts"],
  },
});
