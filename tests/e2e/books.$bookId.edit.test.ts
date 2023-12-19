import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/books/bkid2/edit");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/books/bkid2/edit" }),
  );
});

test("[AUTH] User can cancel viewing the form/page", async ({
  page,
  login,
}) => {
  // Login from a different page so we have a history to redirect back to.
  await login();
  await page.goto("/books/bkid2/edit");

  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page).toHaveURL("/");
});

test("[AUTH] User can view the page title", async ({ page, login }) => {
  await login("/books/bkid2/edit");

  await expect(page).toHaveTitle(/^Editing Book… \|/);
});

test("[AUTH] User can toggle book bookmarks", async ({ page, login }) => {
  await login("/books/bkid2/edit");

  await page
    .getByRole("button", { name: "Remove https://remix.run", exact: true })
    .press("Enter");
  await page
    .getByRole("button", { name: "Add https://remix.run", exact: true })
    .press("Enter");
});

test("[AUTH] User can toggle book tags", async ({ page, login }) => {
  await login("/books/bkid2/edit");

  await page
    .getByRole("button", { name: "Remove tag1", exact: true })
    .press("Enter");
  await page
    .getByRole("button", { name: "Add tag1", exact: true })
    .press("Enter");
});

test("[AUTH] User can NOT update book if Title is INVALID/MISSING", async ({
  page,
  login,
}) => {
  await login("/books/bkid2/edit");

  await page.getByLabel("Title").fill("");
  await page.getByRole("button", { name: "Update book" }).press("Enter");

  await expect(page.getByText("Title is required")).toBeVisible();

  await page.getByLabel("Title").fill("x");
  await page.getByRole("button", { name: "Update book" }).press("Enter");

  await expect(page.getByText("Title is too short")).toBeVisible();

  await page.getByLabel("Title").fill("x".repeat(46));
  await page.getByRole("button", { name: "Update book" }).press("Enter");

  await expect(page.getByText("Title is too long")).toBeVisible();

  await page.getByLabel("Title").fill("Book 1");
  await page.getByRole("button", { name: "Update book" }).press("Enter");

  await expect(page.getByText("Title must be unique")).toBeVisible();
});

test("[AUTH] User can NOT update book if Content is INVALID", async ({
  page,
  login,
}) => {
  await login("/books/bkid2/edit");

  await page.getByLabel("Content").fill("x");
  await page.getByRole("button", { name: "Update book" }).press("Enter");

  await expect(page.getByText("Content is too short")).toBeVisible();

  await page.getByLabel("Content").fill("x".repeat(256));
  await page.getByRole("button", { name: "Update book" }).press("Enter");

  await expect(page.getByText("Content is too long")).toBeVisible();
});
