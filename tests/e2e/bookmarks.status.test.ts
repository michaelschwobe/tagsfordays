import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/bookmarks/status");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks/status" }),
  );
});

test("[AUTH] User can cancel viewing the form/page", async ({
  page,
  login,
}) => {
  // Login from a different page so we have a history to redirect back to.
  await login();
  await page.goto("/bookmarks/status");

  await page.getByRole("button", { name: "Bookmarks" }).click();

  await expect(page).toHaveURL("/bookmarks");
});

test("[AUTH] User can view the page title", async ({ page, login }) => {
  await login("/bookmarks/status");

  await expect(page).toHaveTitle(/ Bookmarks Status \|/);
});
