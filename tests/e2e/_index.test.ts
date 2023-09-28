import { expect, login, logout, test } from "../utils/playwright-test-utils";

test.describe("Intro", () => {
  test("Has name, version number, and description", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(
      "TagsForDays - Enhance and organize your bookmarks",
    );
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
});

test.describe("Quick Bookmark", () => {
  test("User can use login button if not logged in", async ({ page }) => {
    await page.goto("/");

    await expect(
      page
        .getByTestId("quick-bookmark")
        .getByRole("link", { name: "Log in to use this feature" }),
    ).toBeVisible();
  });

  test("User can use form if logged in", async ({ page }) => {
    const { redirectTo } = await login({ page });

    await page.waitForURL(redirectTo);
    await page.getByLabel("URL").fill("x");
    await page.getByLabel("URL").press("Enter");
    await page.waitForURL("/bookmarks/new");

    await logout({ page });
  });
});

test.describe("Quick Tag", () => {
  test("User can use login button if not logged in", async ({ page }) => {
    await page.goto("/");

    await expect(
      page
        .getByTestId("quick-tag")
        .getByRole("link", { name: "Log in to use this feature" }),
    ).toBeVisible();
  });

  test("User can use form if logged in", async ({ page }) => {
    const { redirectTo } = await login({ page });

    await page.waitForURL(redirectTo);
    await page.getByLabel("Name").fill("x");
    await page.getByLabel("Name").press("Enter");
    await page.waitForURL("/tags/new");

    await logout({ page });
  });
});

test.describe("Latest Bookmarks", () => {
  // test("User can see an empty message and use 'add' button if data missing", async ({
  //   page,
  // }) => {
  //   await page.goto("/");
  //   await expect(
  //     page.getByTestId("latest-bookmarks").getByText("None found."),
  //   ).toBeVisible();
  //   await page.getByRole("link", { name: "Add bookmark" }).press("Enter");
  //   await expect(
  //     page.getByRole("heading", { name: "Add Bookmark" }),
  //   ).toBeVisible();
  // });

  test("User can see an items and use 'view all' button if data found", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "View all bookmarks" }).press("Enter");
    await expect(
      page.getByRole("heading", { name: "Bookmarks" }),
    ).toBeVisible();
  });
});

test.describe("Latest Tags", () => {
  // test("User can see an empty message and use 'add' button if data missing", async ({
  //   page,
  // }) => {
  //   await page.goto("/");
  //   await expect(
  //     page.getByTestId("latest-tags").getByText("None found."),
  //   ).toBeVisible();
  //   await page.getByRole("link", { name: "Add tag" }).press("Enter");
  //   await expect(page.getByRole("heading", { name: "Add Tag" })).toBeVisible();
  // });

  test("User can see an items and use 'view all' button if data found", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "View all tags" }).press("Enter");
    await expect(
      page.getByRole("heading", { name: "Tags", exact: true }),
    ).toBeVisible();
  });
});
