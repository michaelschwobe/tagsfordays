import { cssBundleHref } from "@remix-run/css-bundle";
import { json, type LinksFunction, type LoaderArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Header } from "~/components/header";
import { Landmark } from "~/components/ui/landmark";
import tailwindStylesheetUrl from "~/tailwind.css";
import { getUser } from "~/utils/auth.server";
import { getEnv } from "~/utils/env.server";

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
      <body className="h-full bg-white text-gray-600">
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

  return (
    <Document env={loaderData.ENV}>
      <Landmark type="trigger" slug="main" label="main content" />

      <Header />

      <Landmark type="target" slug="main" label="main content" />
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  return (
    <Document>
      <Landmark type="trigger" slug="main" label="main content" />

      <Header />

      <Landmark type="target" slug="main" label="main content" />
      <GeneralErrorBoundary />
    </Document>
  );
}
