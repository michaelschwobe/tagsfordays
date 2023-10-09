import { expect, login, logout, test } from "../utils/playwright-test-utils";

test("User can view the page title", async ({ page }) => {
  await page.goto("/login");

  await expect(page).toHaveTitle(/^Login \|/);
});

test.describe("Invalid", () => {
  test("User can NOT login if using missing data", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Username").press("Enter");

    await expect(page.getByText("Username is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("User can NOT login if using short data", async ({ page }) => {
    await login({ page, username: "x", password: "x" });

    await expect(page.getByText("Username is too short")).toBeVisible();
    await expect(page.getByText("Password is too short")).toBeVisible();
  });

  test("User can NOT login if using long data", async ({ page }) => {
    await login({ page, username: "x".repeat(21), password: "x".repeat(46) });

    await expect(page.getByText("Username is too long")).toBeVisible();
    await expect(page.getByText("Password is too long")).toBeVisible();
  });

  test("User can NOT login if using disallowed data", async ({ page }) => {
    await login({ page, username: "<script></script>" });

    await expect(
      page.getByText(
        "Username can only include letters, numbers, and underscores",
      ),
    ).toBeVisible();
  });

  test("User can NOT login if using invalid username", async ({ page }) => {
    await login({ page, username: "badvalue" });

    await expect(page.getByText("Invalid username or password")).toBeVisible();
  });

  test("User can NOT login if using invalid password", async ({ page }) => {
    await login({ page, password: "badvalue" });

    await expect(page.getByText("Invalid username or password")).toBeVisible();
  });

  test("User can NOT login if using invalid username and password", async ({
    page,
  }) => {
    await login({ page, username: "badvalue", password: "badvalue" });

    await expect(page.getByText("Invalid username or password")).toBeVisible();
  });
});

test.describe("Valid", () => {
  test("User can login and is redirected", async ({ page }) => {
    const { redirectTo, username } = await login({ page, to: "/tags" });
    await page.waitForURL(redirectTo);

    await expect(
      page.getByTestId("username").getByText(username),
    ).toBeVisible();

    await logout({ page });

    await expect(page).toHaveURL("/tags");
    await expect(
      page.getByTestId("username").getByText(username),
    ).not.toBeVisible();
  });
});
