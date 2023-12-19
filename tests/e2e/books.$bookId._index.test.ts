import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can view the page title", async ({ page }) => {
  await page.goto("/books/bkid2");

  await expect(page).toHaveTitle(/^Book 2 \|/);
});

test("User can go to a book's bookmarks detail page", async ({ page }) => {
  await page.goto("/books/bkid2");

  await page
    .getByRole("link", { name: "https://remix.run", exact: true })
    .click();

  await expect(page).toHaveURL("/bookmarks/bid2");
});

test("User can go to a book's tag detail page", async ({ page }) => {
  await page.goto("/books/bkid2");

  await page.getByRole("link", { name: "tag1", exact: true }).click();

  await expect(page).toHaveURL("/tags/tid0");
});

test("User can NOT add a book", async ({ page }) => {
  await page.goto("/books/bkid2");

  await page.getByRole("link", { name: "Add book", exact: true }).click();

  await expect(page).toHaveURL("/login?redirectTo=/books/new");
});

test("User can NOT (un)favorite a book", async ({ page }) => {
  await page.goto("/books/bkid1");

  await page.getByRole("button", { name: "Unfavorite", exact: true }).click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/books/bkid1/edit" }),
  );
});

test("User can NOT edit a book", async ({ page }) => {
  await page.goto("/books/bkid2");

  await page.getByRole("link", { name: "Edit book", exact: true }).click();

  await expect(page).toHaveURL("/login?redirectTo=/books/bkid2/edit");
});

test("User can NOT delete a book", async ({ page }) => {
  await page.goto("/books/bkid2");

  await page.getByRole("button", { name: "Delete book", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm delete book", exact: true })
    .click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/books/bkid2/edit" }),
  );
});

test("[AUTH] User can add a book", async ({ page, login }) => {
  await login("/books/bkid2");

  await page.getByRole("link", { name: "Add book", exact: true }).click();

  await page.waitForURL("/books/new");
});

test("[AUTH] User can (un)favorite a book", async ({ page, login }) => {
  await login("/books/bkid1");

  await expect(
    page.getByRole("button", { name: "Unfavorite", exact: true }),
  ).toBeVisible();
});

test("[AUTH] User can edit a book", async ({ page, login }) => {
  await login("/books/bkid2");

  await page.getByRole("link", { name: "Edit book", exact: true }).click();

  await page.waitForURL("/books/bkid2/edit");
});

test("[AUTH] User can delete a book", async ({ page, login }) => {
  await login("/books/bkid2");

  await expect(
    page.getByRole("button", { name: "Delete book", exact: true }),
  ).toBeVisible();
});
