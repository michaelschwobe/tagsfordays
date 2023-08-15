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
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Icon } from "~/components/icon";
import tailwindStylesheetUrl from "~/tailwind.css";
import { getUser } from "~/utils/auth.server";
import { getEnv } from "~/utils/env.server";
import { USER_LOGIN_ROUTE, USER_LOGOUT_ROUTE } from "~/utils/misc";
import { useOptionalUser } from "~/utils/user";

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

    { rel: "preload", href: "/icons.svg", as: "image", type: "image/svg+xml" },

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
            <Link to="/">
              <Icon type="home" /> <span>Home</span>
            </Link>
            <Link to="/bookmarks">
              <Icon type="bookmarks" /> <span>Bookmarks</span>
            </Link>
            <Link to="/tags">
              <Icon type="tags" /> <span>Tags</span>
            </Link>
          </div>
          <div>
            {optionalUser ? (
              <Form method="POST" action={USER_LOGOUT_ROUTE}>
                <button type="submit">
                  <Icon type="log-out" />
                  <span className="sr-only">
                    Log Out {optionalUser.username}
                  </span>
                </button>
              </Form>
            ) : (
              <Link to={USER_LOGIN_ROUTE}>
                <Icon type="log-in" />
                <span className="sr-only">Log In</span>
              </Link>
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
