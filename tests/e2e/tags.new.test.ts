import {
  encodeUrlRedirectTo,
  expect,
  login,
  logout,
  test,
} from "../utils/playwright-test-utils";

test.describe("Unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tags/new");
  });

  test("User can NOT view the page", async ({ page }) => {
    await expect(page).toHaveURL(
      encodeUrlRedirectTo({ page, url: "/login?redirectTo=/tags/new" }),
    );
  });
});

test.describe("Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    // Login from a different page so we have a history to redirect back to.
    const { redirectTo } = await login({ page });
    await page.waitForURL(redirectTo);
    await page.goto("/tags/new");
  });

  test.afterEach(async ({ page }) => {
    await logout({ page });
  });

  test("User can view the page title", async ({ page }) => {
    await expect(page).toHaveTitle(/^New Tag \|/);
  });

  test("User can cancel viewing the form/page", async ({ page }) => {
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page).toHaveURL("/");
  });

  test("User can NOT add tag(s) without valid Name(s)", async ({ page }) => {
    await page.getByLabel("Name").fill("");
    await page.getByRole("button", { name: "Add tag" }).press("Enter");

    await expect(page.getByText("Name is required")).toBeVisible();

    await page.getByLabel("Name").fill("x");
    await page.getByRole("button", { name: "Add tag" }).press("Enter");

    await expect(page.getByText("Name is too short")).toBeVisible();

    await page.getByLabel("Name").fill("x".repeat(46));
    await page.getByRole("button", { name: "Add tag" }).press("Enter");

    await expect(page.getByText("Name is too long")).toBeVisible();

    await page.getByLabel("Name").fill("x!");
    await page.getByRole("button", { name: "Add tag" }).press("Enter");

    await expect(
      page.getByText(
        "Name can only include letters, numbers, hyphens, and periods",
      ),
    ).toBeVisible();

    await page.getByLabel("Name").fill("t1,tag2,t3");
    await page.getByRole("button", { name: "Add tag" }).press("Enter");

    await expect(page.getByText("Name must be unique")).toBeVisible();
  });
});
