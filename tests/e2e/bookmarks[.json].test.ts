import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/bookmarks.json");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks.json" }),
  );
});

test("[AUTH] User can NOT view the page", async ({ page, login }) => {
  await login();
  await page.goto("/bookmarks.json");

  await page.waitForURL("/bookmarks");
});
