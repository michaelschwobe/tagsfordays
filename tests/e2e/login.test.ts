import { expect, test } from "../utils/playwright-test-utils";

test("User can view the page title", async ({ page }) => {
  await page.goto("/login");

  await expect(page).toHaveTitle(/^Login \|/);
});

test.describe("Invalid", () => {
  test("User can NOT login if using missing data", async ({ page }) => {
    await page.goto("/login");

    await page
      .getByRole("button", { name: "Log in", exact: true })
      .press("Enter");

    await expect(page.getByText("Username is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("User can NOT login if using short data", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Username").fill("x");
    await page.getByLabel("Password").fill("x");
    await page
      .getByRole("button", { name: "Log in", exact: true })
      .press("Enter");

    await expect(page.getByText("Username is too short")).toBeVisible();
    await expect(page.getByText("Password is too short")).toBeVisible();
  });

  test("User can NOT login if using long data", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Username").fill("x".repeat(21));
    await page.getByLabel("Password").fill("x".repeat(46));
    await page
      .getByRole("button", { name: "Log in", exact: true })
      .press("Enter");

    await expect(page.getByText("Username is too long")).toBeVisible();
    await expect(page.getByText("Password is too long")).toBeVisible();
  });

  test("User can NOT login if using disallowed data", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Username").fill("<script></script>");
    await page
      .getByRole("button", { name: "Log in", exact: true })
      .press("Enter");

    await expect(
      page.getByText(
        "Username can only include letters, numbers, and underscores",
      ),
    ).toBeVisible();
  });

  test("User can NOT login if using invalid username", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Username").fill("badvalue");
    await page.getByLabel("Password").fill("somepass");
    await page
      .getByRole("button", { name: "Log in", exact: true })
      .press("Enter");

    await expect(page.getByText("Invalid username or password")).toBeVisible();
  });

  test("User can NOT login if using invalid password", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Username").fill("someuser");
    await page.getByLabel("Password").fill("badvalue");
    await page
      .getByRole("button", { name: "Log in", exact: true })
      .press("Enter");

    await expect(page.getByText("Invalid username or password")).toBeVisible();
  });

  test("User can NOT login if using invalid username and password", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByLabel("Username").fill("badvalue");
    await page.getByLabel("Password").fill("badvalue");
    await page
      .getByRole("button", { name: "Log in", exact: true })
      .press("Enter");

    await expect(page.getByText("Invalid username or password")).toBeVisible();
  });
});

test.describe("Valid", () => {
  test("User can login and is redirected", async ({ page, login }) => {
    await login("/tags");

    await expect(
      page.getByTestId("username").getByText("someuser"),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Log out", exact: true }),
    ).toBeVisible();
  });
});
