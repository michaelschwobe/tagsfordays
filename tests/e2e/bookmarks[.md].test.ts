import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/bookmarks.md");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks.md" }),
  );
});

test("[AUTH] User can NOT view the page", async ({ page, login }) => {
  await login();
  await page.goto("/bookmarks.md");

  await page.waitForURL("/bookmarks");
});
