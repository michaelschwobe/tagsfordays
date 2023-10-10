import {
  encodeUrlRedirectTo,
  expect,
  login,
  logout,
  test,
} from "../utils/playwright-test-utils";

test.describe("Unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tags/tid0/merge");
  });

  test("User can NOT view the page", async ({ page }) => {
    await expect(page).toHaveURL(
      encodeUrlRedirectTo({
        page,
        url: "/login?redirectTo=/tags/tid0/merge",
      }),
    );
  });
});

test.describe("Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    // Login from a different page so we have a history to redirect back to.
    const { redirectTo } = await login({ page });
    await page.waitForURL(redirectTo);
    await page.goto("/tags/tid0/merge");
  });

  test.afterEach(async ({ page }) => {
    await logout({ page });
  });

  test("User can view the page title", async ({ page }) => {
    await expect(page).toHaveTitle(/^Merging Tag… \|/);
  });

  test("User can cancel viewing the form/page", async ({ page }) => {
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page).toHaveURL("/");
  });

  test("User can NOT merge tag without valid Target", async ({ page }) => {
    await page.getByLabel("Target").click();
    await page.locator("body").press("Escape");
    await page.getByRole("button", { name: "Merge tag" }).press("Enter");

    await expect(page.getByText("Name is required")).toBeVisible();
  });
});
