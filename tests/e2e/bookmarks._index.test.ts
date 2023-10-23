import { expect, login, logout, test } from "../utils/playwright-test-utils";

test.describe("Unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/bookmarks");
  });

  test("User can view the page title", async ({ page }) => {
    await expect(page).toHaveTitle(/^Bookmarks \|/);
  });

  test("User can view bookmarks", async ({ page }) => {
    await expect(
      page.getByRole("row", {
        name: "TypeScript https://www.typescriptlang.org Unfavorite",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Zod https://zod.dev Favorite",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Conform https://conform.guide Unfavorite",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Prisma https://www.prisma.io Favorite",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Remix https://remix.run Unfavorite",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Tailwind CSS https://tailwindcss.com Favorite",
      }),
    ).toBeVisible();
  });

  test("User can search bookmarks by keyword", async ({ page }) => {
    await page.getByPlaceholder("Search for…").fill("mix");
    await page.getByPlaceholder("Search for…").press("Enter");

    await expect(page).toHaveURL("/bookmarks?searchKey=url&searchValue=mix");
    await expect(page.getByRole("group").getByText("URL")).toBeChecked();
    await expect(page.getByPlaceholder("Search for…")).toHaveValue("mix");
    await expect(
      page.getByRole("row", {
        name: "TypeScript https://www.typescriptlang.org Unfavorite",
      }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Zod https://zod.dev Favorite",
      }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Conform https://conform.guide Unfavorite",
      }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Prisma https://www.prisma.io Favorite",
      }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Remix https://remix.run Unfavorite",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Tailwind CSS https://tailwindcss.com Favorite",
      }),
    ).not.toBeVisible();
  });

  test("User can search bookmarks by keyword and column name", async ({
    page,
  }) => {
    await page.getByRole("group").getByText("Content").click();
    await page.getByPlaceholder("Search for…").fill("mix");
    await page.getByRole("button", { name: "Submit" }).press("Enter");

    await expect(page).toHaveURL(
      "/bookmarks?searchKey=content&searchValue=mix",
    );
    await expect(page.getByRole("group").getByText("Content")).toBeChecked();
    await expect(page.getByPlaceholder("Search for…")).toHaveValue("mix");
    await expect(
      page.getByRole("row", {
        name: "TypeScript https://www.typescriptlang.org Unfavorite",
      }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Zod https://zod.dev Favorite",
      }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Conform https://conform.guide Unfavorite",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Prisma https://www.prisma.io Favorite",
      }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Remix https://remix.run Unfavorite",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("row", {
        name: "Tailwind CSS https://tailwindcss.com Favorite",
      }),
    ).not.toBeVisible();
  });

  test("User can reset search form", async ({ page }) => {
    await page.goto("/bookmarks?searchKey=tags&searchValue=badvalue");

    await expect(page.getByRole("group").getByText("Tags")).toBeChecked();
    await expect(page.getByPlaceholder("Search for…")).toHaveValue("badvalue");

    await page.getByRole("link", { name: "Reset" }).click();

    await expect(page).toHaveURL("/bookmarks");
    await expect(page.getByRole("group").getByText("URL")).toBeChecked();
    await expect(page.getByPlaceholder("Search for…")).toHaveValue("");
  });

  test("User can go to a bookmark's detail page", async ({ page }) => {
    await page.getByRole("link", { name: "Remix", exact: true }).click();

    await expect(page).toHaveTitle(/^Remix \|/);
    await expect(page).toHaveURL(/\/bookmarks\/[a-zA-Z0-9]+$/);
  });

  test("User can NOT view bookmarks if bookmarks data is missing", async ({
    page,
  }) => {
    await page.getByRole("group").getByText("Tags").click();
    await page.getByPlaceholder("Search for…").fill("badvalue");
    await page.getByRole("button", { name: "Submit" }).press("Enter");

    await expect(page).toHaveURL(
      "/bookmarks?searchKey=tags&searchValue=badvalue",
    );
    await expect(
      page.getByRole("heading", { name: "No Bookmarks Found" }),
    ).toBeVisible();
  });

  test("User can NOT search bookmarks if keyword is invalid", async ({
    page,
  }) => {
    await page.getByPlaceholder("Search for…").fill("x");
    await page.getByPlaceholder("Search for…").press("Enter");

    await expect(page.getByText("Search term is too short")).toBeVisible();

    await page.getByPlaceholder("Search for…").fill("x".repeat(46));
    await page.getByPlaceholder("Search for…").press("Enter");

    await expect(page.getByText("Search term is too long")).toBeVisible();
  });

  test("User can NOT add a bookmark", async ({ page }) => {
    await page.getByRole("link", { name: "Add bookmark", exact: true }).click();

    await expect(page).toHaveURL("/login?redirectTo=/bookmarks/new");
  });

  test("User can NOT (un)favorite a bookmark", async ({ page }) => {
    await page
      .getByRole("link", { name: "Unfavorite", exact: true })
      .first()
      .click();

    await expect(page).toHaveURL("/login?redirectTo=/bookmarks");
  });
});

test.describe("Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    const { redirectTo } = await login({ page, to: "/bookmarks" });
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
      page.getByRole("button", { name: "Unfavorite", exact: true }).first(),
    ).toBeVisible();
  });
});
