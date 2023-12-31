import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can view the page title", async ({ page }) => {
  await page.goto("/tags/tid0");

  await expect(page).toHaveTitle(/^tag1 \|/);
});

test("User can search bookmarks by tag", async ({ page }) => {
  await page.goto("/tags/tid0");

  await page.getByText("Bookmarks6").click();

  await expect(page).toHaveURL("/bookmarks?searchValue=tag1&searchKey=tags");
});

test("User can NOT add a tag", async ({ page }) => {
  await page.goto("/tags/tid0");

  await page.getByRole("link", { name: "Add tag", exact: true }).click();

  await expect(page).toHaveURL("/login?redirectTo=/tags/new");
});

test("User can NOT edit a tag", async ({ page }) => {
  await page.goto("/tags/tid0");

  await page.getByRole("link", { name: "Edit tag", exact: true }).click();

  await expect(page).toHaveURL("/login?redirectTo=/tags/tid0/edit");
});

test("User can NOT split a tag", async ({ page }) => {
  await page.goto("/tags/tid0");

  await page.getByRole("link", { name: "Split tag", exact: true }).click();

  await expect(page).toHaveURL("/login?redirectTo=/tags/tid0/split");
});

test("User can NOT merge a tag", async ({ page }) => {
  await page.goto("/tags/tid0");

  await page.getByRole("link", { name: "Merge tag", exact: true }).click();

  await expect(page).toHaveURL("/login?redirectTo=/tags/tid0/merge");
});

test("User can NOT delete a tag", async ({ page }) => {
  await page.goto("/tags/tid0");

  await page.getByRole("button", { name: "Delete tag", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm delete tag", exact: true })
    .click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/tags/tid0/edit" }),
  );
});

test("[AUTH] User can add a tag", async ({ page, login }) => {
  await login("/tags/tid0");

  await page.getByRole("link", { name: "Add tag", exact: true }).click();

  await page.waitForURL("/tags/new");
});

test("[AUTH] User can edit a tag", async ({ page, login }) => {
  await login("/tags/tid0");

  await page.getByRole("link", { name: "Edit tag", exact: true }).click();

  await expect(page).toHaveURL("/tags/tid0/edit");
});

test("[AUTH] User can split a tag", async ({ page, login }) => {
  await login("/tags/tid0");

  await page.getByRole("link", { name: "Split tag", exact: true }).click();

  await expect(page).toHaveURL("/tags/tid0/split");
});

test("[AUTH] User can merge a tag", async ({ page, login }) => {
  await login("/tags/tid0");

  await page.getByRole("link", { name: "Merge tag", exact: true }).click();

  await expect(page).toHaveURL("/tags/tid0/merge");
});

test("[AUTH] User can delete a tag", async ({ page, login }) => {
  await login("/tags/tid0");

  await expect(
    page.getByRole("button", { name: "Delete tag", exact: true }),
  ).toBeVisible();
});
