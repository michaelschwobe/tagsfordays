import {
  encodeUrl,
  expect,
  login,
  logout,
  test,
} from "../utils/playwright-test-utils";

test.describe("Unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://icons.duckduckgo.com/ip3/**", async (route) => {
      route.abort();
    });
    await page.goto("/bookmarks/bid2");
  });

  test("User can view the page title", async ({ page }) => {
    await expect(page).toHaveTitle(/^Remix \|/);
  });

  test("User can go to a bookmark's tag detail page", async ({ page }) => {
    await page.getByRole("link", { name: "tag1", exact: true }).click();

    await expect(page).toHaveURL("/tags/tid0");
  });

  test("User can NOT add a bookmark", async ({ page }) => {
    await page.getByRole("link", { name: "Add bookmark", exact: true }).click();

    await expect(page).toHaveURL("/login?redirectTo=/bookmarks/new");
  });

  test("User can NOT (un)favorite a bookmark", async ({ page }) => {
    await page.getByRole("button", { name: "Unfavorite", exact: true }).click();

    await expect(page).toHaveURL(
      encodeUrl({ page, url: "/login?redirectTo=/bookmarks/bid2/edit" }),
    );
  });

  test("User can NOT edit a bookmark", async ({ page }) => {
    await page
      .getByRole("link", { name: "Edit bookmark", exact: true })
      .click();

    await expect(page).toHaveURL("/login?redirectTo=/bookmarks/bid2/edit");
  });

  test("User can NOT delete a bookmark", async ({ page }) => {
    await page
      .getByRole("button", { name: "Delete bookmark", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Confirm delete bookmark", exact: true })
      .click();

    // await expect(page).toHaveURL("/login?redirectTo=/bookmarks/bid2/edit");

    await expect(page).toHaveURL(
      encodeUrl({ page, url: "/login?redirectTo=/bookmarks/bid2/edit" }),
    );
  });
});

test.describe("Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://icons.duckduckgo.com/ip3/**", async (route) => {
      route.abort();
    });
    const { redirectTo } = await login({
      page,
      to: "/bookmarks/bid2",
    });
    await page.waitForURL(redirectTo);
  });

  test.afterEach(async ({ page }) => {
    await logout({ page });
  });

  test("User can add a bookmark", async ({ page }) => {
    await page.getByRole("link", { name: "Add bookmark", exact: true }).click();

    await page.waitForURL("/bookmarks/new");
  });

  test("User can (un)favorite a bookmark", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Unfavorite", exact: true }),
    ).toBeVisible();
  });

  test("User can edit a bookmark", async ({ page }) => {
    await page
      .getByRole("link", { name: "Edit bookmark", exact: true })
      .click();

    await page.waitForURL("/bookmarks/bid2/edit");
  });

  test("User can delete a bookmark", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Delete bookmark", exact: true }),
    ).toBeVisible();
  });
});
