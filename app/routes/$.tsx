import type { MetaFunction } from "@remix-run/node";
import { useLocation } from "@remix-run/react";
import { GeneralErrorBoundary, MainError } from "~/components/error-boundary";
import { Code } from "~/components/ui/code";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { formatMetaTitle } from "~/utils/misc";

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: formatMetaTitle("Error") }];
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
          <MainError>
            <p className="mb-4">
              We can&rsquo;t find this page: <Code>{location.pathname}</Code>
            </p>
            <div>
              <LinkButton to="/">
                <Icon type="home" />
                Back to home
              </LinkButton>
            </div>
          </MainError>
        ),
      }}
    />
  );
}
