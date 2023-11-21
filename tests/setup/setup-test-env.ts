import "dotenv/config";
import { getEnv } from "../../app/utils/env.server";

import { installGlobals } from "@remix-run/node";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { SpyInstance } from "vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { server } from "../mocks/node";

installGlobals();
global.ENV = getEnv();

export let consoleError: SpyInstance<Parameters<(typeof console)["error"]>>;
function mockConsoleError() {
  const originalConsoleError = console.error;
  consoleError = vi.spyOn(console, "error");
  consoleError.mockImplementation(
    (...args: Parameters<typeof console.error>) => {
      originalConsoleError(...args);
      throw new Error(
        "Console error was called. Call consoleError.mockImplementation(() => {}) if this is expected.",
      );
    },
  );
}

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  mockConsoleError();
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
});
