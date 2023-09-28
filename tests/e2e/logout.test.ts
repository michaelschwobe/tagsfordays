import { expect, login, test } from "../utils/playwright-test-utils";

test.describe("Logout GET", () => {
  test("User is redirected to the homepage by default", async ({ page }) => {
    await page.goto("/logout");
    await page.waitForURL("/");
  });

  test("User is redirected to page the request came from", async ({ page }) => {
    const redirectTo = "/tags";
    await page.goto(`/logout?redirectTo=${redirectTo}`);
    await page.waitForURL(redirectTo);
  });

  test("User session is preserved", async ({ page }) => {
    const { username } = await login({ page, to: "/logout" });
    await page.waitForURL("/");
    await expect(
      page.getByTestId("username").getByText(username),
    ).toBeVisible();
  });
});

test.describe("Logout POST", () => {
  test("User session is destroyed", async ({ page }) => {
    const { username } = await login({ page, to: "/logout" });
    await page.waitForURL("/");
    await expect(
      page.getByTestId("username").getByText(username),
    ).not.toBeVisible();
  });
});
