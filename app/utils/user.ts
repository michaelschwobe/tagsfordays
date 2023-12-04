import { type SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";
import { type loader as rootLoader } from "~/root";

export const USER_LOGIN_ROUTE = "/login";
export const USER_LOGOUT_ROUTE = "/logout";

function isUser(user: any): user is SerializeFrom<typeof rootLoader>["user"] {
  return user && typeof user === "object" && typeof user.id === "string";
}

export function useOptionalUser() {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}
