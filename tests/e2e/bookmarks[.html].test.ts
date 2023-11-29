import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/bookmarks.html");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks.html" }),
  );
});

test("[AUTH] User can NOT view the page", async ({ page, login }) => {
  await login();
  await page.goto("/bookmarks.html");

  await page.waitForURL("/bookmarks");
});
