import { expect, login, test } from "../utils/playwright-test-utils";

test.describe("GET", () => {
  test("User is redirected to the homepage by default", async ({ page }) => {
    await page.goto("/logout");

    await expect(page).toHaveURL("/");
  });

  test("User is redirected to page the request came from", async ({ page }) => {
    const redirectTo = "/tags";
    await page.goto(`/logout?redirectTo=${redirectTo}`);

    await expect(page).toHaveURL(redirectTo);
  });

  test("User session is NOT destroyed", async ({ page }) => {
    const { username } = await login({ page, to: "/logout" });

    await page.waitForURL("/");
    await expect(
      page.getByTestId("username").getByText(username),
    ).toBeVisible();
  });
});

test.describe("POST", () => {
  test("User session is destroyed", async ({ page }) => {
    const { username } = await login({ page, to: "/logout" });

    await page.waitForURL("/");
    await expect(
      page.getByTestId("username").getByText(username),
    ).not.toBeVisible();
  });
});
