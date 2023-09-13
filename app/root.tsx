import { conform } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { cssBundleHref } from "@remix-run/css-bundle";
import type {
  ActionArgs,
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
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
import { Toaster } from "~/components/ui/toast";
import tailwindStylesheetUrl from "~/tailwind.css";
import { getUser } from "~/utils/auth.server";
import { ClientHintCheck, getClientHints } from "~/utils/client-hints";
import { getEnv } from "~/utils/env.server";
import { useTheme } from "~/utils/theme";
import { UpdateThemeFormSchema } from "~/utils/theme-validation";
import type { Theme } from "~/utils/theme.server";
import { getThemeCookie, setThemeCookie } from "~/utils/theme.server";
import { getToast } from "~/utils/toast.server";
import {
  APP_AUTHOR_FULLNAME,
  APP_NAME,
  APP_THEME_COLOR_DARK,
  APP_THEME_COLOR_LIGHT,
  APP_URL,
  cn,
  combineHeaders,
  formatMetaTitle,
  getDomainUrl,
  invariantResponse,
} from "./utils/misc";

export async function loader({ request }: LoaderArgs) {
  const ENV = getEnv();

  const user = await getUser(request);

  const requestInfo = {
    clientHints: getClientHints(request),
    origin: getDomainUrl(request),
    path: new URL(request.url).pathname,
    userPrefs: { theme: getThemeCookie(request) },
  };

  const { toast, headers: toastHeaders } = await getToast(request);

  return json(
    { ENV, requestInfo, toast, user },
    { headers: combineHeaders(toastHeaders) },
  );
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get(conform.INTENT);

  invariantResponse(intent === "update-theme", "Invalid intent");

  const submission = parse(formData, { schema: UpdateThemeFormSchema });

  if (!submission.value || submission.intent !== "update-theme") {
    return json(submission);
  }

  return json(submission, {
    headers: { "set-cookie": setThemeCookie(submission.value.theme) },
  });
}

export const links: LinksFunction = () => {
  return [
    /* styles (preloaded) */
    { rel: "preload", href: tailwindStylesheetUrl, as: "style" },
    ...(cssBundleHref
      ? [{ rel: "preload", href: cssBundleHref, as: "style" }]
      : []),

    /* icons (preloaded) */
    { rel: "preload", href: "/icons.svg", as: "image", type: "image/svg+xml" },

    /* favicons/manifest */
    {
      rel: "apple-touch-icon",
      href: "/favicons/apple-touch-icon.png",
      sizes: "180x180",
    },
    {
      rel: "alternate icon",
      href: "/favicons/favicon-32x32.png",
      type: "image/png",
      sizes: "32x32",
    },
    {
      rel: "alternate icon",
      href: "/favicons/favicon-16x16.png",
      type: "image/png",
      sizes: "16x16",
    },
    {
      rel: "manifest",
      href: "/site.webmanifest",
      crossOrigin: "use-credentials",
    },
    {
      rel: "mask-icon",
      href: "/favicons/mask-icon.svg",
      color: APP_THEME_COLOR_LIGHT,
    },
    { rel: "icon", href: "/favicons/favicon.svg", type: "image/svg+xml" },

    /* styles */
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  ];
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    const title = formatMetaTitle("Error");
    return [{ title }];
  }
  return [];
};

function Document({
  children,
  env = {},
  theme,
}: {
  children: React.ReactNode;
  env?: Record<string, string>;
  theme?: Theme;
}) {
  return (
    <html lang="en" className={cn("h-full overflow-x-hidden", theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <ClientHintCheck />
        <Meta />
        <meta name="color-scheme" content={theme ?? "normal"} />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content={APP_THEME_COLOR_LIGHT}
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content={APP_THEME_COLOR_DARK}
        />
        <meta name="msapplication-TileColor" content={APP_THEME_COLOR_LIGHT} />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="application-name" content={APP_NAME} />
        <meta name="author" content={APP_AUTHOR_FULLNAME} />
        <link rel="canonical" href={APP_URL} />
        <Links />
      </head>
      <body className="h-full bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400">
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
  const theme = useTheme();

  return (
    <Document env={loaderData.ENV} theme={theme}>
      <Landmark type="trigger" slug="main" label="main content" />

      <Header userTheme={loaderData.requestInfo.userPrefs.theme} />

      <Landmark type="target" slug="main" label="main content" />
      <Outlet />

      <Toaster toast={loaderData.toast} />
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
