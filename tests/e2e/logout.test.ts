import { expect, test } from "../utils/playwright-test-utils";

test("User is redirected to the homepage by default", async ({ page }) => {
  await page.goto("/logout");

  await expect(page).toHaveURL("/");
});

test("User is redirected to page the request came from", async ({ page }) => {
  const redirectTo = "/tags";
  await page.goto(`/logout?redirectTo=${redirectTo}`);

  await expect(page).toHaveURL(redirectTo);
});

test("User session is NOT destroyed when a GET request is sent", async ({
  page,
  login,
}) => {
  await login();

  await page.goto("/logout");

  await page.waitForURL("/");

  await expect(
    page.getByTestId("username").getByText("someuser"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Log out", exact: true }),
  ).toBeVisible();
});

test("User session is destroyed when a POST request is sent", async ({
  page,
  login,
}) => {
  await login();

  await page
    .getByRole("button", { name: "Log out", exact: true })
    .press("Enter");

  await page.waitForURL("/");

  await expect(
    page.getByTestId("username").getByText("someuser"),
  ).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "Log in", exact: true }),
  ).toBeVisible();

  // Log in again to prevent test failure on cleanup
  await login();
});
