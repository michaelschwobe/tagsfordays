import { consoleError } from "../../tests/setup/setup-test-env";
import { init } from "./env.server";

describe("init", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should log an error message if any environment variable is invalid", () => {
    process.env = {
      NODE_ENV: "production",
      PORT: "3000",
      DATABASE_URL: "file:./data.db?connection_limit=1",
      // @ts-expect-error - Testing invalid input
      SESSION_SECRET: 100,
    };
    consoleError.mockImplementation(() => {});

    try {
      init();
    } catch (error) {
      expect(console.error).toHaveBeenCalledWith(
        "❌ Invalid environment variables:",
        { SESSION_SECRET: ["Expected string, received number"] },
      );
    }
  });

  it("should throw an error if any environment variable is invalid", () => {
    process.env = {
      NODE_ENV: "production",
      PORT: "3000",
      DATABASE_URL: "file:./data.db?connection_limit=1",
      // @ts-expect-error - Testing invalid input
      SESSION_SECRET: 100,
    };
    consoleError.mockImplementation(() => {});

    expect(init).toThrowError("Invalid environment variables");
  });

  it("should not throw an error if all environment variables are valid", () => {
    process.env = {
      NODE_ENV: "production",
      PORT: "3000",
      DATABASE_URL: "file:./data.db?connection_limit=1",
      SESSION_SECRET: "somesessionsecret",
    };

    expect(init).not.toThrow();
  });
});
