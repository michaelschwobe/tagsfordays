import { expect, test } from "../utils/playwright-test-utils";

test("User can view the page title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(
    "TagsForDays - Enhance and organize your bookmarks",
  );
});

test("User can view the name, version number, and description", async ({
  page,
}) => {
  await page.goto("/");

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
  await page.goto("/");

  await page.getByRole("link", { name: "View all bookmarks" }).click();

  await expect(page).toHaveURL("/bookmarks");
});

test("User can view the 'Latest Tags' content", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "View all tags" }).press("Enter");

  await expect(page).toHaveURL("/tags");
});

test.skip("User can NOT view the 'Latest Bookmarks' content if data is MISSING", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByTestId("card-latest-bookmarks").getByText("None found."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Add bookmark" })).toBeVisible();
});

test.skip("User can NOT view the 'Latest Tags' content if data is MISSING", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByTestId("card-latest-tags").getByText("None found."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Add tag" })).toBeVisible();
});

test("User can NOT add a bookmark", async ({ page }) => {
  await page.goto("/");

  await expect(
    page
      .getByTestId("card-quick-bookmark")
      .getByRole("link", { name: "Log in to use this feature" }),
  ).toBeVisible();
});

test("User can NOT add a tag", async ({ page }) => {
  await page.goto("/");

  await expect(
    page
      .getByTestId("card-quick-tag")
      .getByRole("link", { name: "Log in to use this feature" }),
  ).toBeVisible();
});

test("[AUTH] User can add a bookmark", async ({ page, login }) => {
  await login();

  await page.getByLabel("URL").fill("x");
  await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

  await expect(page).toHaveURL("/bookmarks/new");
});

test("[AUTH] User can add a tag", async ({ page, login }) => {
  await login();

  await page.getByLabel("Name").fill("x");
  await page.getByRole("button", { name: "Add tag" }).press("Enter");

  await expect(page).toHaveURL("/tags/new");
});
