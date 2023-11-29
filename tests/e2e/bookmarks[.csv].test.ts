import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/bookmarks.csv");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks.csv" }),
  );
});

test("[AUTH] User can NOT view the page", async ({ page, login }) => {
  await login();
  await page.goto("/bookmarks.csv");

  await page.waitForURL("/bookmarks");
});
