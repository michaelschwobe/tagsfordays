import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/tags/tid0/merge");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/tags/tid0/merge" }),
  );
});

test("[AUTH] User can cancel viewing the form/page", async ({
  page,
  login,
}) => {
  // Login from a different page so we have a history to redirect back to.
  await login();
  await page.goto("/tags/tid0/merge");

  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page).toHaveURL("/");
});

test("[AUTH] User can view the page title", async ({ page, login }) => {
  await login("/tags/tid0/merge");

  await expect(page).toHaveTitle(/^Merging Tag… \|/);
});

test("[AUTH] User can NOT merge tag if Target is INVALID/MISSING", async ({
  page,
  login,
}) => {
  await login("/tags/tid0/merge");

  await page.getByLabel("Target").click();
  await page.locator("body").press("Escape");
  await page.getByRole("button", { name: "Merge tag" }).press("Enter");

  await expect(page.getByText("Name is required")).toBeVisible();
});
