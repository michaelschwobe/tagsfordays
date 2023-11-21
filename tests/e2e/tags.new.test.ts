import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test.describe("Unauthenticated", () => {
  test("User can NOT view the page", async ({ page }) => {
    await page.goto("/tags/new");

    await expect(page).toHaveURL(
      encodeUrl({ page, url: "/login?redirectTo=/tags/new" }),
    );
  });
});

test.describe("Authenticated", () => {
  test("User can cancel viewing the form/page", async ({ page, login }) => {
    // Login from a different page so we have a history to redirect back to.
    await login();
    await page.goto("/tags/new");

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page).toHaveURL("/");
  });

  test("User can view the page title", async ({ page, login }) => {
    await login("/tags/new");

    await expect(page).toHaveTitle(/^New Tag \|/);
  });

  test("User can NOT add tag(s) without valid Name(s)", async ({
    page,
    login,
  }) => {
    await login("/tags/new");

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
