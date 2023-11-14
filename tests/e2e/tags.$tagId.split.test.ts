import {
  encodeUrl,
  expect,
  login,
  logout,
  test,
} from "../utils/playwright-test-utils";

test.describe("Unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tags/tid0/split");
  });

  test("User can NOT view the page", async ({ page }) => {
    await expect(page).toHaveURL(
      encodeUrl({ page, url: "/login?redirectTo=/tags/tid0/split" }),
    );
  });
});

test.describe("Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    // Login from a different page so we have a history to redirect back to.
    const { redirectTo } = await login({ page });
    await page.waitForURL(redirectTo);
    await page.goto("/tags/tid0/split");
  });

  test.afterEach(async ({ page }) => {
    await logout({ page });
  });

  test("User can view the page title", async ({ page }) => {
    await expect(page).toHaveTitle(/^Splitting Tag… \|/);
  });

  test("User can cancel viewing the form/page", async ({ page }) => {
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page).toHaveURL("/");
  });

  test("User can NOT split tag without valid Target(s)", async ({ page }) => {
    await page.getByLabel("Target").fill("");
    await page.getByRole("button", { name: "Split tag" }).press("Enter");

    await expect(page.getByText("Name is required")).toBeVisible();

    await page.getByLabel("Target").fill("x");
    await page.getByRole("button", { name: "Split tag" }).press("Enter");

    await expect(page.getByText("Name is too short")).toBeVisible();

    await page.getByLabel("Target").fill("x".repeat(46));
    await page.getByRole("button", { name: "Split tag" }).press("Enter");

    await expect(page.getByText("Name is too long")).toBeVisible();

    await page.getByLabel("Target").fill("x!");
    await page.getByRole("button", { name: "Split tag" }).press("Enter");

    await expect(
      page.getByText(
        "Name can only include letters, numbers, hyphens, and periods",
      ),
    ).toBeVisible();

    await page.getByLabel("Target").fill("t1,tag2,t3");
    await page.getByRole("button", { name: "Split tag" }).press("Enter");

    await expect(page.getByText("Name must be unique")).toBeVisible();
  });
});
