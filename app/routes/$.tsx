import type { V2_MetaFunction } from "@remix-run/node";
import { useLocation } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
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
          <Main>
            <h1 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Icon type="alert-triangle" />
              Error
            </h1>

            <p className="mb-4">
              We can't find this page: <code>{location.pathname}</code>
            </p>

            <div>
              <LinkButton to="/">
                <Icon type="home" />
                Back to home
              </LinkButton>
            </div>
          </Main>
        ),
      }}
    />
  );
}
