import { expect, test } from "../utils/playwright-test-utils";

test("Error boundary caught", async ({ page }) => {
  const response = await page.goto("/someroute");

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle(/error | tagsfordays/i);

  await expect(page.getByRole("heading", { name: /error/i })).toBeVisible();
  await expect(
    page.getByText(/we can’t find this page: \/someroute/i),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
});
