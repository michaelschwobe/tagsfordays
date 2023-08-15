import type { V2_MetaFunction } from "@remix-run/node";
import { Link, useLocation } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Icon } from "~/components/icon";
import { formatMetaTitle } from "~/utils/misc";

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("Error");

  return [{ title }];
};

export default function NotFoundPage() {
  return <ErrorBoundary />;
}

export function ErrorBoundary() {
  const location = useLocation();

  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <main>
            <h1>
              <Icon type="alert-triangle" />
              <span>Error</span>
            </h1>

            <p>
              We can't find this page: <code>{location.pathname}</code>
            </p>

            <div>
              <Link to="/">
                <Icon type="home" />
                Back to home
              </Link>
            </div>
          </main>
        ),
      }}
    />
  );
}
