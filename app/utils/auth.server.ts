import { createCookieSessionStorage, redirect } from "@remix-run/node";
import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";
import { USER_LOGIN_ROUTE, safeRedirect } from "~/utils/misc";

const USER_SESSION_KEY = "userId";
const USER_SESSION_AGE = 60 * 60 * 24 * 7; // 7 days

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSessionFromRequest(request: Request) {
  const cookie = request.headers.get("Cookie");
  const session = await sessionStorage.getSession(cookie);
  return session;
}

export async function getUserId(
  request: Request,
): Promise<User["id"] | undefined> {
  const session = await getSessionFromRequest(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) {
    return null;
  }

  const user = await getUserById(userId);
  if (user) {
    return user;
  }

  throw await logout(request);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`${USER_LOGIN_ROUTE}?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) {
    return user;
  }

  throw await logout(request);
}

export async function createUserSession({
  redirectTo,
  remember,
  request,
  userId,
}: {
  redirectTo: string;
  remember: boolean;
  request: Request;
  userId: string;
}) {
  const session = await getSessionFromRequest(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? USER_SESSION_AGE : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const url = new URL(request.url);
  const safeRedirectTo = safeRedirect(url.searchParams.get("redirectTo"));
  const session = await getSessionFromRequest(request);
  return redirect(safeRedirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
