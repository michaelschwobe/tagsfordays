import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/tags/tid0/split");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/tags/tid0/split" }),
  );
});

test("[AUTH] User can cancel viewing the form/page", async ({
  page,
  login,
}) => {
  // Login from a different page so we have a history to redirect back to.
  await login();
  await page.goto("/tags/tid0/split");

  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page).toHaveURL("/");
});

test("[AUTH] User can view the page title", async ({ page, login }) => {
  await login("/tags/tid0/split");

  await expect(page).toHaveTitle(/^Splitting Tag… \|/);
});

test("[AUTH] User can NOT split tag if Target(s) is INVALID/MISSING", async ({
  page,
  login,
}) => {
  await login("/tags/tid0/split");

  await page.getByLabel("Target").fill("");
  await page.getByRole("button", { name: "Split tag" }).press("Enter");

  await expect(page.getByText("Name is required")).toBeVisible();

  await page.getByLabel("Target").fill("x");
  await page.getByRole("button", { name: "Split tag" }).press("Enter");

  await expect(page.getByText("Name is too short")).toBeVisible();

  await page.getByLabel("Target").fill("x".repeat(46));
  await page.getByRole("button", { name: "Split tag" }).press("Enter");

  await expect(page.getByText("Name is too long")).toBeVisible();

  await page.getByLabel("Target").fill("x!");
  await page.getByRole("button", { name: "Split tag" }).press("Enter");

  await expect(
    page.getByText(
      "Name can only include letters, numbers, hyphens, and periods",
    ),
  ).toBeVisible();

  await page.getByLabel("Target").fill("t1,tag2,t3");
  await page.getByRole("button", { name: "Split tag" }).press("Enter");

  await expect(page.getByText("Name must be unique")).toBeVisible();
});
