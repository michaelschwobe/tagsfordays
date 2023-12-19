import { encodeUrl, expect, test } from "../utils/playwright-test-utils";

test("User can view the page title", async ({ page }) => {
  await page.goto("/books");

  await expect(page).toHaveTitle(/^Books \|/);
});

test("User can view books", async ({ page }) => {
  await page.goto("/books");

  await expect(page.getByRole("link", { name: "Book 2" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book 1" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book 0" })).toBeVisible();
});

test("User can search books by keyword", async ({ page }) => {
  await page.goto("/books");

  await page.getByPlaceholder("Search for…").fill("k 2");
  await page.getByPlaceholder("Search for…").press("Enter");

  await expect(page).toHaveURL("/books?searchValue=k+2&searchKey=title");
  await expect(
    page.getByTestId("search-form").getByRole("button", { name: "Title" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByPlaceholder("Search for…")).toHaveValue("k 2");
  await expect(page.getByRole("link", { name: "Book 2" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book 1" })).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Book 0" })).not.toBeVisible();
});

test("User can search books by keyword AND column name", async ({ page }) => {
  await page.goto("/books");

  await page.getByPlaceholder("Search for…").fill("sum");
  await page
    .getByTestId("search-form")
    .getByRole("button", { name: "Content" })
    .press("Enter");

  await expect(page).toHaveURL("/books?searchValue=sum&searchKey=content");
  await expect(page.getByPlaceholder("Search for…")).toHaveValue("sum");
  await expect(
    page.getByTestId("search-form").getByRole("button", { name: "Content" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: "Book 2" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book 1" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book 0" })).not.toBeVisible();
});

test("User can reset search form", async ({ page }) => {
  await page.goto("/books?searchValue=badvalue&searchKey=tags");

  await expect(page.getByPlaceholder("Search for…")).toHaveValue("badvalue");
  await expect(
    page.getByTestId("search-form").getByRole("button", { name: "Tags" }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("link", { name: "Reset" }).click();

  await expect(page).toHaveURL("/books");
  await expect(page.getByPlaceholder("Search for…")).toHaveValue("");
  await expect(
    page.getByTestId("search-form").getByRole("button", { name: "Tags" }),
  ).toHaveAttribute("aria-pressed", "false");
});

test("User can go to a book's detail page", async ({ page }) => {
  await page.goto("/books");

  await page.getByRole("link", { name: "Book 2", exact: true }).click();

  await expect(page).toHaveTitle(/^Book 2 \|/);
  await expect(page).toHaveURL(/\/books\/[a-zA-Z0-9]+$/);
});

test("User can NOT view books if data is INVALID/MISSING", async ({ page }) => {
  await page.goto("/books");

  await page.getByPlaceholder("Search for…").fill("badvalue");
  await page
    .getByRole("main")
    .locator("form")
    .getByRole("button", { name: "Tags" })
    .press("Enter");

  await expect(page).toHaveURL("/books?searchValue=badvalue&searchKey=tags");
  await expect(
    page.getByRole("heading", { name: "No Books Found" }),
  ).toBeVisible();
});

test("User can NOT search books if keyword is INVALID", async ({ page }) => {
  await page.goto("/books");

  await page.getByPlaceholder("Search for…").fill("x");
  await page.getByPlaceholder("Search for…").press("Enter");

  await expect(page.getByText("Search term is too short")).toBeVisible();

  await page.getByPlaceholder("Search for…").fill("x".repeat(46));
  await page.getByPlaceholder("Search for…").press("Enter");

  await expect(page.getByText("Search term is too long")).toBeVisible();
});

test("User can NOT add a book", async ({ page }) => {
  await page.goto("/books");

  await page.getByRole("link", { name: "Add book", exact: true }).click();

  await expect(page).toHaveURL("/login?redirectTo=/books/new");
});

test("User can NOT (un)favorite a book", async ({ page }) => {
  await page.goto("/books");

  await page
    .getByRole("row", { name: "Book 1" })
    .getByRole("button", { name: "Unfavorite book", exact: true })
    .click();

  await expect(page).toHaveURL(
    encodeUrl({ page, url: "/login?redirectTo=/books/bkid1/edit" }),
  );
});

test("[AUTH] User can add a book", async ({ page, login }) => {
  await login("/books");

  await page.getByRole("link", { name: "Add book", exact: true }).click();

  await page.waitForURL("/books/new");
});

test("[AUTH] User can (un)favorite a book", async ({ page, login }) => {
  await login("/books");

  await expect(
    page
      .getByRole("row", { name: "Book 1" })
      .getByRole("button", { name: "Unfavorite book", exact: true }),
  ).toBeVisible();
});
