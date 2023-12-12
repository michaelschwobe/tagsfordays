import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/bookmarks/status");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks/status" }),
  );
});

test("[AUTH] User can view the page title", async ({ page, login }) => {
  await login("/bookmarks/status");

  await expect(page).toHaveTitle(/^Status \|/);
});
