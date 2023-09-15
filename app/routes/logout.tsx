import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { logout } from "~/utils/auth.server";
import { safeRedirect } from "~/utils/misc";

export async function action({ request }: ActionFunctionArgs) {
  return logout(request);
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const safeRedirectTo = safeRedirect(url.searchParams.get("redirectTo"));

  return redirect(safeRedirectTo);
}
