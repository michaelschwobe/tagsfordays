import * as cookie from "cookie";

export type Theme = "light" | "dark";

const cookieName = "en_theme";

export function getThemeCookie(request: Request): Theme | null {
  const cookieHeader = request.headers.get("cookie");

  const parsed = cookieHeader
    ? cookie.parse(cookieHeader)[cookieName]
    : "light";

  if (parsed === "light" || parsed === "dark") {
    return parsed;
  }

  return null;
}

export function setThemeCookie(theme: Theme | "system"): string {
  if (theme === "system") {
    return cookie.serialize(cookieName, "", { path: "/", maxAge: -1 });
  }

  return cookie.serialize(cookieName, theme, { path: "/" });
}
