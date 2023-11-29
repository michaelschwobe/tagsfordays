import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/tags/tid0/edit");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/tags/tid0/edit" }),
  );
});

test("[AUTH] User can cancel viewing the form/page", async ({
  page,
  login,
}) => {
  // Login from a different page so we have a history to redirect back to.
  await login();
  await page.goto("/tags/tid0/edit");

  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page).toHaveURL("/");
});

test("[AUTH] User can view the page title", async ({ page, login }) => {
  await login("/tags/tid0/edit");

  await expect(page).toHaveTitle(/^Editing Tag… \|/);
});

test("[AUTH] User can NOT update tag if Name is INVALID/MISSING", async ({
  page,
  login,
}) => {
  await login("/tags/tid0/edit");

  await page.getByLabel("Name").fill("");
  await page.getByRole("button", { name: "Update tag" }).press("Enter");

  await expect(page.getByText("Name is required")).toBeVisible();

  await page.getByLabel("Name").fill("x");
  await page.getByRole("button", { name: "Update tag" }).press("Enter");

  await expect(page.getByText("Name is too short")).toBeVisible();

  await page.getByLabel("Name").fill("x".repeat(46));
  await page.getByRole("button", { name: "Update tag" }).press("Enter");

  await expect(page.getByText("Name is too long")).toBeVisible();

  await page.getByLabel("Name").fill("x!");
  await page.getByRole("button", { name: "Update tag" }).press("Enter");

  await expect(
    page.getByText(
      "Name can only include letters, numbers, hyphens, and periods",
    ),
  ).toBeVisible();

  await page.getByLabel("Name").fill("tag2");
  await page.getByRole("button", { name: "Update tag" }).press("Enter");

  await expect(page.getByText("Name must be unique")).toBeVisible();
});

test("[AUTH] User can delete a tag", async ({ page, login }) => {
  await login("/tags/tid0/edit");

  await expect(
    page.getByRole("button", { name: "Delete tag", exact: true }),
  ).toBeVisible();
});
