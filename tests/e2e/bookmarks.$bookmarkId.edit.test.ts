import {
  encodeUrlRedirectTo,
  expect,
  login,
  logout,
  test,
} from "../utils/playwright-test-utils";

test.describe("Unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/bookmarks/bid2/edit");
  });

  test("User can NOT view the page", async ({ page }) => {
    await expect(page).toHaveURL(
      encodeUrlRedirectTo({
        page,
        url: "/login?redirectTo=/bookmarks/bid2/edit",
      }),
    );
  });
});

test.describe("Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    // Login from a different page so we have a history to redirect back to.
    const { redirectTo } = await login({ page });
    await page.waitForURL(redirectTo);
    await page.goto("/bookmarks/bid2/edit");
  });

  test.afterEach(async ({ page }) => {
    await logout({ page });
  });

  test("User can view the page title", async ({ page }) => {
    await expect(page).toHaveTitle(/^Editing Bookmark… \|/);
  });

  test("User can cancel viewing the form/page", async ({ page }) => {
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page).toHaveURL("/");
  });

  test("User can toggle bookmark tags", async ({ page }) => {
    await page
      .getByRole("button", { name: "Remove tag1", exact: true })
      .press("Enter");
    await page
      .getByRole("button", { name: "Add tag1", exact: true })
      .press("Enter");
  });

  test("User can NOT update bookmark without valid URL", async ({ page }) => {
    await page.getByLabel("URL").fill("");
    await page.getByRole("button", { name: "Update bookmark" }).press("Enter");

    await expect(page.getByText("URL is required")).toBeVisible();

    await page.getByLabel("URL").fill("x");
    await page.getByRole("button", { name: "Update bookmark" }).press("Enter");

    await expect(page.getByText("URL is invalid")).toBeVisible();

    await page.getByLabel("URL").fill("http://remix.run");
    await page.getByRole("button", { name: "Update bookmark" }).press("Enter");

    await expect(page.getByText("URL is insecure, use https")).toBeVisible();

    await page.getByLabel("URL").fill("https://x.x");
    await page.getByRole("button", { name: "Update bookmark" }).press("Enter");

    await expect(page.getByText("URL is too short")).toBeVisible();

    const urlOfLength2001 = "https://".concat("x".repeat(1991)).concat(".x");
    await page.getByLabel("URL").fill(urlOfLength2001);
    await page.getByRole("button", { name: "Update bookmark" }).press("Enter");

    await expect(page.getByText("URL is too long")).toBeVisible();

    await page.getByLabel("URL").fill("https://conform.guide");
    await page.getByRole("button", { name: "Update bookmark" }).press("Enter");

    await expect(page.getByText("URL must be unique")).toBeVisible();
  });

  test("User can NOT update bookmark without valid Title", async ({ page }) => {
    await page.getByLabel("Title").fill("x");
    await page.getByRole("button", { name: "Update bookmark" }).press("Enter");

    await expect(page.getByText("Title is too short")).toBeVisible();

    await page.getByLabel("Title").fill("x".repeat(46));
    await page.getByRole("button", { name: "Update bookmark" }).press("Enter");

    await expect(page.getByText("Title is too long")).toBeVisible();
  });

  test("User can NOT update bookmark without valid Content", async ({
    page,
  }) => {
    await page.getByLabel("Content").fill("x");
    await page.getByRole("button", { name: "Update bookmark" }).press("Enter");

    await expect(page.getByText("Content is too short")).toBeVisible();

    await page.getByLabel("Content").fill("x".repeat(256));
    await page.getByRole("button", { name: "Update bookmark" }).press("Enter");

    await expect(page.getByText("Content is too long")).toBeVisible();
  });
});
