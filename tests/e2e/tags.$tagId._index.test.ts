import { expect, login, logout, test } from "../utils/playwright-test-utils";

test.describe("Unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tags/tid0");
  });

  test("User can view the page title", async ({ page }) => {
    await expect(page).toHaveTitle(/^tag1 \|/);
  });

  test("User can search bookmarks by tag", async ({ page }) => {
    await page.getByText("Bookmarks(6)").click();

    await expect(page).toHaveURL("/bookmarks?searchValue=tag1&searchKey=tags");
  });

  test("User can NOT add a tag", async ({ page }) => {
    await page.getByRole("link", { name: "Add tag", exact: true }).click();

    await expect(page).toHaveURL("/login?redirectTo=/tags/new");
  });

  test("User can NOT edit a tag", async ({ page }) => {
    await page.getByRole("link", { name: "Edit tag", exact: true }).click();

    await expect(page).toHaveURL("/login?redirectTo=/tags/tid0/edit");
  });

  test("User can NOT split a tag", async ({ page }) => {
    await page.getByRole("link", { name: "Split tag", exact: true }).click();

    await expect(page).toHaveURL("/login?redirectTo=/tags/tid0/split");
  });

  test("User can NOT merge a tag", async ({ page }) => {
    await page.getByRole("link", { name: "Merge tag", exact: true }).click();

    await expect(page).toHaveURL("/login?redirectTo=/tags/tid0/merge");
  });

  test("User can NOT delete a tag", async ({ page }) => {
    await page.getByRole("link", { name: "Delete tag", exact: true }).click();

    await expect(page).toHaveURL("/login?redirectTo=/tags/tid0");
  });
});

test.describe("Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    const { redirectTo } = await login({
      page,
      to: "/tags/tid0",
    });
    await page.waitForURL(redirectTo);
  });

  test.afterEach(async ({ page }) => {
    await logout({ page });
  });

  test("User can add a tag", async ({ page }) => {
    await page.getByRole("link", { name: "Add tag", exact: true }).click();

    await page.waitForURL("/tags/new");
  });

  test("User can edit a tag", async ({ page }) => {
    await page.getByRole("link", { name: "Edit tag", exact: true }).click();

    await expect(page).toHaveURL("/tags/tid0/edit");
  });

  test("User can split a tag", async ({ page }) => {
    await page.getByRole("link", { name: "Split tag", exact: true }).click();

    await expect(page).toHaveURL("/tags/tid0/split");
  });

  test("User can merge a tag", async ({ page }) => {
    await page.getByRole("link", { name: "Merge tag", exact: true }).click();

    await expect(page).toHaveURL("/tags/tid0/merge");
  });

  test("User can delete a tag", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Delete tag", exact: true }),
    ).toBeVisible();
  });
});
