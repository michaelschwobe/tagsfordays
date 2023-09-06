import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { combineHeaders } from "~/utils/misc";
import type { OptionalToast } from "~/utils/toast-validation";
import { ToastSchema } from "~/utils/toast-validation";

export const TOAST_KEY = "toast";

export const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "en_toast",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: process.env.SESSION_SECRET.split(","),
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getToast(request: Request) {
  const cookie = request.headers.get("Cookie");
  const session = await toastSessionStorage.getSession(cookie);

  const result = ToastSchema.safeParse(session.get(TOAST_KEY));
  const toast = result.success ? result.data : null;

  if (toast) {
    const toastHeader = await toastSessionStorage.commitSession(session);
    const headers = new Headers({ "set-cookie": toastHeader });
    return { toast, headers };
  }

  return { toast: null, headers: null };
}

export async function createToastHeaders(optionalToast: OptionalToast) {
  const toast = ToastSchema.parse(optionalToast);

  const session = await toastSessionStorage.getSession();
  session.flash(TOAST_KEY, toast);
  const cookie = await toastSessionStorage.commitSession(session);

  return new Headers({ "set-cookie": cookie });
}

export async function redirectWithToast(
  url: string,
  optionalToast: OptionalToast,
  responseInit?: ResponseInit,
) {
  const toastHeaders = await createToastHeaders(optionalToast);
  const headers = combineHeaders(responseInit?.headers, toastHeaders);
  return redirect(url, { ...responseInit, headers });
}
