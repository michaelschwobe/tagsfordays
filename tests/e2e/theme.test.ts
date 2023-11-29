import { expect, test } from "../utils/playwright-test-utils";

test("User can view the page title", async ({ page, login }) => {
  await login("/theme");

  await expect(page).toHaveTitle(/^Theme \|/);
});
