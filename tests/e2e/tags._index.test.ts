import { expect, test } from "../utils/playwright-test-utils";

test.describe("Unauthenticated", () => {
  test("User can view the page title", async ({ page }) => {
    await page.goto("/tags");

    await expect(page).toHaveTitle(/^Tags \|/);
  });

  test("User can view tags", async ({ page }) => {
    await page.goto("/tags");

    const tagNameRegex = /^[a-zA-Z0-9-.\s]+\s\d+/;
    const tags = await page.getByRole("link", { name: tagNameRegex }).all();

    expect(tags.length).toBe(11);
  });

  test("User can view tags sorted by Name", async ({ page }) => {
    await page.goto("/tags");

    await expect(
      page.getByText(
        "taaaaaaaaaaaaag that is exactly 45 characters 0tag1 6tag10 0tag2 5tag3 4tag4 3tag5 2tag6 1tag7 0tag8 0tag9 0",
      ),
    ).toBeVisible();
  });

  test("User can view tags sorted by Relations", async ({ page }) => {
    await page.goto("/tags");

    await page.getByRole("button", { name: "Relations" }).click();

    await expect(
      page.getByText(
        "tag1 6tag2 5tag3 4tag4 3tag5 2tag6 1taaaaaaaaaaaaag that is exactly 45 characters 0tag10 0tag7 0tag8 0tag9 0",
      ),
    ).toBeVisible();
  });

  test("User can go to a tag's detail page", async ({ page }) => {
    await page.goto("/tags");

    await page.getByRole("link", { name: "tag1 6", exact: true }).click();

    await expect(page).toHaveURL("/tags/tid0");
  });

  test("User can NOT add a tag", async ({ page }) => {
    await page.goto("/tags");

    await page.getByRole("link", { name: "Add tag", exact: true }).click();

    await expect(page).toHaveURL("/login?redirectTo=/tags/new");
  });
});

test.describe("Authenticated", () => {
  test("User can add a tag", async ({ page, login }) => {
    await login("/tags");

    await page.getByRole("link", { name: "Add tag", exact: true }).click();

    await page.waitForURL("/tags/new");
  });
});
