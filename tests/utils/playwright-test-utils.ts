import type { Page } from "@playwright/test";
import { test as base } from "@playwright/test";

export * from "./db-utils";

export function encodeUrl({ page, url }: { page: Page; url: string }) {
  const { pathname, searchParams } = new URL(url, page.url());
  return [pathname, searchParams.toString()].join("?");
}

export const test = base.extend<{
  login(to?: string | undefined): Promise<void>;
}>({
  login: async ({ page }, use) => {
    await use(async (to) => {
      const username = "someuser";
      const password = "somepass";
      const redirectTo = to ?? "/";
      await page.goto(`/login?redirectTo=${redirectTo}`);
      await page.getByLabel("Username").fill(username);
      await page.getByLabel("Username").press("Tab");
      await page.getByLabel("Password").fill(password);
      await page.getByLabel("Password").press("Enter");
      await page.waitForURL(redirectTo);
    });
    // Clean up after each test
    await page.getByRole("button", { name: "Log out", exact: true }).click();
  },
});

export { expect } from "@playwright/test";
