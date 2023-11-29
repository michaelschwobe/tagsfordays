import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can view the page title", async ({ page }) => {
  await page.goto("/bookmarks");

  await expect(page).toHaveTitle(/^Bookmarks \|/);
});

test("User can view bookmarks", async ({ page }) => {
  await page.goto("/bookmarks");

  await expect(
    page.getByRole("link", { name: "https://www.typescriptlang.org" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://zod.dev" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://conform.guide" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://www.prisma.io" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://remix.run" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://tailwindcss.com" }),
  ).toBeVisible();
});

test("User can search bookmarks by keyword", async ({ page }) => {
  await page.goto("/bookmarks");

  await page.getByPlaceholder("Search for…").fill("mix");
  await page.getByPlaceholder("Search for…").press("Enter");

  await expect(page).toHaveURL("/bookmarks?searchValue=mix&searchKey=url");
  await expect(
    page.getByTestId("search-form").getByRole("button", { name: "URL" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByPlaceholder("Search for…")).toHaveValue("mix");
  await expect(
    page.getByRole("link", { name: "https://www.typescriptlang.org" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://zod.dev" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://conform.guide" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://www.prisma.io" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://remix.run" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://tailwindcss.com" }),
  ).not.toBeVisible();
});

test("User can search bookmarks by keyword AND column name", async ({
  page,
}) => {
  await page.goto("/bookmarks");

  await page.getByPlaceholder("Search for…").fill("mix");
  await page.getByRole("button", { name: "Content" }).press("Enter");

  await expect(page).toHaveURL("/bookmarks?searchValue=mix&searchKey=content");
  await expect(page.getByPlaceholder("Search for…")).toHaveValue("mix");
  await expect(
    page.getByTestId("search-form").getByRole("button", { name: "Content" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("link", { name: "https://www.typescriptlang.org" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://zod.dev" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://conform.guide" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://www.prisma.io" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://remix.run" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://tailwindcss.com" }),
  ).not.toBeVisible();
});

test("User can reset search form", async ({ page }) => {
  await page.goto("/bookmarks?searchValue=badvalue&searchKey=tags");

  await expect(page.getByPlaceholder("Search for…")).toHaveValue("badvalue");
  await expect(
    page.getByTestId("search-form").getByRole("button", { name: "Tags" }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("link", { name: "Reset" }).click();

  await expect(page).toHaveURL("/bookmarks");
  await expect(page.getByPlaceholder("Search for…")).toHaveValue("");
  await expect(
    page.getByTestId("search-form").getByRole("button", { name: "Tags" }),
  ).toHaveAttribute("aria-pressed", "false");
});

test("User can go to a bookmark's detail page", async ({ page }) => {
  await page.goto("/bookmarks");

  await page.getByRole("link", { name: "Remix", exact: true }).click();

  await expect(page).toHaveTitle(/^Remix \|/);
  await expect(page).toHaveURL(/\/bookmarks\/[a-zA-Z0-9]+$/);
});

test("User can NOT view bookmarks if data is INVALID/MISSING", async ({
  page,
}) => {
  await page.goto("/bookmarks");

  await page.getByPlaceholder("Search for…").fill("badvalue");
  await page
    .getByRole("main")
    .locator("form")
    .getByRole("button", { name: "Tags" })
    .press("Enter");

  await expect(page).toHaveURL(
    "/bookmarks?searchValue=badvalue&searchKey=tags",
  );
  await expect(
    page.getByRole("heading", { name: "No Bookmarks Found" }),
  ).toBeVisible();
});

test("User can NOT search bookmarks if keyword is INVALID", async ({
  page,
}) => {
  await page.goto("/bookmarks");

  await page.getByPlaceholder("Search for…").fill("x");
  await page.getByPlaceholder("Search for…").press("Enter");

  await expect(page.getByText("Search term is too short")).toBeVisible();

  await page.getByPlaceholder("Search for…").fill("x".repeat(46));
  await page.getByPlaceholder("Search for…").press("Enter");

  await expect(page.getByText("Search term is too long")).toBeVisible();
});

test("User can NOT check bookmarks status", async ({ page }) => {
  await page.goto("/bookmarks");

  await page
    .getByRole("link", { name: "Bookmarks status", exact: true })
    .click();

  await expect(page).toHaveURL("/login?redirectTo=/bookmarks/status");
});

test("User can NOT import bookmarks", async ({ page }) => {
  await page.goto("/bookmarks");

  await page
    .getByRole("link", { name: "Import bookmarks", exact: true })
    .click();

  await expect(page).toHaveURL("/login?redirectTo=/bookmarks/import");
});

test("User can NOT add a bookmark", async ({ page }) => {
  await page.goto("/bookmarks");

  await page.getByRole("link", { name: "Add bookmark", exact: true }).click();

  await expect(page).toHaveURL("/login?redirectTo=/bookmarks/new");
});

test("User can NOT (un)favorite a bookmark", async ({ page }) => {
  await page.goto("/bookmarks");

  await page
    .getByRole("row", { name: "Conform" })
    .getByRole("button", { name: "Unfavorite bookmark", exact: true })
    .click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks/bid0/edit" }),
  );
});

test("User can NOT export bookmarks as CSV", async ({ page }) => {
  await page.goto("/bookmarks");

  await page
    .getByRole("button", { name: "Export data to a CSV file", exact: true })
    .click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks.csv" }),
  );
});

test("User can NOT export bookmarks as HTML", async ({ page }) => {
  await page.goto("/bookmarks");

  await page
    .getByRole("button", { name: "Export data to a HTML file", exact: true })
    .click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks.html" }),
  );
});

test("User can NOT export bookmarks as JSON", async ({ page }) => {
  await page.goto("/bookmarks");

  await page
    .getByRole("button", { name: "Export data to a JSON file", exact: true })
    .click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks.json" }),
  );
});

test("User can NOT export bookmarks as Markdown", async ({ page }) => {
  await page.goto("/bookmarks");

  await page
    .getByRole("button", {
      name: "Export data to a Markdown file",
      exact: true,
    })
    .click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks.md" }),
  );
});

test("User can NOT export bookmarks as Text", async ({ page }) => {
  await page.goto("/bookmarks");

  await page
    .getByRole("button", { name: "Export data to a Text file", exact: true })
    .click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks.txt" }),
  );
});

test("[AUTH] User can check bookmarks status", async ({ page, login }) => {
  await login("/bookmarks");

  await page
    .getByRole("link", { name: "Bookmarks status", exact: true })
    .click();

  await page.waitForURL("/bookmarks/status");
});

test("[AUTH] User can import bookmarks", async ({ page, login }) => {
  await login("/bookmarks");

  await page
    .getByRole("link", { name: "Import bookmarks", exact: true })
    .click();

  await page.waitForURL("/bookmarks/import");
});

test("[AUTH] User can add a bookmark", async ({ page, login }) => {
  await login("/bookmarks");

  await page.getByRole("link", { name: "Add bookmark", exact: true }).click();

  await page.waitForURL("/bookmarks/new");
});

test("[AUTH] User can (un)favorite a bookmark", async ({ page, login }) => {
  await login("/bookmarks");

  await expect(
    page
      .getByRole("row", { name: "Conform" })
      .getByRole("button", { name: "Unfavorite bookmark", exact: true }),
  ).toBeVisible();
});

test("[AUTH] User can export bookmarks as CSV", async ({ page, login }) => {
  const downloadPromise = page.waitForEvent("download");
  await login("/bookmarks");

  await page
    .getByRole("button", { name: "Export data to a CSV file", exact: true })
    .click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(
    /bookmarks_(\d+)_(\d+)_(\d+).csv/,
  );
});

test("[AUTH] User can export bookmarks as HTML", async ({ page, login }) => {
  const downloadPromise = page.waitForEvent("download");
  await login("/bookmarks");

  await page
    .getByRole("button", { name: "Export data to a HTML file", exact: true })
    .click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(
    /bookmarks_(\d+)_(\d+)_(\d+).html/,
  );
});

test("[AUTH] User can export bookmarks as JSON", async ({ page, login }) => {
  const downloadPromise = page.waitForEvent("download");
  await login("/bookmarks");

  await page
    .getByRole("button", { name: "Export data to a JSON file", exact: true })
    .click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(
    /bookmarks_(\d+)_(\d+)_(\d+).json/,
  );
});

test("[AUTH] User can export bookmarks as Markdown", async ({
  page,
  login,
}) => {
  const downloadPromise = page.waitForEvent("download");
  await login("/bookmarks");

  await page
    .getByRole("button", {
      name: "Export data to a Markdown file",
      exact: true,
    })
    .click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(
    /bookmarks_(\d+)_(\d+)_(\d+).md/,
  );
});

test("[AUTH] User can export bookmarks as Text", async ({ page, login }) => {
  const downloadPromise = page.waitForEvent("download");
  await login("/bookmarks");

  await page
    .getByRole("button", { name: "Export data to a Text file", exact: true })
    .click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(
    /bookmarks_(\d+)_(\d+)_(\d+).txt/,
  );
});
