import { cssBundleHref } from "@remix-run/css-bundle";
import { json, type LinksFunction, type LoaderArgs } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import tailwindStylesheetUrl from "~/tailwind.css";
import { getUser } from "~/utils/auth.server";
import { getEnv } from "~/utils/env.server";
import { USER_LOGIN_ROUTE, USER_LOGOUT_ROUTE } from "~/utils/misc";
import { useOptionalUser } from "~/utils/user";
import { GeneralErrorBoundary } from "./components/error-boundary";

export async function loader({ request }: LoaderArgs) {
  const ENV = getEnv();
  const user = await getUser(request);
  return json({ ENV, user });
}

export const links: LinksFunction = () => {
  return [
    { rel: "preload", href: tailwindStylesheetUrl, as: "style" },
    ...(cssBundleHref
      ? [{ rel: "preload", href: cssBundleHref, as: "style" }]
      : []),

    { rel: "stylesheet", href: tailwindStylesheetUrl },
    ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  ];
};

function Document({
  children,
  env = {},
}: {
  children: React.ReactNode;
  env?: Record<string, string>;
}) {
  return (
    <html lang="en" className="h-full overflow-x-hidden">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  const loaderData = useLoaderData<typeof loader>();
  const optionalUser = useOptionalUser();

  return (
    <Document env={loaderData.ENV}>
      <header>
        <nav>
          <div>
            <Link to="/">Home</Link>
            <Link to="/bookmarks">Bookmarks</Link>
            <Link to="/tags">Tags</Link>
          </div>
          <div>
            {optionalUser ? (
              <div>
                {optionalUser.username}
                <Form method="POST" action={USER_LOGOUT_ROUTE}>
                  <button type="submit">Log Out</button>
                </Form>
              </div>
            ) : (
              <Link to={USER_LOGIN_ROUTE}>Log In</Link>
            )}
          </div>
        </nav>
      </header>

      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralErrorBoundary />
    </Document>
  );
}
