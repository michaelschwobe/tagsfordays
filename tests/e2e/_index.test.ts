import { expect, login, logout, test } from "../utils/playwright-test-utils";

test.describe("Unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://icons.duckduckgo.com/ip3/**", async (route) => {
      route.abort();
    });
    await page.goto("/");
  });

  test("User can view the page title", async ({ page }) => {
    await expect(page).toHaveTitle(
      "TagsForDays - Enhance and organize your bookmarks",
    );
  });

  test("User can view the name, version number, and description", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "TagsForDays" }),
    ).toBeVisible();
    const version = await page.getByTestId("app-version").innerText();
    expect(version).toEqual(expect.stringMatching(/^v(\d+)\.(\d+)\.(\d+)$/));
    await expect(
      page.getByText(
        "TagsForDays extends traditional bookmarking with advanced organization and search capabilities.",
      ),
    ).toBeVisible();
  });

  test("User can view the 'Latest Bookmarks' content", async ({ page }) => {
    await page.getByRole("link", { name: "View all bookmarks" }).click();

    await expect(page).toHaveURL("/bookmarks");
  });

  test("User can view the 'Latest Tags' content", async ({ page }) => {
    await page.getByRole("link", { name: "View all tags" }).press("Enter");

    await expect(page).toHaveURL("/tags");
  });

  test.skip("User can NOT view the 'Latest Bookmarks' content if data is missing", async ({
    page,
  }) => {
    await expect(
      page.getByTestId("latest-bookmarks").getByText("None found."),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Add bookmark" }),
    ).toBeVisible();
  });

  test.skip("User can NOT view the 'Latest Tags' content if data is missing", async ({
    page,
  }) => {
    await expect(
      page.getByTestId("latest-tags").getByText("None found."),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Add tag" })).toBeVisible();
  });

  test("User can NOT add a bookmark", async ({ page }) => {
    await expect(
      page
        .getByTestId("quick-bookmark")
        .getByRole("link", { name: "Log in to use this feature" }),
    ).toBeVisible();
  });

  test("User can NOT add a tag", async ({ page }) => {
    await expect(
      page
        .getByTestId("quick-tag")
        .getByRole("link", { name: "Log in to use this feature" }),
    ).toBeVisible();
  });
});

test.describe("Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://icons.duckduckgo.com/ip3/**", async (route) => {
      route.abort();
    });
    const { redirectTo } = await login({ page });
    await page.waitForURL(redirectTo);
  });

  test.afterEach(async ({ page }) => {
    await logout({ page });
  });

  test("User can add a bookmark", async ({ page }) => {
    await page.getByLabel("URL").fill("x");
    await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

    await expect(page).toHaveURL("/bookmarks/new");
  });

  test("User can add a tag", async ({ page }) => {
    await page.getByLabel("Name").fill("x");
    await page.getByRole("button", { name: "Add tag" }).press("Enter");

    await expect(page).toHaveURL("/tags/new");
  });
});
