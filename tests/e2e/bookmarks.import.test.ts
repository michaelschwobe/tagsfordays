import path from "node:path";
import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can NOT view the page", async ({ page }) => {
  await page.goto("/bookmarks/import");

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/bookmarks/import" }),
  );
});

test("[AUTH] User can cancel viewing the form/page", async ({
  page,
  login,
}) => {
  // Login from a different page so we have a history to redirect back to.
  await login();
  await page.goto("/bookmarks/import");

  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page).toHaveURL("/");
});

test("[AUTH] User can view the page title", async ({ page, login }) => {
  await login("/bookmarks/import");

  await expect(page).toHaveTitle(/^Import Bookmarks \|/);
});

test("[AUTH] User can NOT import bookmarks if file type is INVALID", async ({
  page,
  login,
}) => {
  const fileChooserPromise = page.waitForEvent("filechooser");
  const FILE_0 = path.join(
    process.cwd(),
    "tests/fixtures/imports/bookmarks-0.txt",
  );
  await login("/bookmarks/import");

  await page.getByLabel("Files").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(FILE_0);
  await page.getByRole("button", { name: "Upload" }).press("Enter");

  await expect(page.getByText("File must be of type text/html")).toBeVisible();

  await page.getByRole("link", { name: "Reset" }).click();

  await expect(
    page.getByText("File must be of type text/html"),
  ).not.toBeVisible();
});

/* import { prisma } from "~/utils/db.server";
test("[AUTH] User can import bookmarks if file type is VALID", async ({
  page,
  login,
}) => {
  const fileChooserPromise = page.waitForEvent("filechooser");
  const FILE_0 = path.join(
    process.cwd(),
    "tests/fixtures/imports/bookmarks-0.html",
  );
  const ITEM_URL_REGEX = /^https:\/\/example\.com/;
  await login("/bookmarks/import");

  await page.getByLabel("Files").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(FILE_0);
  await page.getByRole("button", { name: "Upload" }).press("Enter");

  await expect(page).toHaveURL("/bookmarks");
  await expect(page.getByText("Bookmarks imported")).toBeVisible();
  await expect(page.getByRole("link", { name: ITEM_URL_REGEX })).toHaveCount(4);

  await prisma.bookmark.deleteMany({
    where: { url: { contains: "example.com" } },
  });
  await page.reload();
  await expect(page.getByRole("link", { name: ITEM_URL_REGEX })).toHaveCount(0);
}); */
