import { expect, login, logout, test } from "../utils/playwright-test-utils";

test.describe("Login invalid", () => {
  test("User can not login if using missing data", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username").press("Enter");
    await expect(page.getByText("Username is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("User can not login if using short data", async ({ page }) => {
    await login({ page, username: "x", password: "x" });
    await expect(page.getByText("Username is too short")).toBeVisible();
    await expect(page.getByText("Password is too short")).toBeVisible();
  });

  test("User can not login if using long data", async ({ page }) => {
    await login({ page, username: "x".repeat(21), password: "x".repeat(46) });
    await expect(page.getByText("Username is too long")).toBeVisible();
    await expect(page.getByText("Password is too long")).toBeVisible();
  });

  test("User can not login if using disallowed data", async ({ page }) => {
    await login({ page, username: "<script></script>" });
    await expect(
      page.getByText(
        "Username can only include letters, numbers, and underscores",
      ),
    ).toBeVisible();
  });

  test("User can not login if using invalid data", async ({ page }) => {
    await login({ page, username: "badvalue" });
    await expect(page.getByText("Invalid username or password")).toBeVisible();

    await login({ page, password: "badvalue" });
    await expect(page.getByText("Invalid username or password")).toBeVisible();

    await login({ page, username: "badvalue", password: "badvalue" });
    await expect(page.getByText("Invalid username or password")).toBeVisible();
  });
});

test.describe("Login valid", () => {
  test("User can login and is redirected if using valid data", async ({
    page,
  }) => {
    const { redirectTo, username } = await login({ page, to: "/tags" });

    await page.waitForURL(redirectTo);
    await expect(
      page.getByTestId("username").getByText(username),
    ).toBeVisible();

    await logout({ page });

    await expect(
      page.getByTestId("username").getByText(username),
    ).not.toBeVisible();
  });
});
