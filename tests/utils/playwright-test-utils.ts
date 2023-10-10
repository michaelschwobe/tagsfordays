import type { Page } from "@playwright/test";
import { test as base, expect } from "@playwright/test";

const USERNAME = "someuser";
const PASSWORD = "somepass";

export async function login({
  page,
  to: redirectTo = "/",
  username = USERNAME,
  password = PASSWORD,
}: {
  page: Page;
  to?: string;
  username?: string;
  password?: string;
}) {
  await page.goto(`/login?redirectTo=${redirectTo}`);
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Username").press("Tab");
  await page.getByLabel("Password").fill(password);
  await page.getByLabel("Password").press("Enter");
  return { username, redirectTo };
}

export async function logout({ page }: { page: Page }) {
  await page
    .getByRole("button", { name: "Log out", exact: true })
    .press("Enter");
}

export function encodeUrlRedirectTo({
  page,
  url,
}: {
  page: Page;
  url: string;
}) {
  const { pathname, searchParams } = new URL(url, page.url());
  const encodedRedirectTo = encodeURIComponent(
    searchParams.get("redirectTo") || "/",
  );
  return `${pathname}?redirectTo=${encodedRedirectTo}`;
}

const test = base.extend({});

export { expect, test };
