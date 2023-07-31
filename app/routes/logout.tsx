import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { logout } from "~/utils/auth.server";
import { HOME_ROUTE } from "~/utils/misc";

export async function action({ request }: ActionArgs) {
  return logout(request);
}

export async function loader() {
  return redirect(HOME_ROUTE);
}
