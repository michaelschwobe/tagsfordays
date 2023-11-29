import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can view the page title", async ({ page }) => {
  await page.goto("/bookmarks/bid2");

  await expect(page).toHaveTitle(/^Remix \|/);
});

test("User can go to a bookmark's tag detail page", async ({ page }) => {
  await page.goto("/bookmarks/bid2");

  await page.getByRole("link", { name: "tag1", exact: true }).click();

  await expect(page).toHaveURL("/tags/tid0");
});

test("User can NOT add a bookmark", async ({ page }) => {
  await page.goto("/bookmarks/bid2");

  await page.getByRole("link", { name: "Add bookmark", exact: true }).click();

  await expect(page).toHaveURL("/login?redirectTo=/bookmarks/new");
});

test("User can NOT (un)favorite a bookmark", async ({ page }) => {
  await page.goto("/bookmarks/bid2");

  await page.getByRole("button", { name: "Unfavorite", exact: true }).click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks/bid2/edit" }),
  );
});

test("User can NOT edit a bookmark", async ({ page }) => {
  await page.goto("/bookmarks/bid2");

  await page.getByRole("link", { name: "Edit bookmark", exact: true }).click();

  await expect(page).toHaveURL("/login?redirectTo=/bookmarks/bid2/edit");
});

test("User can NOT delete a bookmark", async ({ page }) => {
  await page.goto("/bookmarks/bid2");

  await page
    .getByRole("button", { name: "Delete bookmark", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm delete bookmark", exact: true })
    .click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks/bid2/edit" }),
  );
});

test("[AUTH] User can add a bookmark", async ({ page, login }) => {
  await login("/bookmarks/bid2");

  await page.getByRole("link", { name: "Add bookmark", exact: true }).click();

  await page.waitForURL("/bookmarks/new");
});

test("[AUTH] User can (un)favorite a bookmark", async ({ page, login }) => {
  await login("/bookmarks/bid2");

  await expect(
    page.getByRole("button", { name: "Unfavorite", exact: true }),
  ).toBeVisible();
});

test("[AUTH] User can edit a bookmark", async ({ page, login }) => {
  await login("/bookmarks/bid2");

  await page.getByRole("link", { name: "Edit bookmark", exact: true }).click();

  await page.waitForURL("/bookmarks/bid2/edit");
});

test("[AUTH] User can delete a bookmark", async ({ page, login }) => {
  await login("/bookmarks/bid2");

  await expect(
    page.getByRole("button", { name: "Delete bookmark", exact: true }),
  ).toBeVisible();
});
