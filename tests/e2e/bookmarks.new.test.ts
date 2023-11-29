import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/bookmarks/new");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks/new" }),
  );
});

test("[AUTH] User can cancel viewing the form/page", async ({
  page,
  login,
}) => {
  // Login from a different page so we have a history to redirect back to.
  await login();
  await page.goto("/bookmarks/new");

  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page).toHaveURL("/");
});

test("[AUTH] User can view the page title", async ({ page, login }) => {
  await login("/bookmarks/new");

  await expect(page).toHaveTitle(/^New Bookmark \|/);
});

test("[AUTH] User can toggle bookmark tags", async ({ page, login }) => {
  await login("/bookmarks/new");

  await page
    .getByRole("button", { name: "Add tag1", exact: true })
    .press("Enter");
  await page
    .getByRole("button", { name: "Remove tag1", exact: true })
    .press("Enter");
});

test("[AUTH] User can NOT update bookmark if URL is INVALID", async ({
  page,
  login,
}) => {
  await login("/bookmarks/new");

  await page.getByLabel("URL").fill("");
  await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

  await expect(page.getByText("URL is required")).toBeVisible();

  await page.getByLabel("URL").fill("x");
  await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

  await expect(page.getByText("URL is invalid")).toBeVisible();

  await page.getByLabel("URL").fill("http://remix.run");
  await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

  await expect(page.getByText("URL is insecure, use https")).toBeVisible();

  await page.getByLabel("URL").fill("https://x.x");
  await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

  await expect(page.getByText("URL is too short")).toBeVisible();

  const urlOfLength2001 = "https://".concat("x".repeat(1991)).concat(".x");
  await page.getByLabel("URL").fill(urlOfLength2001);
  await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

  await expect(page.getByText("URL is too long")).toBeVisible();

  await page.getByLabel("URL").fill("https://conform.guide");
  await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

  await expect(page.getByText("URL must be unique")).toBeVisible();
});

test("[AUTH] User can NOT update bookmark if Title is INVALID", async ({
  page,
  login,
}) => {
  await login("/bookmarks/new");

  await page.getByLabel("Title").fill("x");
  await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

  await expect(page.getByText("Title is too short")).toBeVisible();

  await page.getByLabel("Title").fill("x".repeat(46));
  await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

  await expect(page.getByText("Title is too long")).toBeVisible();
});

test("[AUTH] User can NOT update bookmark if Content is INVALID", async ({
  page,
  login,
}) => {
  await login("/bookmarks/new");

  await page.getByLabel("Content").fill("x");
  await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

  await expect(page.getByText("Content is too short")).toBeVisible();

  await page.getByLabel("Content").fill("x".repeat(256));
  await page.getByRole("button", { name: "Add bookmark" }).press("Enter");

  await expect(page.getByText("Content is too long")).toBeVisible();
});
